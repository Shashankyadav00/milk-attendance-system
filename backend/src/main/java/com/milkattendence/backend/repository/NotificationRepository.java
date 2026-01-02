package com.milkattendence.backend.repository;

import com.milkattendence.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdAndShiftOrderByDateSentDesc(Long userId, String shift);
    List<Notification> findByUserIdOrderByDateSentDesc(Long userId);
}