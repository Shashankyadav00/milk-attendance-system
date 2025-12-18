import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AddCustomer from "./pages/AddCustomer";
import DayWiseEntry from "./pages/DayWiseEntry";
import Overview from "./pages/Overview";
import PaymentSummary from "./pages/PaymentSummary";
import PdfDownload from "./pages/PdfDownload";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function PrivateRoute({ children }) {
  const userId = localStorage.getItem("userId");
  return userId ? children : <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      {/* 🌍 GLOBAL RESPONSIVE WRAPPER */}
      <div
        style={{
          width: "100%",
          maxWidth: "100vw",
          minHeight: "100vh",
          overflowX: "hidden",
        }}
      >
        <Routes>
          {/* AUTH */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* PROTECTED */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/add-customer"
            element={
              <PrivateRoute>
                <AddCustomer />
              </PrivateRoute>
            }
          />
          <Route
            path="/day-wise"
            element={
              <PrivateRoute>
                <DayWiseEntry />
              </PrivateRoute>
            }
          />
          <Route
            path="/overview"
            element={
              <PrivateRoute>
                <Overview />
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <PaymentSummary />
              </PrivateRoute>
            }
          />
          <Route
            path="/pdf"
            element={
              <PrivateRoute>
                <PdfDownload />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
