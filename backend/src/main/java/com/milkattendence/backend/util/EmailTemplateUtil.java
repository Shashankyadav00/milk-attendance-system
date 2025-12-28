package com.milkattendence.backend.util;

import com.milkattendence.backend.model.Payment;

import java.time.format.DateTimeFormatter;
import java.util.List;

public class EmailTemplateUtil {

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy");

    public static String buildUnpaidTable(List<Payment> payments) {

        if (payments == null || payments.isEmpty()) {
            return "<h3>All customers are paid ✅</h3>";
        }

        StringBuilder sb = new StringBuilder();

        sb.append("""
            <h2>Unpaid Customers Report</h2>
            <table border="1" cellpadding="8" cellspacing="0"
                   style="border-collapse:collapse;font-family:Arial,sans-serif">
              <tr style="background:#f1f5f9">
                <th>Customer Name</th>
                <th>Shift</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
        """);

        for (Payment p : payments) {
            sb.append("<tr>")
              .append("<td>").append(escape(p.getCustomerName())).append("</td>")
              .append("<td>").append(escape(p.getShift())).append("</td>")
              .append("<td>")
              .append(p.getDate() != null ? p.getDate().format(DATE_FMT) : "-")
              .append("</td>")
              .append("<td style='color:red;font-weight:bold'>Unpaid</td>")
              .append("</tr>");
        }

        sb.append("</table>");
        return sb.toString();
    }

    // Basic HTML escaping for safety
    private static String escape(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
