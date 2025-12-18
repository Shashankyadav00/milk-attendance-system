import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Typography,
  Button,
  MenuItem,
  Select,
  Grid,
  Box,
  Stack,
} from "@mui/material";

function Dashboard() {
  const navigate = useNavigate();

  const [shift, setShift] = useState(
    localStorage.getItem("selectedShift") || "Morning"
  );

  useEffect(() => {
    localStorage.setItem("selectedShift", shift);
  }, [shift]);

  const handleLogout = () => {
  localStorage.clear();            // ← clear EVERYTHING
  window.location.href = "/login"; // ← hard reload (important)
};


  const cards = [
    { id: 1, title: "Add Customer", color: "#6c5ce7", path: "/add-customer" },
    { id: 2, title: "Day Wise Entry", color: "#00b894", path: "/day-wise" },
    { id: 3, title: "Overview", color: "#fdcb6e", path: "/overview" },
    { id: 4, title: "Payment Summary", color: "#0984e3", path: "/payments" },
    { id: 5, title: "PDF Download", color: "#e84393", path: "/pdf" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1.5, sm: 3 },
        py: 2,
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      }}
    >
      {/* HEADER */}
      <Card
        elevation={6}
        sx={{
          maxWidth: 1000,
          mx: "auto",
          mb: 4,
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Box>
            <Typography variant="h5" fontWeight={700} color="#2e7d32">
              🥛 Milk Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage deliveries efficiently
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="center"
            width={{ xs: "100%", sm: "auto" }}
          >
            <Select
              value={shift}
              size="small"
              onChange={(e) => setShift(e.target.value)}
              sx={{
                width: { xs: "100%", sm: 140 },
                background: "#f7f9fa",
                borderRadius: 2,
              }}
            >
              <MenuItem value="Morning">Morning</MenuItem>
              <MenuItem value="Night">Night</MenuItem>
            </Select>

            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
              sx={{
                width: { xs: "100%", sm: "auto" },
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Logout
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* DASHBOARD CARDS */}
      <Grid
        container
        spacing={2.5}
        maxWidth={1000}
        mx="auto"
      >
        {cards.map((card) => (
          <Grid key={card.id} item xs={12} sm={6} md={4}>
            <Card
              onClick={() => navigate(card.path)}
              elevation={4}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                cursor: "pointer",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ color: card.color }}
              >
                {card.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{ mt: 1, color: "text.secondary" }}
              >
                Tap to open
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Dashboard;
