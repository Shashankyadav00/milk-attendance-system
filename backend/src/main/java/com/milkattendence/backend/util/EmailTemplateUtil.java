package com.milkattendence.backend.util;

import com.milkattendence.backend.model.Payment;
import java.util.List;

public class EmailTemplateUtil {

    public static String buildUnpaidTable(List<Payment> payments) {

        if (payments.isEmpty()) {
            return "<h3>All customers are paid ✅</h3>";
        }

        StringBuilder sb = new StringBuilder();

        sb.append("""
            <h2>Unpaid Customers Report</h2>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse">
              <tr>
                <th>Customer Name</th>
                <th>Shift</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
        """);

        for (Payment p : payments) {
            sb.append("<tr>")
              .append("<td>").append(p.getCustomerName()).append("</td>")
              .append("<td>").append(p.getShift()).append("</td>")
              .append("<td>").append(p.getDate()).append("</td>")
              .append("<td>Unpaid</td>")
              .append("</tr>");
        }

        sb.append("</table>");
        return sb.toString();
    }
}
