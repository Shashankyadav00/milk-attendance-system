import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Switch,
  Box,
  TextField,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function PaymentSummary() {
  const navigate = useNavigate();
  const shift = localStorage.getItem("selectedShift") || "Morning";
  const userId = Number(localStorage.getItem("userId"));

  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [time, setTime] = useState("08:00");
  const [enabled, setEnabled] = useState(false);
  const [repeatDays, setRepeatDays] = useState(1);
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!userId) return;
    loadCustomers();
    loadPayments();
    loadReminderSettings();
  }, [shift, userId]);

  useEffect(() => {
    if (!userId) return;
    loadNotifications();
  }, [shift, userId]);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/api/notifications', { params: { userId, shift } });
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    }
  };

  /* ---------------- LOAD DATA ---------------- */

  const loadCustomers = async () => {
    try {
      const res = await api.get("/api/customers", {
        params: { userId, shift },
      });
      setCustomers(res.data || []);
    } catch {
      setCustomers([]);
    }
  };

  const loadPayments = async () => {
    try {
      const res = await api.get(`/api/payments/${shift}`, {
        params: { userId },
      });
      if (res.data?.success) setPayments(res.data.payments || []);
      else setPayments([]);
    } catch {
      setPayments([]);
    }
  };

  /* ---------------- LOAD REMINDER (FIXED BUG) ---------------- */

  const loadReminderSettings = async () => {
    try {
      const res = await api.get("/api/customers/reminder", {
        params: { userId, shift },
      });

      if (res.data?.enabled !== undefined) {
        setEnabled(res.data.enabled);
        setTime(res.data.time || "08:00");
        setRepeatDays(res.data.repeatDays || 1);
      }
    } catch {
      // silent fail
    }
  };

  /* ---------------- PAYMENT LOGIC ---------------- */

  const getPaymentRow = (name) =>
    payments.find(
      (p) =>
        p.customerName?.trim().toLowerCase() ===
        name.trim().toLowerCase()
    );

  const handlePaymentToggle = async (name) => {
    const row = getPaymentRow(name);
    const paid = row ? row.paid : false;

    setPayments((prev) =>
      prev.some((p) => p.customerName === name)
        ? prev.map((p) =>
            p.customerName === name ? { ...p, paid: !paid } : p
          )
        : [...prev, { customerName: name, paid: !paid, shift, userId }]
    );

    await api.post("/api/payments", {
      customerName: name,
      shift,
      paid: !paid,
      userId,
    });

    loadPayments();
  };

  /* ---------------- SAVE REMINDER ---------------- */

  const saveReminder = async () => {
    setSaving(true);
    try {
      await api.post("/api/payments/save-reminder", {
        userId,
        shift,
        enabled,
        time,
        repeatDays,
      });
      alert("Reminder saved successfully");
    } catch {
      alert("Failed to save reminder");
    } finally {
      setSaving(false);
    }
  };

  /* ---------------- ADMIN EMAIL ---------------- */

  const sendUnpaidEmail = async () => {
    try {
      const res = await api.post("/api/payments/email/unpaid", null, {
        params: { shift, userId },
      });
      if (res.data?.success) {
        alert("Unpaid customers email sent to admin");
        await loadNotifications();
      } else {
        alert(res.data?.error || "Failed to send unpaid report");
      }
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to send unpaid report";
      alert(message);
    }
  };



  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, sm: 3 },
        background: "linear-gradient(135deg,#f8fafc,#eef2ff)",
      }}
    >
      <Card sx={{ maxWidth: 900, mx: "auto", p: { xs: 1.5, sm: 3 }, borderRadius: 3 }}>
        {/* HEADER */}
        <Stack spacing={2}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("/dashboard")}
            sx={{ alignSelf: "flex-start" }}
          >
            ← Dashboard
          </Button>

          <Typography variant="h6" fontWeight={700}>
            Payment Summary ({shift})
          </Typography>
        </Stack>

        {/* REMINDER */}
        <Box mt={3} p={2} sx={{ background: "#f1f5f9", borderRadius: 2 }}>
          <Typography fontWeight={700} mb={1}>
            Email Reminder
          </Typography>

          <Divider sx={{ mb: 1 }} />

          <Stack spacing={1.5}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography>{shift} Shift</Typography>
              <Switch
                checked={enabled}
                disabled={saving}
                onChange={(e) => setEnabled(e.target.checked)}
              />
            </Stack>

            {enabled && (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  type="time"
                  size="small"
                  fullWidth
                  label="Time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />

                <TextField
                  type="number"
                  size="small"
                  sx={{ width: 160 }}
                  inputProps={{ min: 1 }}
                  label="Repeat every (days)"
                  value={repeatDays}
                  onChange={(e) => setRepeatDays(Number(e.target.value) || 1)}
                />

                <Button
                  variant="contained"
                  color="success"
                  disabled={saving}
                  onClick={saveReminder}
                >
                  Save
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  disabled={saving}
                  onClick={async () => {
                    try {
                      const res = await api.post("/api/payments/trigger-reminder", null, { params: { userId, shift } });
                      if (res.data?.success) {
                        alert("Test reminder triggered. Email will be sent if unpaid customers exist.");
                        await loadNotifications();
                      } else alert(res.data?.error || "Failed to trigger test reminder");
                    } catch (err) {
                      const message = err?.response?.data?.error || "Failed to trigger test reminder";
                      alert(message);
                    }
                  }}
                >
                  Send Test Reminder
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>

        {/* PAYMENT TABLE */}
        <Box mt={3}>
          <Paper sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><b>Customer</b></TableCell>
                  <TableCell align="center"><b>Status</b></TableCell>
                  <TableCell align="center"><b>Action</b></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {customers.map((c) => {
                  const name = c.fullName || c.nickname;
                  const row = getPaymentRow(name);
                  const paid = row ? row.paid : false;

                  return (
                    <TableRow key={c.id}>
                      <TableCell>{name}</TableCell>

                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={paid ? "Paid" : "Unpaid"}
                          color={paid ? "success" : "error"}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Switch
                          checked={paid}
                          onChange={() => handlePaymentToggle(name)}
                          color="success"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        {/* ADMIN EMAIL */}
        <Box mt={3} textAlign="right">
          <Button
            variant="contained"
            color="primary"
            onClick={sendUnpaidEmail}
          >
            Send Unpaid Report to Admin
          </Button>
        </Box>

        {/* NOTIFICATIONS */}
        <Box mt={3}>
          <Typography fontWeight={700} mb={1}>Recent Notifications</Typography>
          <Paper sx={{ p: 2 }}>
            {notifications.length === 0 ? (
              <Typography color="text.secondary">No notifications yet.</Typography>
            ) : (
              <Stack spacing={1}>
                {notifications.map((n) => (
                  <Box key={n.id} sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    <Typography variant="subtitle2">{n.subject}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(n.dateSent).toLocaleString()}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Card>
    </Box>
  );
}

export default PaymentSummary;
