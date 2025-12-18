import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Card,
  TextField,
  Button,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Popover,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function DayWiseEntry() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [shift, setShift] = useState(
    localStorage.getItem("selectedShift") || "Morning"
  );
  const [litres, setLitres] = useState(0);
  const [rate, setRate] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [entries, setEntries] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  /* ---------------- LOAD DATA ---------------- */

  const loadCustomers = async () => {
    if (!userId) return;
    const res = await api.get("/api/customers", {
      params: { userId, shift },
    });
    setCustomers(res.data || []);
  };

  const loadEntries = async () => {
    if (!userId) return;
    const res = await api.get("/api/milk", {
      params: { userId, shift },
    });
    setEntries(res.data || []);
  };

  useEffect(() => {
    loadCustomers();
    loadEntries();
  }, [shift]);

  /* ---------------- AUTO RATE ---------------- */

  useEffect(() => {
    const c = customers.find(
      (x) =>
        x.fullName === selectedCustomer ||
        x.nickname === selectedCustomer
    );
    if (c) setRate(c.pricePerLitre || "");
  }, [selectedCustomer, customers]);

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomer || !litres || !rate) {
      alert("Fill all fields");
      return;
    }

    await api.post("/api/milk", {
      customerName: selectedCustomer,
      shift,
      litres: Number(litres),
      rate: Number(rate),
      amount: Number(litres) * Number(rate),
      date,
      userId,
    });

    setLitres(0);
    loadEntries();
  };

  /* ---------------- DELETE ---------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    await api.delete(`/api/milk/${id}`);
    loadEntries();
  };

  /* ---------------- POPOVER ---------------- */

  const open = Boolean(anchorEl);
  const litreOptions = [0.25, 0.5, 0.75, 1, 2];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, sm: 3 },
        background: "linear-gradient(135deg,#f0fdf4,#e0f2fe)",
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
        }}
      >
        <Button size="small" variant="outlined" onClick={() => navigate("/dashboard")}>
          ← Dashboard
        </Button>

        <Typography variant="h6" fontWeight={700} mt={2}>
          🥛 Day Wise Entry ({shift})
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* FORM */}
        <Stack spacing={1.5} component="form" onSubmit={handleSubmit}>
          <TextField
            type="date"
            label="Date"
            value={date}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setDate(e.target.value)}
          />

          <TextField
            select
            label="Customer"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            {customers.map((c) => {
              const name = c.fullName || c.nickname;
              return (
                <MenuItem key={c.id} value={name}>
                  {name}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            label="Litres"
            value={litres}
            InputProps={{ readOnly: true }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
            helperText="Tap to add litres"
          />

          <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={() => setAnchorEl(null)}
          >
            <Box p={1} display="flex" gap={1}>
              {litreOptions.map((v) => (
                <Button
                  key={v}
                  size="small"
                  variant="contained"
                  onClick={() =>
                    setLitres((prev) =>
                      Number((Number(prev) + v).toFixed(2))
                    )
                  }
                >
                  +{v}
                </Button>
              ))}
              <Button
                size="small"
                color="error"
                onClick={() => setLitres(0)}
              >
                Reset
              </Button>
            </Box>
          </Popover>

          <TextField
            label="Rate"
            type="number"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
          />

          <Button type="submit" variant="contained">
            Add Entry
          </Button>
        </Stack>

        {/* TABLE */}
        <Typography variant="h6" mt={4}>
          Recent Entries
        </Typography>

        <Paper sx={{ mt: 1, overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Litres</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {entries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No entries
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.date}</TableCell>
                    <TableCell>{e.customerName}</TableCell>
                    <TableCell>{e.litres}</TableCell>
                    <TableCell>{e.rate}</TableCell>
                    <TableCell>
                      ₹{(e.litres * e.rate).toFixed(2)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDelete(e.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      </Card>
    </Box>
  );
}

export default DayWiseEntry;
