package com.milkattendence.backend.controller;

import com.milkattendence.backend.repository.CustomerRepository;
import com.milkattendence.backend.service.EmailService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final CustomerRepository customerRepository;
    private final EmailService emailService;

    public HealthController(CustomerRepository customerRepository, EmailService emailService) {
        this.customerRepository = customerRepository;
        this.emailService = emailService;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> out = new HashMap<>();

        // DB status
        try {
            long count = customerRepository.count();
            out.put("db", Map.of("ok", true, "sampleCustomerCount", count));
        } catch (Exception e) {
            out.put("db", Map.of("ok", false, "error", e.getMessage()));
        }

        // Email config status
        try {
            out.put("email", emailService.getHealthStatus());
        } catch (Exception e) {
            out.put("email", Map.of("ok", false, "error", e.getMessage()));
        }

        out.put("ok", true);
        return out;
    }
}
