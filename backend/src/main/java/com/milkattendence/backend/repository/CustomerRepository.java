package com.milkattendence.backend.repository;

import com.milkattendence.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
            WHERE (c.fullName LIKE CONCAT('%', :name, '%') OR c.nickname LIKE CONCAT('%', :name, '%'))
    """)
    List<Customer> findByNameContaining(@Param("name") String name);

    // ==========================
    // FIND CUSTOMER BY NAME FOR USER
    // ==========================
    @Query("""
            SELECT c FROM Customer c 
            WHERE c.userId = :userId AND c.shift = :shift 
            AND (c.fullName LIKE CONCAT('%', :name, '%') OR c.nickname LIKE CONCAT('%', :name, '%'))
    """)
    Optional<Customer> findCustomerByNameForUser(@Param("userId") Long userId,
                                                 @Param("shift") String shift,
                                                 @Param("name") String name);

    // ==========================
    // 🔔 REMINDER CONFIGURATION
    // ==========================
    @Modifying
    @Transactional
    @Query("""
            UPDATE Customer c SET c.reminderEnabled = :enabled, 
            c.reminderTime = :reminderTime, c.reminderShift = :shift,
            c.reminderIntervalDays = :intervalDays
            WHERE c.userId = :userId
    """)
    int updateReminderSettings(@Param("userId") Long userId,
                               @Param("enabled") Boolean enabled,
                               @Param("reminderTime") LocalTime reminderTime,
                               @Param("shift") String shift,
                               @Param("intervalDays") Integer intervalDays);

    // ==========================
    // GET ALL CUSTOMERS WITH REMINDERS ENABLED
    // ==========================
    @Query("""
            SELECT c FROM Customer c 
            WHERE c.reminderEnabled = true AND c.reminderTime IS NOT NULL
    """)
    List<Customer> findAllWithRemindersEnabled();

    // ==========================
    // CLEAR LAST REMINDER SENT FOR SHIFT
    // ==========================
    @Modifying
    @Transactional
    @Query("""
            UPDATE Customer c SET c.lastReminderSentAt = NULL
            WHERE c.userId = :userId AND c.reminderShift = :shift
    """)
    int clearLastReminderSentForShift(@Param("userId") Long userId,
                                      @Param("shift") String shift);

    // ==========================
    // CLAIM REMINDER FOR SHIFT
    // ==========================
    @Modifying
    @Transactional
    @Query("""
            UPDATE Customer c SET c.lastReminderSentAt = :now
            WHERE c.userId = :userId AND c.reminderShift = :shift 
            AND (c.lastReminderSentAt IS NULL OR c.lastReminderSentAt < :threshold)
    """)
    int claimReminderForShift(@Param("userId") Long userId,
                              @Param("shift") String shift,
                              @Param("now") LocalDateTime now,
                              @Param("threshold") LocalDateTime threshold);

    // ==========================
    // GET CUSTOMERS NEEDING REMINDERS
    // ==========================
    @Query("""
            SELECT c FROM Customer c 
            WHERE c.reminderTime IS NOT NULL 
            AND (c.lastReminderSentAt IS NULL OR c.lastReminderSentAt < :threshold)
    """)
    List<Customer> findCustomersNeedingReminders(@Param("threshold") LocalDateTime threshold);

    // ==========================
    // UPDATE LAST REMINDER SENT TIMESTAMP
    // ==========================
    @Modifying
    @Transactional
    @Query("""
            UPDATE Customer c SET c.lastReminderSentAt = :now
            WHERE c.userId = :userId AND c.reminderShift = :shift
    """)
    int updateLastReminderSentForShift(@Param("userId") Long userId,
                                       @Param("shift") String shift,
                                       @Param("now") LocalDateTime now);

    // ==========================
    // UPDATE LAST REMINDER SENT TIMESTAMP BY ID
    // ==========================
    @Modifying
    @Transactional
    @Query("""
            UPDATE Customer c SET c.lastReminderSentAt = CURRENT_TIMESTAMP
            WHERE c.id = :id
    """)
    int updateLastReminderSentAt(@Param("id") Long id);
}
