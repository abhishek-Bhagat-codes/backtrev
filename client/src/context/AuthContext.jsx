import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleLogin = useCallback(
    async ({ email, password }) => {
      setError(null);
      setLoading(true);
      try {
        const { token: newToken } = await api.login(email, password);
        localStorage.setItem("token", newToken);
        setToken(newToken);
        navigate("/");
      } catch (err) {
        setError(err.message || "Login failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const handleSignup = useCallback(
    async (payload) => {
      setError(null);
      setLoading(true);
      try {
        // First create the user
        await api.signup(payload);
        // Then immediately log them in using email/password
        if (payload.email && payload.password) {
          await handleLogin({ email: payload.email, password: payload.password });
        } else {
          navigate("/login");
        }
      } catch (err) {
        setError(err.message || "Signup failed");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [handleLogin, navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored && !token) {
      setToken(stored);
    }
  }, [token]);

  const value = {
    token,
    isAuthenticated: Boolean(token),
    loading,
    error,
    login: handleLogin,
    signup: handleSignup,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};


