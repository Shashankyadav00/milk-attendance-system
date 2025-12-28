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
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");

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

        customerRepository.updateReminderSettings(
                userId,
                enabled,
                LocalTime.parse(time),
                shift,
                repeatDays
        );

        return Map.of("success", true);
    }

    /* ============================
       REMINDER CHECK
       ============================ */
    @GetMapping("/check-reminders")
    @org.springframework.scheduling.annotation.Scheduled(cron = "0 * * * * *") // run at the top of every minute
    public void checkReminders() {

        LocalTime now = LocalTime.now(IST);
        LocalDate today = LocalDate.now(IST);

        List<Customer> users = customerRepository.findAllWithRemindersEnabled();

        for (Customer u : users) {

            if (u.getReminderTime() == null) continue;

            int interval = (u.getReminderIntervalDays() == null || u.getReminderIntervalDays() <= 0) ? 1 : u.getReminderIntervalDays();

            boolean eligibleByDate = false;
            if (u.getLastReminderSent() == null) {
                eligibleByDate = true;
            } else {
                LocalDate next = u.getLastReminderSent().plusDays(interval);
                if (!today.isBefore(next)) eligibleByDate = true;
            }

            if (!eligibleByDate) continue;

            if (now.getHour() == u.getReminderTime().getHour()
                    && now.getMinute() == u.getReminderTime().getMinute()) {

                try {
                    sendUnpaidEmailInternal(u.getUserId(), u.getReminderShift());
                    customerRepository.updateLastReminderSent(u.getUserId(), today);
                } catch (Exception e) {
                    // Log and continue; do not stop the loop
                    LoggerFactory.getLogger(PaymentController.class).error("Failed to send reminder email for user {}: {}", u.getUserId(), e.getMessage());
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

            if (unpaid.isEmpty()) return;

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
                    html.toString()
            );
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
