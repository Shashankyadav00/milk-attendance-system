package com.milkattendence.backend.service;

import com.sendgrid.SendGrid;
import com.sendgrid.Request;
import com.sendgrid.Method;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Content;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Value("${admin.email}")
    private String adminEmail;

    public void sendHtmlEmail(String subject, String htmlContent) throws Exception {

        String apiKey = System.getenv("SENDGRID_API_KEY");

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("SENDGRID_API_KEY is missing");
        }

        Email from = new Email("noreply@milk-attendance.com");
        Email to = new Email(adminEmail);
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
        request.setMethod(Method.POST);
        request.setEndpoint("mail/send");
        request.setBody(mail.build());

        sg.api(request);
    }
}
