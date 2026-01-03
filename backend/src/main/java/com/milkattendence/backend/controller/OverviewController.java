package com.milkattendence.backend.controller;

import com.milkattendence.backend.model.Customer;
import com.milkattendence.backend.model.MilkEntry;
import com.milkattendence.backend.repository.CustomerRepository;
import com.milkattendence.backend.repository.MilkEntryRepository;
import com.milkattendence.backend.repository.PaymentRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/api/overview")
@CrossOrigin(origins = "*")
public class OverviewController {

    private final MilkEntryRepository milkEntryRepo;
    private final CustomerRepository customerRepo;
    private final PaymentRepository paymentRepo;

    public OverviewController(
            MilkEntryRepository milkEntryRepo,
            CustomerRepository customerRepo,
            PaymentRepository paymentRepo
    ) {
        this.milkEntryRepo = milkEntryRepo;
        this.customerRepo = customerRepo;
        this.paymentRepo = paymentRepo;
    }

    @GetMapping
    public Map<String, Object> getOverview(
            @RequestParam String shift,
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam Long userId
    ) {

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<Customer> customers =
                customerRepo.findByShiftAndUserIdAndActive(shift, userId, true);

        List<MilkEntry> entries =
                milkEntryRepo.findByUserIdAndShiftAndDateBetweenOrderByDateAsc(
                        userId, shift, start, end
                );

        int daysInMonth = ym.lengthOfMonth();

        // day -> customerId -> { litres }
        Map<Integer, Map<Long, Map<String, Double>>> matrix = new HashMap<>();
        for (int d = 1; d <= daysInMonth; d++) {
            matrix.put(d, new HashMap<>());
        }

        // -----------------------------
        // BUILD MATRIX (LITRES ONLY)
        // -----------------------------
        for (MilkEntry e : entries) {
            int day = e.getDate().getDayOfMonth();

            Optional<Customer> customerOpt = customers.stream()
                    .filter(c ->
                            (c.getFullName() != null &&
                             c.getFullName().equalsIgnoreCase(e.getCustomerName()))
                         || (c.getNickname() != null &&
                             c.getNickname().equalsIgnoreCase(e.getCustomerName()))
                    )
                    .findFirst();

            if (customerOpt.isEmpty()) continue;

            Long customerId = customerOpt.get().getId();

            Map<Long, Map<String, Double>> dayMap = matrix.get(day);
            Map<String, Double> cell =
                    dayMap.getOrDefault(customerId, new HashMap<>());

            cell.put(
                    "litres",
                    cell.getOrDefault("litres", 0.0) + e.getLitres()
            );

            dayMap.put(customerId, cell);
        }

        // -----------------------------
        // TOTALS (DYNAMIC PRICING)
        // -----------------------------
        Map<Long, Double> totalLitresPerCustomer = new HashMap<>();
        Map<Long, Double> totalAmountPerCustomer = new HashMap<>();
        Map<Integer, Double> totalPerDay = new HashMap<>();
        double grandTotalAmount = 0.0;

        for (int day = 1; day <= daysInMonth; day++) {

            double dayTotal = 0.0;

            for (Customer c : customers) {

                double litres =
                        matrix.get(day)
                              .getOrDefault(c.getId(), Map.of())
                              .getOrDefault("litres", 0.0);

                double price =
                        c.getPricePerLitre() != null
                                ? c.getPricePerLitre()
                                : 0.0;

                double amount = litres * price;

                totalLitresPerCustomer.merge(
                        c.getId(), litres, Double::sum
                );

                totalAmountPerCustomer.merge(
                        c.getId(), amount, Double::sum
                );

                dayTotal += amount;
                grandTotalAmount += amount;
            }

            totalPerDay.put(day, dayTotal);
        }

        // -----------------------------
        // RESPONSE
        // -----------------------------
        Map<String, Object> response = new HashMap<>();
        response.put("year", year);
        response.put("month", month);
        response.put("daysInMonth", daysInMonth);
        response.put("customers", customers);
        response.put("matrix", matrix);
        response.put("totalLitresPerCustomer", totalLitresPerCustomer);
        response.put("totalAmountPerCustomer", totalAmountPerCustomer);
        response.put("totalPerDay", totalPerDay);
        response.put("grandTotalAmount", grandTotalAmount);

        // Today's payments (to know if a customer is marked paid today)
        LocalDate today = LocalDate.now(ZoneId.of("Asia/Kolkata"));
        List<com.milkattendence.backend.model.Payment> todaysPayments =
                paymentRepo.findByShiftAndDateAndUserId(shift, today, userId);

        Map<String, Boolean> paymentsToday = new HashMap<>();
        for (com.milkattendence.backend.model.Payment p : todaysPayments) {
            if (p.getCustomerName() == null) continue;
            paymentsToday.put(p.getCustomerName().trim().toLowerCase(), p.isPaid());
        }

        response.put("paymentsToday", paymentsToday);

        return response;
    }
}
