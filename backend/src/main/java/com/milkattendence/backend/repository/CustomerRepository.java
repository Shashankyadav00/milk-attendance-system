package com.milkattendence.backend.repository;

import com.milkattendence.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    // ==========================
    // BASIC CUSTOMER QUERIES
    // ==========================
    List<Customer> findByUserIdAndActive(Long userId, boolean active);

    List<Customer> findByShiftAndUserIdAndActive(String shift, Long userId, boolean active);

    List<Customer> findByShiftAndUserId(String shift, Long userId);

    // ==========================
    // FIND CUSTOMER BY NAME (FULLNAME / NICKNAME)
    // ==========================
    @Query("""
        SELECT c FROM Customer c
        WHERE c.userId = :userId
          AND c.shift = :shift
          AND (
               LOWER(TRIM(c.fullName)) = LOWER(TRIM(:name))
            OR LOWER(TRIM(c.nickname)) = LOWER(TRIM(:name))
          )
    """)
    Optional<Customer> findCustomerByNameForUser(
            @Param("userId") Long userId,
            @Param("shift") String shift,
            @Param("name") String name
    );

    // ==========================
    // 🔔 REMINDER CONFIGURATION
    // ==========================
    @Modifying
    @Transactional
    @Query("""
        UPDATE Customer c
        SET c.reminderEnabled = :enabled,
            c.reminderTime = :time,
            c.reminderShift = :shift
        WHERE c.userId = :userId
    """)
    void updateReminderSettings(
            @Param("userId") Long userId,
            @Param("enabled") boolean enabled,
            @Param("time") LocalTime time,
            @Param("shift") String shift
    );

    @Query("""
        SELECT c FROM Customer c
        WHERE c.reminderEnabled = true
          AND c.reminderTime IS NOT NULL
    """)
    List<Customer> findAllWithRemindersEnabled();

    @Modifying
    @Transactional
    @Query("""
        UPDATE Customer c
        SET c.lastReminderSent = :date
        WHERE c.userId = :userId
    """)
    void updateLastReminderSent(
            @Param("userId") Long userId,
            @Param("date") LocalDate date
    );
}
