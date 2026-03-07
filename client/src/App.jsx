import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tourist from "./pages/Tourists";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import TouristDetail from "./pages/TouristDetail";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import RiskyZones from "./pages/RiskyZones";
import AppLayout from "./components/layout/AppLayout";
import { tourists as dummyTourists, alerts as dummyAlerts, zones as dummyZones } from "./data/dummyData";
import api from "./services/api";
import { AuthProvider, useAuth } from "./context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [tourists, setTourists] = useState(dummyTourists);
  const [alerts, setAlerts] = useState(dummyAlerts);
  const [zones, setZones] = useState(dummyZones);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useDummy, setUseDummy] = useState(false);

  const fetchData = useCallback(async () => {
    if (useDummy) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [touristsRes, alertsRes, zonesRes] = await Promise.all([
        api.getTourists(),
        api.getAlerts(),
        api.getZones()
      ]);
      setTourists(touristsRes.tourists || []);
      setAlerts(alertsRes.alerts || []);
      setZones(zonesRes.zones || []);
    } catch (err) {
      setError(err.message || "Failed to load data");
      setTourists(dummyTourists);
      setAlerts(dummyAlerts);
      setZones(dummyZones);
    } finally {
      setLoading(false);
    }
  }, [useDummy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateAlertStatus = async (alertId, newStatus) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert?._type === "SOS" && alert?._backendId) {
      try {
        await api.updateAlertStatus(alert._backendId, newStatus);
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
        );
      } catch (err) {
        console.error("Failed to update alert status:", err);
      }
    } else {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status: newStatus } : a))
      );
    }
  };

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route
              index
              element={
                <Dashboard
                  tourists={tourists}
                  alerts={alerts}
                  zones={zones}
                  updateAlertStatus={updateAlertStatus}
                  loading={loading}
                  error={error}
                  onRetry={fetchData}
                  useDummy={useDummy}
                  setUseDummy={setUseDummy}
                />
              }
            />
            <Route path="tourists" element={<Tourist tourists={tourists} loading={loading} />} />
            <Route
              path="tourists/:touristId"
              element={<TouristDetail tourists={tourists} alerts={alerts} />}
            />
            <Route
              path="alerts"
              element={
                <Alerts alerts={alerts} updateAlertStatus={updateAlertStatus} loading={loading} />
              }
            />
            <Route path="reports" element={<Reports />} />
            <Route path="riskyzones" element={<RiskyZones zones={zones} loading={loading} />} />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
