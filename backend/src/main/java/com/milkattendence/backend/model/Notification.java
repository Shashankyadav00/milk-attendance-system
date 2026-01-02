package com.milkattendence.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String shift;
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String body;

    private String type; // e.g., EMAIL, INAPP

    private LocalDateTime dateSent;

    public Notification() {}

    public Notification(Long userId, String shift, String subject, String body, String type, LocalDateTime dateSent) {
        this.userId = userId;
        this.shift = shift;
        this.subject = subject;
        this.body = body;
        this.type = type;
        this.dateSent = dateSent;
    }

    // getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getShift() { return shift; }
    public void setShift(String shift) { this.shift = shift; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public LocalDateTime getDateSent() { return dateSent; }
    public void setDateSent(LocalDateTime dateSent) { this.dateSent = dateSent; }
}