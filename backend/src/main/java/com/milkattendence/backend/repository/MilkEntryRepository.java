package com.milkattendence.backend.repository;

import com.milkattendence.backend.model.MilkEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MilkEntryRepository extends JpaRepository<MilkEntry, Long> {

    List<MilkEntry> findByUserIdAndShiftOrderByDateDesc(Long userId, String shift);

    List<MilkEntry> findByUserIdAndShiftAndDateBetweenOrderByDateAsc(
            Long userId, String shift, LocalDate start, LocalDate end
    );

    Optional<MilkEntry> findByUserIdAndShiftAndDateAndCustomerName(
            Long userId, String shift, LocalDate date, String customerName
    );

    // ✅ FINAL METHOD — USED FOR EMAIL REMINDERS
    @Query("""
        SELECT COALESCE(SUM(m.litres), 0)
        FROM MilkEntry m
        WHERE LOWER(m.customerName) = LOWER(:customerName)
          AND m.shift = :shift
          AND m.userId = :userId
    """)
    Double getTotalLitresForCustomer(
            @Param("customerName") String customerName,
            @Param("shift") String shift,
            @Param("userId") Long userId
    );
}
