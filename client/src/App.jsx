import React, { useState, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Tourist from "./pages/Tourists";
import Login from "./pages/Login";
import TouristDetail from "./pages/TouristDetail";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import RiskyZones from "./pages/RiskyZones";
import AppLayout from "./components/layout/AppLayout";
import { tourists as dummyTourists, alerts as dummyAlerts, zones as dummyZones } from "./data/dummyData";
import { getTourists, getAlerts, getZones, updateAlertStatus as updateAlertStatusApi } from "./services/api";
import Signup from "./pages/Signup";

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
      // Fetch zones from http://10.0.82.200:3000/zones (via /ms/zones proxy)
      const zonesRes = await getZones();
      const zonesData = Array.isArray(zonesRes) ? zonesRes : (zonesRes?.zones || zonesRes?.data?.zones || []);
      setZones(zonesData);
    } catch (err) {
      console.warn("Zones fetch failed, using dummy:", err.message);
      setZones(dummyZones);
    }
    try {
      const [touristsRes, alertsRes] = await Promise.all([getTourists(), getAlerts()]);
      setTourists(touristsRes?.tourists || touristsRes?.data?.tourists || []);
      setAlerts(alertsRes?.alerts || alertsRes?.data?.alerts || []);
    } catch (err) {
      setError(err.message || "Failed to load data");
      setTourists(dummyTourists);
      setAlerts(dummyAlerts);
    } finally {
      setLoading(false);
    }
  }, [useDummy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (useDummy) return;

    const intervalId = setInterval(async () => {
      try {
        const alertsRes = await getAlerts();
        setAlerts(alertsRes?.alerts || alertsRes?.data?.alerts || []);
      } catch (err) {
        console.warn("Auto refresh for alerts failed:", err.message);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [useDummy]);

  const handleUpdateAlertStatus = async (alertId, newStatus) => {
    const alert = alerts.find((a) => a.id === alertId);
    if (alert?._type === "SOS" && alert?._backendId) {
      try {
        await updateAlertStatusApi(alert._backendId, newStatus);
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
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route
              index
              element={
                <Dashboard
                  tourists={tourists}
                  alerts={alerts}
                  zones={zones}
                  updateAlertStatus={handleUpdateAlertStatus}
                  loading={loading}
                  error={error}
                  // onRetry={fetchData}
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
                <Alerts 
                  alerts={alerts} 
                  updateAlertStatus={handleUpdateAlertStatus} 
                  loading={loading} 
                />
              }
            />
            <Route path="reports" element={<Reports zones={zones}/>} />
            <Route path="riskyzones" element={<RiskyZones zones={zones} loading={loading} onRefresh={fetchData} />} />
          </Route>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
