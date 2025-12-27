package com.milkattendence.backend.controller;

import com.milkattendence.backend.model.User;
import com.milkattendence.backend.repository.UserRepository;
import com.milkattendence.backend.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final EmailService emailService;

    @Autowired
    public AuthController(UserRepository userRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // ==========================================================
    // 🔵 LOGIN — returns userId
    // ==========================================================
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User requestUser) {

        Optional<User> foundOpt = userRepository.findByEmail(requestUser.getEmail());

        if (foundOpt.isEmpty()) {
            return Map.of(
                    "success", false,
                    "message", "User not found. Please register."
            );
        }

        User found = foundOpt.get();

        if (!found.getPassword().equals(requestUser.getPassword())) {
            return Map.of(
                    "success", false,
                    "message", "Invalid password."
            );
        }

        return Map.of(
                "success", true,
                "message", "Login successful!",
                "userId", found.getId()
        );
    }

    // ==========================================================
    // 🟢 REGISTER
    // ==========================================================
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return Map.of(
                    "success", false,
                    "message", "User already exists."
            );
        }

        userRepository.save(user);

        return Map.of(
                "success", true,
                "message", "Registration successful!"
        );
    }

    // ==========================================================
    // 🟣 FORGOT PASSWORD — SEND OTP (SendGrid)
    // ==========================================================

    private static class OtpInfo {
        String otp;
        LocalDateTime expiresAt;

        OtpInfo(String otp, LocalDateTime expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }
    }

    private final ConcurrentHashMap<String, OtpInfo> otpStore = new ConcurrentHashMap<>();

    @PostMapping("/forgot")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, Object> body) {

        String email = Objects.toString(body.get("email"), "").trim().toLowerCase();

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "error", "User not found");
        }

        try {
            String otp = String.valueOf(new Random().nextInt(900000) + 100000);
            otpStore.put(email, new OtpInfo(otp, LocalDateTime.now().plusMinutes(10)));

            String html =
                    "<h3>Password Reset OTP</h3>" +
                    "<h1 style='color:#2563eb'>" + otp + "</h1>" +
                    "<p>This OTP is valid for <b>10 minutes</b>.</p>";

            emailService.sendHtmlEmail(
                    "Password Reset OTP",
                    html
            );

            return Map.of("success", true, "message", "OTP sent to email");

        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("success", false, "error", "Failed to send OTP");
        }
    }

    // ==========================================================
    // 🟠 RESET PASSWORD — VERIFY OTP
    // ==========================================================
    @PostMapping("/reset")
    public Map<String, Object> resetPassword(@RequestBody Map<String, Object> body) {

        String email = Objects.toString(body.get("email"), "").trim().toLowerCase();
        String otp = Objects.toString(body.get("otp"), "").trim();
        String newPassword = Objects.toString(body.get("newPassword"), "").trim();

        if (email.isBlank() || otp.isBlank() || newPassword.isBlank()) {
            return Map.of("success", false, "error", "Missing fields");
        }

        OtpInfo info = otpStore.get(email);
        if (info == null) {
            return Map.of("success", false, "error", "OTP not found. Request again.");
        }

        if (LocalDateTime.now().isAfter(info.expiresAt)) {
            otpStore.remove(email);
            return Map.of("success", false, "error", "OTP expired. Request new OTP.");
        }

        if (!info.otp.equals(otp)) {
            return Map.of("success", false, "error", "Invalid OTP");
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "error", "User not found");
        }

        User user = userOpt.get();
        user.setPassword(newPassword);
        userRepository.save(user);

        otpStore.remove(email);

        return Map.of("success", true, "message", "Password reset successful");
    }
}
