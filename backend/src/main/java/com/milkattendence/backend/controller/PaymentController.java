package com.milkattendence.backend.controller;

import com.milkattendence.backend.model.Customer;
import com.milkattendence.backend.model.Payment;
import com.milkattendence.backend.repository.CustomerRepository;
import com.milkattendence.backend.repository.MilkEntryRepository;
import com.milkattendence.backend.repository.PaymentRepository;
import com.milkattendence.backend.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*; 

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentRepository paymentRepository;
    private final CustomerRepository customerRepository;
    private final MilkEntryRepository milkEntryRepository;
    private final EmailService emailService;

    @Autowired
    public PaymentController(
            PaymentRepository paymentRepository,
            CustomerRepository customerRepository,
            MilkEntryRepository milkEntryRepository,
            EmailService emailService
    ) {
        this.paymentRepository = paymentRepository;
        this.customerRepository = customerRepository;
        this.milkEntryRepository = milkEntryRepository;
        this.emailService = emailService;
    }

    /* ============================
       GET PAYMENTS
       ============================ */
    @GetMapping("/{shift}")
    @Transactional
    public Map<String, Object> getPaymentsByShift(
            @PathVariable String shift,
            @RequestParam Long userId
    ) {
        Map<String, Object> resp = new HashMap<>();
        LocalDate today = LocalDate.now(IST);

        try {
            List<Customer> customers =
                    customerRepository.findByShiftAndUserIdAndActive(shift, userId, true);

            for (Customer c : customers) {
                String name = c.getFullName() != null ? c.getFullName() : c.getNickname();
                if (name == null || name.isBlank()) continue;

                if (paymentRepository
                        .findAllMatchingForUser(shift, today, name, userId)
                        .isEmpty()) {

                    Payment p = new Payment(name, shift, false, today, userId);
                    paymentRepository.save(p);
                }
            }

            List<Payment> payments =
                    paymentRepository.findByShiftAndDateAndUserId(shift, today, userId);

            payments.sort(Comparator.comparing(Payment::getCustomerName));
            resp.put("success", true);
            resp.put("payments", payments);

        } catch (Exception e) {
            resp.put("success", false);
            resp.put("error", e.getMessage());
        }

        return resp;
    }

    /* ============================
       SAVE PAYMENT
       ============================ */
    @PostMapping
    @Transactional
    public Map<String, Object> savePayment(@RequestBody Map<String, Object> body) {

        Map<String, Object> resp = new HashMap<>();

        try {
            String customerName = Objects.toString(body.get("customerName"), "");
            String shift = Objects.toString(body.get("shift"), "");
            boolean paid = Boolean.parseBoolean("" + body.get("paid"));
            Long userId = Long.parseLong("" + body.get("userId"));

            LocalDate today = LocalDate.now(IST);

            List<Payment> existing =
                    paymentRepository.findAllMatchingForUser(
                            shift, today, customerName, userId
                    );

            Payment p = existing.isEmpty() ? new Payment() : existing.get(0);
            p.setCustomerName(customerName);
            p.setShift(shift);
            p.setPaid(paid);
            p.setDate(today);
            p.setUserId(userId);

            paymentRepository.save(p);
            resp.put("success", true);

        } catch (Exception e) {
            resp.put("success", false);
            resp.put("error", e.getMessage());
        }

        return resp;
    }

    /* ============================
       SAVE REMINDER SETTINGS
       ============================ */
    @PostMapping("/save-reminder")
    public Map<String, Object> saveReminder(@RequestBody Map<String, Object> body) {

        Long userId = Long.parseLong("" + body.get("userId"));
        String shift = Objects.toString(body.get("shift"), "Morning");
        String time = Objects.toString(body.get("time"), "21:00");
        boolean enabled = Boolean.parseBoolean("" + body.get("enabled"));

        Integer repeatDays = 1;
        try {
            repeatDays = Integer.parseInt(Objects.toString(body.getOrDefault("repeatDays", "1")));
        } catch (Exception ignored) {}
        if (repeatDays == null || repeatDays <= 0) repeatDays = 1;

        logger.info("Saving reminder settings: user={}, shift={}, enabled={}, time={}, repeatDays={}", userId, shift, enabled, time, repeatDays);

        customerRepository.updateReminderSettings(
                userId,
                enabled,
                LocalTime.parse(time),
                shift,
                repeatDays
        );

        // If the reminder is being enabled (or re-saved), clear lastReminderSent for this shift
        // so that a newly chosen time can trigger an email immediately (if applicable)
        if (enabled) {
            customerRepository.clearLastReminderSentForShift(userId, shift);
            logger.info("Cleared lastReminderSent for user={} shift={} to allow immediate send", userId, shift);
        }

        return Map.of("success", true);
    }

    /* ============================
       REMINDER CHECK
       ============================ */
    @GetMapping("/check-reminders")
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 * * * * *") // run at the top of every minute
    public void checkReminders() {

        LocalTime now = LocalTime.now(IST).withSecond(0);
        LocalDate today = LocalDate.now(IST);

        logger.info("Running checkReminders at {} (IST)", now);

        List<Customer> users = customerRepository.findAllWithRemindersEnabled();

        // Ensure we only send one reminder per (userId, shift) in a single run
        java.util.Set<String> processed = new java.util.HashSet<>();

        for (Customer u : users) {

            if (u.getReminderTime() == null) continue;

            String userShiftKey = u.getUserId() + ":" + (u.getReminderShift() == null ? "Morning" : u.getReminderShift());
            if (processed.contains(userShiftKey)) {
                logger.debug("Skipping already processed key {}", userShiftKey);
                continue; // already processed this user's shift
            }

            int interval = (u.getReminderIntervalDays() == null || u.getReminderIntervalDays() <= 0) ? 1 : u.getReminderIntervalDays();

            boolean eligibleByDate = false;
            if (u.getLastReminderSentAt() == null) {
                eligibleByDate = true;
            } else {
                LocalDate next = u.getLastReminderSentAt().toLocalDate().plusDays(interval);
                if (!today.isBefore(next)) eligibleByDate = true;
            }

            logger.debug("Evaluating reminder for user={}, shift={}, reminderTime={}, lastSent={}, eligibleByDate={}", u.getUserId(), u.getReminderShift(), u.getReminderTime(), u.getLastReminderSentAt(), eligibleByDate);

            if (!eligibleByDate) continue;

            if (now.getHour() == u.getReminderTime().getHour()
                    && now.getMinute() == u.getReminderTime().getMinute()) {

                // Build scheduled datetime at minute precision and attempt an atomic claim
                LocalDateTime scheduledDateTime = LocalDateTime.of(today, u.getReminderTime()).withSecond(0);
                LocalDateTime nowDateTime = LocalDateTime.now(IST);

                int claimed = customerRepository.claimReminderForShift(u.getUserId(), u.getReminderShift(), nowDateTime, scheduledDateTime);
                if (claimed == 0) {
                    logger.debug("Reminder already claimed by another instance for user={}, shift={}", u.getUserId(), u.getReminderShift());
                    continue;
                }

                try {
                    sendUnpaidEmailInternal(u.getUserId(), u.getReminderShift());
                    processed.add(userShiftKey);
                    logger.info("Reminder sent for user={}, shift={}", u.getUserId(), u.getReminderShift());
                } catch (Exception e) {
                    // If sending failed, claim remains set; we log and continue
                    logger.error("Failed to send reminder email for user {}: {}", u.getUserId(), e.getMessage());
                }
            }
        }
    }

    /* ============================
       SENDGRID EMAIL
       ============================ */
    private void sendUnpaidEmailInternal(Long userId, String shift) throws Exception {
            LocalDate today = LocalDate.now(IST);

            List<Payment> unpaid =
                    paymentRepository.findByShiftAndPaidFalseAndDateAndUserId(
                            shift, today, userId
                    );

            if (unpaid.isEmpty()) {
                logger.info("No unpaid customers for user={}, shift={} on {}", userId, shift, today);
                return;
            }

            logger.info("Preparing unpaid email: user={}, shift={}, count={}", userId, shift, unpaid.size());

            StringBuilder html = new StringBuilder();
            html.append("<h3>Unpaid Customers — ").append(shift).append("</h3>");
            html.append("<table border='1' cellpadding='6'>")
                .append("<tr><th>Name</th><th>Litres</th><th>Rate</th><th>Total</th></tr>");

            for (Payment p : unpaid) {

                Double litres =
                        milkEntryRepository.getTotalLitresForCustomer(
                                p.getCustomerName(),
                                p.getShift(),
                                p.getUserId()
                        );

                double rate =
                        customerRepository
                                .findCustomerByNameForUser(
                                        p.getUserId(),
                                        p.getShift(),
                                        p.getCustomerName()
                                )
                                .map(Customer::getPricePerLitre)
                                .orElse(0.0);

                html.append("<tr>")
                    .append("<td>").append(p.getCustomerName()).append("</td>")
                    .append("<td>").append(String.format("%.2f", litres)).append("</td>")
                    .append("<td>").append(String.format("%.2f", rate)).append("</td>")
                    .append("<td><b>")
                    .append(String.format("%.2f", litres * rate))
                    .append("</b></td>")
                    .append("</tr>");
            }

            html.append("</table>");

            emailService.sendHtmlEmail(
                    "Unpaid Customers (" + shift + ") - " + today,
                    html.toString(),
                    userId,
                    shift
            );
    }

    @PostMapping("/trigger-reminder")
    public Map<String, Object> triggerReminder(
            @RequestParam Long userId,
            @RequestParam String shift
    ) {
        try {
            sendUnpaidEmailInternal(userId, shift);
            customerRepository.updateLastReminderSentForShift(userId, shift, LocalDateTime.now(IST));
            return Map.of("success", true, "message", "Triggered reminder");
        } catch (Exception e) {
            logger.error("Manual trigger failed for user {} shift {}: {}", userId, shift, e.getMessage());
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    /* ============================
       MANUAL EMAIL TRIGGER
       ============================ */
    @PostMapping("/email/unpaid")
    public Map<String, Object> sendUnpaidEmail(
            @RequestParam String shift,
            @RequestParam Long userId
    ) {
        try {
            sendUnpaidEmailInternal(userId, shift);
            return Map.of("success", true, "message", "Email sent to admin");
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("success", false, "error", e.getMessage());
        }
    }


}
