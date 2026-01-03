import React, { useState, useEffect } from "react";
import {
  Card,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Table,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  Popover,
  ButtonGroup,
  Stack,
  Chip,
  Switch,
} from "@mui/material";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

function Overview() {
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  const [shift, setShift] = useState(
    localStorage.getItem("selectedShift") || "Morning"
  );
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [data, setData] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [localLitres, setLocalLitres] = useState(0);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  useEffect(() => {
    loadOverview();
  }, [shift, month, year]);

  const loadOverview = async () => {
    try {
      const res = await api.get("/api/overview", {
        params: { shift, month, year, userId },
      });
      setData(res.data);
    } catch {
      setData(null);
    }
  };

  const handleCellClick = (event, day, customer) => {
    const existing =
      Number(data?.matrix?.[day]?.[customer.id]?.litres || 0);

    setLocalLitres(existing);
    setAnchorEl(event.currentTarget);
    setSelectedCell({ day, customer });
  };

  const handleQuickAction = async (litresValue) => {
    if (!selectedCell) return;

    const { day, customer } = selectedCell;

    const entryDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const updatedLitres =
      litresValue === 0 ? 0 : localLitres + litresValue;

    const rate = customer.pricePerLitre || 0;

    try {
      await api.post("/api/milk", {
        customerName: customer.fullName || customer.nickname,
        shift,
        litres: updatedLitres,
        rate,
        amount: updatedLitres * rate,
        date: entryDate,
        userId: Number(userId),
      });

      setLocalLitres(updatedLitres);
      await loadOverview();
    } catch {
      alert("Error saving entry");
    }
  };

  if (!data) {
    return (
      <Box p={3} textAlign="center">
        <Typography>Loading overview…</Typography>
      </Box>
    );
  }

  const days = data.daysInMonth || 0;
  const customers = data.customers || [];
  const matrix = data.matrix || {};
  const totalLitres = data.totalLitresPerCustomer || {};
  const totalAmount = data.totalAmountPerCustomer || {};
  const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, sm: 3 },
        background: "linear-gradient(135deg, #f8fffc, #ecfdf5)",
      }}
    >
      <Card sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 3 }}>
        {/* HEADER */}
        <Stack spacing={2} mb={3}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate("/dashboard")}
            sx={{ alignSelf: "flex-start" }}
          >
            ← Dashboard
          </Button>

          <Typography variant="h6" fontWeight={700} color="#2e7d32">
            🧾 Overview ({shift})
          </Typography>

          {/* FILTERS – STACK ON MOBILE */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
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
              <Select
                value={month}
                label="Month"
                onChange={(e) => setMonth(Number(e.target.value))}
              >
                {months.map((m, i) => (
                  <MenuItem key={i} value={i + 1}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={year}
                label="Year"
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = new Date().getFullYear() - 2 + i;
                  return (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Stack>
        </Stack>

        {/* TABLE */}
        <Paper sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 5,
                    background: "#e6f7ef",
                    fontWeight: 700,
                    minWidth: 140,
                  }}
                >
                  Customer
                </TableCell>

                {dayNumbers.map((d) => (
                  <TableCell key={d} align="center" sx={{ minWidth: 60 }}>
                    {d}
                  </TableCell>
                ))}

                <TableCell align="center" sx={{ minWidth: 90 }}>
                  Litres
                </TableCell>

                <TableCell align="center" sx={{ minWidth: 110 }}>
                  Amount
                </TableCell>

                <TableCell align="center" sx={{ minWidth: 110 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell
                    sx={{
                      position: "sticky",
                      left: 0,
                      background: "#fafafa",
                      fontWeight: 600,
                      zIndex: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.fullName || c.nickname}
                  </TableCell>

                  {dayNumbers.map((day) => {
                    const litres = Number(matrix[day]?.[c.id]?.litres || 0);
                    return (
                      <TableCell
                        key={day}
                        align="center"
                        onClick={(e) => handleCellClick(e, day, c)}
                        sx={{
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        {litres ? (
                          <Chip size="small" label={`${litres.toFixed(2)}L`} />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                    );
                  })}

                  <TableCell align="center">
                    <b>{(totalLitres[c.id] || 0).toFixed(2)}</b>
                  </TableCell>

                  <TableCell align="center">
                    ₹{(totalAmount[c.id] || 0).toFixed(2)}
                  </TableCell>

                  <TableCell align="center">
                    {/* Status toggle: checked if paid today */}
                    <Switch
                      checked={Boolean(data.paymentsToday && data.paymentsToday[(c.fullName || c.nickname || "").trim().toLowerCase()])}
                      onChange={async () => {
                        const name = (c.fullName || c.nickname || "");
                        const paid = Boolean(data.paymentsToday && data.paymentsToday[name.trim().toLowerCase()]);
                        try {
                          await api.post('/api/payments', {
                            customerName: name,
                            shift,
                            paid: !paid,
                            userId: Number(userId),
                          });
                          await loadOverview();
                        } catch (err) {
                          alert('Failed to update payment status');
                        }
                      }}
                      color="success"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* QUICK ENTRY */}
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
        >
          <Box p={2} textAlign="center">
            <Typography fontWeight={600} mb={1}>
              Quick Add (L)
            </Typography>

            <ButtonGroup size="small">
              {[0.25, 0.5, 0.75, 1, 2].map((v) => (
                <Button key={v} onClick={() => handleQuickAction(v)}>
                  +{v}
                </Button>
              ))}
              <Button color="error" onClick={() => handleQuickAction(0)}>
                Reset
              </Button>
            </ButtonGroup>

            <Typography mt={1} fontSize={12}>
              Current: <b>{localLitres.toFixed(2)} L</b>
            </Typography>
          </Box>
        </Popover>
      </Card>
    </Box>
  );
}

export default Overview;
