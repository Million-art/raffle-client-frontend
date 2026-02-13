"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User, SignupPayload, LoginPayload } from "@/services/auth.service";
import {
  getMe,
  signup as apiSignup,
  login as apiLogin,
  googleLogin as apiGoogleLogin,
  logout as apiLogout,
} from "@/services/auth.service";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signup: (payload: SignupPayload) => Promise<User>;
  login: (payload: LoginPayload) => Promise<User>;
  googleLogin: (credential: string, isSignup?: boolean) => Promise<User>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const signup = useCallback(async (payload: SignupPayload) => {
    setError(null);
    try {
      const u = await apiSignup(payload);
      setUser(u);
      return u;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Signup failed";
      setError(message);
      throw e;
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setError(null);
    try {
      const u = await apiLogin(payload);
      setUser(u);
      return u;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Login failed";
      setError(message);
      throw e;
    }
  }, []);

  const googleLogin = useCallback(async (credential: string, isSignup: boolean = false) => {
    setError(null);
    try {
      const u = await apiGoogleLogin(credential, isSignup);
      setUser(u);
      return u;
    } catch (e) {
      const message = e instanceof Error ? e.message : "Google login failed";
      setError(message);
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    try {
      await apiLogout();
    } finally {
      setUser(null);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: AuthContextValue = {
    user,
    loading,
    signup,
    login,
    googleLogin,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
