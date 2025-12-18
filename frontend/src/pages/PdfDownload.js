import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Select,
  MenuItem,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function PdfDownload() {
  const navigate = useNavigate();
  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [shift, setShift] = useState(
    localStorage.getItem("selectedShift") || "Morning"
  );
  const [data, setData] = useState(null);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];

  /* ---------------- LOAD OVERVIEW ---------------- */

  useEffect(() => {
    loadOverviewData();
  }, [month, year, shift]);

  const loadOverviewData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await api.get("/api/overview", {
        params: { shift, month, year, userId },
      });
      setData(res.data);
    } catch (err) {
      console.error("Error loading overview:", err);
    }
  };

  const currency = (n) =>
    n?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* ---------------- DOWNLOAD HTML (UTF-8 FIXED) ---------------- */

  const downloadScrollableHtml = () => {
    if (!data) return;

    const {
      daysInMonth,
      customers,
      matrix,
      totalLitresPerCustomer,
      totalAmountPerCustomer,
    } = data;

    const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const css = `
      body { font-family: Arial, sans-serif; margin: 16px; }
      .wrap { overflow:auto; max-height:90vh; border:1px solid #ccc; }
      table { border-collapse: collapse; font-size: 13px; width: max-content; }
      th, td { border:1px solid #ccc; padding:6px 10px; white-space:nowrap; text-align:center; }
      th { background:#e8f5e9; position:sticky; top:0; }
      .name { position:sticky; left:0; background:#fafafa; font-weight:600; }
    `;

    const rows = customers
      .map((c) => `
        <tr>
          <td class="name">${c.name || c.fullName || c.nickname}</td>
          ${dayNumbers.map((d) => {
            const l = matrix[d]?.[c.id]?.litres || 0;
            return `<td>${l ? l.toFixed(2) + " L" : "-"}</td>`;
          }).join("")}
          <td><b>${(totalLitresPerCustomer[c.id] || 0).toFixed(2)}</b></td>
          <td><b>₹${currency(totalAmountPerCustomer[c.id] || 0)}</b></td>
        </tr>
      `).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Overview</title>
  <style>${css}</style>
</head>
<body>
  <h3>Overview — ${shift} | ${months[month - 1]} ${year}</h3>
  <div class="wrap">
    <table>
      <tr>
        <th class="name">Customer</th>
        ${dayNumbers.map((d) => `<th>${d}</th>`).join("")}
        <th>Total Litres</th>
        <th>Total Amount</th>
      </tr>
      ${rows}
    </table>
  </div>
  <p>Generated on ${new Date().toLocaleString()}</p>
</body>
</html>
`;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Overview_${shift}_${year}_${String(month).padStart(2, "0")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ---------------- UI ---------------- */

  if (!data) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const {
    daysInMonth,
    customers,
    matrix,
    totalLitresPerCustomer,
    totalAmountPerCustomer,
  } = data;

  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
        <Typography variant="h5" fontWeight={700}>
          📄 Download Overview
        </Typography>

        {/* FILTERS */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} my={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Shift</InputLabel>
            <Select
              value={shift}
              label="Shift"
              onChange={(e) => {
                setShift(e.target.value);
                localStorage.setItem("selectedShift", e.target.value);
              }}
            >
              <MenuItem value="Morning">Morning</MenuItem>
              <MenuItem value="Night">Night</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Month</InputLabel>
            <Select value={month} label="Month" onChange={(e) => setMonth(e.target.value)}>
              {months.map((m, i) => (
                <MenuItem key={i} value={i + 1}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Year</InputLabel>
            <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 6 }).map((_, i) => {
                const y = today.getFullYear() - 2 + i;
                return <MenuItem key={y} value={y}>{y}</MenuItem>;
              })}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={downloadScrollableHtml}>
            Download
          </Button>

          <Button variant="outlined" onClick={() => navigate("/dashboard")}>
            Back
          </Button>
        </Stack>

        {/* TABLE — SAME AS OVERVIEW */}
        <Paper sx={{ overflowX: "auto", borderRadius: 2 }}>
          <table style={{ borderCollapse: "collapse", width: "max-content", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#e6f7ef" }}>
                <th style={{ minWidth: 180, position: "sticky", left: 0, background: "#e6f7ef" }}>
                  Customer
                </th>
                {dayNumbers.map((d) => (
                  <th key={d} style={{ minWidth: 70 }}>{d}</th>
                ))}
                <th>Total Litres</th>
                <th>Total Amount</th>
              </tr>
            </thead>

            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ position: "sticky", left: 0, background: "#fafafa", fontWeight: 600 }}>
                    {c.name || c.fullName || c.nickname}
                  </td>

                  {dayNumbers.map((d) => {
                    const litres = matrix[d]?.[c.id]?.litres || 0;
                    return <td key={d}>{litres ? `${litres.toFixed(2)} L` : "-"}</td>;
                  })}

                  <td><b>{(totalLitresPerCustomer[c.id] || 0).toFixed(2)}</b></td>
                  <td><b>₹{currency(totalAmountPerCustomer[c.id] || 0)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      </Card>
    </Box>
  );
}

export default PdfDownload;
