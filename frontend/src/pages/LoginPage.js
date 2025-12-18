import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Auto-redirect if already logged in
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/api/auth/login", { email, password });

      if (res.data.success) {
  localStorage.clear(); // clear old session
  localStorage.setItem("userId", res.data.userId);
  navigate("/dashboard");
} else {
        setMessage(res.data.message || "Invalid credentials");
      }
    } catch {
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background: "linear-gradient(135deg, #4facfe, #00f2fe)",
      }}
    >
      <Card
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 380,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h5"
          fontWeight={700}
          textAlign="center"
          gutterBottom
        >
          🥛 Milk Attendance
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ color: "text.secondary", mb: 2 }}
        >
          Sign in to continue
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <form onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            size="small"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            size="small"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Typography
            variant="body2"
            sx={{
              mt: 1,
              textAlign: "right",
              color: "#1976d2",
              cursor: "pointer",
              fontWeight: 500,
            }}
            onClick={() => navigate("/forgot")}
          >
            Forgot password?
          </Typography>

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            sx={{
              mt: 2.5,
              py: 1.2,
              fontWeight: 700,
              borderRadius: 2,
              background:
                "linear-gradient(135deg, #667eea, #764ba2)",
            }}
          >
            Login
          </Button>
        </form>

        {message && (
          <Typography
            color="error"
            variant="body2"
            textAlign="center"
            sx={{ mt: 1.5 }}
          >
            {message}
          </Typography>
        )}

        <Typography
          variant="body2"
          textAlign="center"
          sx={{ mt: 2 }}
        >
          Don’t have an account?{" "}
          <Link to="/register" style={{ fontWeight: 600 }}>
            Register
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}

export default LoginPage;
