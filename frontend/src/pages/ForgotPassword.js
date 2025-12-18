import React, { useState } from "react";
import api from "../api/axios";
import {
  TextField,
  Button,
  Card,
  Typography,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (!email) {
      alert("Enter your email");
      return;
    }
    try {
      const res = await api.post("/api/auth/forgot", { email });
      alert(res.data.message || res.data.error);
      if (res.data.success) setStep(2);
    } catch {
      alert("Failed to send OTP");
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) {
      alert("Fill all fields");
      return;
    }
    try {
      const res = await api.post("/api/auth/reset", {
        email,
        otp,
        newPassword,
      });
      alert(res.data.message || res.data.error);
      if (res.data.success) navigate("/", { replace: true });
    } catch {
      alert("Failed to reset password");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 380,
          p: 3,
          borderRadius: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700} textAlign="center">
          🔐 Forgot Password
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          mt={0.5}
        >
          {step === 1
            ? "Enter your registered email"
            : "Enter OTP & new password"}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={2}>
          {step === 1 && (
            <>
              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                variant="contained"
                size="large"
                onClick={sendOtp}
              >
                Send OTP
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <TextField
                label="OTP"
                fullWidth
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <TextField
                label="New Password"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Button
                variant="contained"
                size="large"
                onClick={resetPassword}
              >
                Reset Password
              </Button>
            </>
          )}

          <Button
            size="small"
            color="secondary"
            onClick={() => navigate("/")}
          >
            ← Back to Login
          </Button>
        </Stack>
      </Card>
    </Box>
  );
}

export default ForgotPassword;
