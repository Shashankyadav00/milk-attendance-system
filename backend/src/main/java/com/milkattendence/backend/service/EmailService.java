package com.milkattendence.backend.service;

import com.sendgrid.SendGrid;
import com.sendgrid.Request;
import com.sendgrid.Method;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Content;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Value("${admin.email:}")
    private String adminEmail;

    @Value("${SENDGRID_API_KEY:}")
    private String sendgridApiKey;

    public void sendHtmlEmail(String subject, String htmlContent) throws Exception {

        String apiKey = sendgridApiKey != null && !sendgridApiKey.isBlank()
                ? sendgridApiKey
                : System.getenv("SENDGRID_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            logger.error("SENDGRID_API_KEY is missing");
            throw new IllegalStateException("SENDGRID_API_KEY is missing");
        }

        if (adminEmail == null || adminEmail.isBlank()) {
            logger.error("admin.email (ADMIN_EMAIL) is missing");
            throw new IllegalStateException("admin.email (ADMIN_EMAIL) is missing");
        }

        logger.info("Sending email to {} with subject={}", adminEmail, subject);

        Email from = new Email("noreply@milk-attendance.com");
        Email to = new Email(adminEmail);
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        com.sendgrid.Response response = sg.api(request);
        logger.info("SendGrid response: status={}, body={}", response.getStatusCode(), response.getBody());

        if (response.getStatusCode() >= 400) {
            throw new RuntimeException("Failed to send email: " + response.getStatusCode() + " " + response.getBody());
        }
    }
}
