package com.milkattendence.backend.controller;

import com.milkattendence.backend.model.Notification;
import com.milkattendence.backend.repository.NotificationRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationRepository repo;

    public NotificationController(NotificationRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Notification> list(@RequestParam Long userId, @RequestParam(required = false) String shift) {
        if (shift != null && !shift.isBlank()) return repo.findByUserIdAndShiftOrderByDateSentDesc(userId, shift);
        return repo.findByUserIdOrderByDateSentDesc(userId);
    }
}