package com.milkattendence.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "customer")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String fullName;
    private String nickname;
    private String shift;
    private Double pricePerLitre;

    // Existing
    private boolean active = true;

    // ==========================
    // 🔔 REMINDER FIELDS (REQUIRED)
    // ==========================
    private Boolean reminderEnabled = false;

    private LocalTime reminderTime;

    private String reminderShift;

    // How often (in days) reminders should repeat. Default is 1 (daily).
    private Integer reminderIntervalDays = 1;

    private LocalDate lastReminderSent;

    // ==========================
    // CONSTRUCTORS
    // ==========================
    public Customer() {}

    // ==========================
    // GETTERS & SETTERS
    // ==========================
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }

    public Double getPricePerLitre() {
        return pricePerLitre;
    }

    public void setPricePerLitre(Double pricePerLitre) {
        this.pricePerLitre = pricePerLitre;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    // ==========================
    // 🔔 REMINDER GETTERS
    // ==========================
    public Boolean getReminderEnabled() {
        return reminderEnabled;
    }

    public void setReminderEnabled(Boolean reminderEnabled) {
        this.reminderEnabled = reminderEnabled;
    }

    public LocalTime getReminderTime() {
        return reminderTime;
    }

    public void setReminderTime(LocalTime reminderTime) {
        this.reminderTime = reminderTime;
    }

    public String getReminderShift() {
        return reminderShift;
    }

    public void setReminderShift(String reminderShift) {
        this.reminderShift = reminderShift;
    }

    public Integer getReminderIntervalDays() {
        return reminderIntervalDays;
    }

    public void setReminderIntervalDays(Integer reminderIntervalDays) {
        this.reminderIntervalDays = reminderIntervalDays;
    }

    public LocalDate getLastReminderSent() {
        return lastReminderSent;
    }

    public void setLastReminderSent(LocalDate lastReminderSent) {
        this.lastReminderSent = lastReminderSent;
    }
}
