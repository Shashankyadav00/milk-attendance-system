import React, { useState } from "react";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import api from "../api/axios";
import { Link, useNavigate } from "react-router-dom";

function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (res.data?.success) {
        setMessage("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 1200);
      } else {
        setMessage(res.data?.message || "Registration failed");
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
        background: "linear-gradient(135deg, #43cea2, #185a9d)",
      }}
    >
      <Card
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          📝 Create Account
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mb: 2 }}
        >
          Register to manage your milk attendance
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <form onSubmit={handleRegister}>
          <TextField
            label="Full Name"
            fullWidth
            size="small"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <TextField
            label="Email Address"
            type="email"
            fullWidth
            size="small"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            size="small"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

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
            Register
          </Button>
        </form>

        {message && (
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              color: message.includes("successful") ? "green" : "error.main",
            }}
          >
            {message}
          </Typography>
        )}

        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{" "}
          <Link to="/" style={{ fontWeight: 600 }}>
            Login
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}

export default RegisterPage;
