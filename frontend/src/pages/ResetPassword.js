import React, { useState, useEffect } from "react";
import {
  Card,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ResetPassword() {
  const query = useQuery();
  const navigate = useNavigate();

  const emailFromQuery = query.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (emailFromQuery) setEmail(emailFromQuery);
  }, [emailFromQuery]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (password.length < 6) {
      setMsg("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }
    if (!otp || otp.length < 4) {
      setMsg("Enter the OTP you received.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/api/auth/reset", {
        email,
        otp,
        newPassword: password,
      });

      if (res.data?.success) {
        alert("Password reset successful. Please login.");
        navigate("/", { replace: true });
      } else {
        setMsg(res.data?.error || "Reset failed");
      }
    } catch (err) {
      console.error(err);
      setMsg("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #74ebd5, #9face6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 3,
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={1}>
          🔐 Reset Password
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Enter the OTP sent to your email and choose a new password.
        </Typography>

        <form onSubmit={submit}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            disabled={!!emailFromQuery}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <TextField
            label="OTP"
            fullWidth
            margin="normal"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            margin="normal"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              py: 1.2,
              fontWeight: 600,
              background:
                "linear-gradient(135deg, #6a11cb, #2575fc)",
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        {msg && (
          <Typography
            color="error"
            mt={2}
            textAlign="center"
            fontSize={14}
          >
            {msg}
          </Typography>
        )}
      </Card>
    </Box>
  );
}
