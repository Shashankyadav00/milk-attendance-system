import React, { useState, useEffect, useCallback } from "react";
import {
  TextField,
  Button,
  Card,
  Typography,
  IconButton,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Divider,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function AddCustomer() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [pricePerLitre, setPricePerLitre] = useState("");
  const [shift, setShift] = useState(
    localStorage.getItem("selectedShift") || "Morning"
  );
  const [customers, setCustomers] = useState([]);

  const [openEdit, setOpenEdit] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);

  const loadCustomers = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get("/api/customers", {
        params: { shift, userId },
      });
      setCustomers(res.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [shift, userId]);

  useEffect(() => {
    localStorage.setItem("selectedShift", shift);
    loadCustomers();
  }, [shift, loadCustomers]);

  /* ---------------- ADD CUSTOMER ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Customer name is required");
      return;
    }

    try {
      await api.post("/api/customers", {
        fullName: fullName.trim(),
        nickname: nickname.trim() || null,
        shift,
        pricePerLitre: pricePerLitre ? Number(pricePerLitre) : null,
        userId,
      });

      setFullName("");
      setNickname("");
      setPricePerLitre("");
      loadCustomers();
    } catch {
      alert("Failed to add customer");
    }
  };

  /* ---------------- DELETE ---------------- */

  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    await api.delete(`/api/customers/${id}`);
    loadCustomers();
  };

  /* ---------------- EDIT ---------------- */

  const handleEditClick = (customer) => {
    setEditCustomer({ ...customer });
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    await api.put(`/api/customers/${editCustomer.id}`, {
      ...editCustomer,
      pricePerLitre: editCustomer.pricePerLitre
        ? Number(editCustomer.pricePerLitre)
        : null,
    });
    setOpenEdit(false);
    loadCustomers();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, sm: 3 },
        background: "linear-gradient(135deg,#f8fafc,#eef2ff)",
      }}
    >
      <Card sx={{ maxWidth: 900, mx: "auto", p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
        {/* HEADER */}
        <Stack spacing={2}>
          <Button size="small" variant="outlined" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Typography variant="h6" fontWeight={700}>
              🧑‍🌾 Customers ({shift})
            </Typography>

            <Select
              size="small"
              value={shift}
              onChange={(e) => setShift(e.target.value)}
            >
              <MenuItem value="Morning">Morning</MenuItem>
              <MenuItem value="Night">Night</MenuItem>
            </Select>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* ADD FORM */}
        <Stack
          component="form"
          onSubmit={handleSubmit}
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
        >
          <TextField
            label="Full Name"
            fullWidth
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <TextField
            label="Nickname"
            fullWidth
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />

          <TextField
            label="₹ / Litre"
            type="number"
            fullWidth
            value={pricePerLitre}
            onChange={(e) => setPricePerLitre(e.target.value)}
          />

          <Button type="submit" variant="contained">
            Add
          </Button>
        </Stack>

        {/* LIST */}
        <Box mt={3}>
          {customers.length === 0 ? (
            <Typography color="text.secondary">
              No customers added for this shift
            </Typography>
          ) : (
            <Paper sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><b>Name</b></TableCell>
                    <TableCell><b>Nickname</b></TableCell>
                    <TableCell align="center"><b>₹ / Litre</b></TableCell>
                    <TableCell align="center"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {customers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {c.fullName}
                      </TableCell>
                      <TableCell>{c.nickname || "-"}</TableCell>
                      <TableCell align="center">
                        {c.pricePerLitre ?? "-"}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={() => handleEditClick(c)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteCustomer(c.id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Box>

        {/* EDIT DIALOG */}
        <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Customer</DialogTitle>
          <DialogContent>
            {editCustomer && (
              <Stack spacing={1.5} mt={1}>
                <TextField
                  label="Full Name"
                  value={editCustomer.fullName}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, fullName: e.target.value })
                  }
                />
                <TextField
                  label="Nickname"
                  value={editCustomer.nickname || ""}
                  onChange={(e) =>
                    setEditCustomer({ ...editCustomer, nickname: e.target.value })
                  }
                />
                <TextField
                  label="₹ / Litre"
                  type="number"
                  value={editCustomer.pricePerLitre ?? ""}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      pricePerLitre: e.target.value,
                    })
                  }
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button onClick={handleUpdate} variant="contained">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Card>
    </Box>
  );
}

export default AddCustomer;
