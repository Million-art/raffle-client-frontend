import { apiFetch, type ApiResponse } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  location?: string;
  picture?: string;
  createdAt: string;
}

export interface SignupPayload {
  phone: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface LoginPayload {
  identifier: string; // Phone or Email
  password: string;
}

export interface AuthResponse {
  user: User;
}

/** Sign up with phone, name, and password */
export async function signup(payload: SignupPayload): Promise<User> {
  const response = await apiFetch<ApiResponse<AuthResponse>>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data.user;
}

/** Log in with phone/email and password */
export async function login(payload: LoginPayload): Promise<User> {
  const response = await apiFetch<ApiResponse<AuthResponse>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data.user;
}

/** Log in with Google credential */
export async function googleLogin(credential: string, isSignup: boolean = false): Promise<User> {
  const response = await apiFetch<ApiResponse<AuthResponse>>("/api/auth/google", {
    method: "POST",
    body: JSON.stringify({ credential, isSignup }),
  });
  return response.data.user;
}

export async function getMe(): Promise<User | null> {
  try {
    const response = await apiFetch<ApiResponse<User>>("/api/me");
    return response.data;
  } catch {
    return null;
  }
}

export async function logout(): Promise<void> {
  await apiFetch("/api/auth/logout", { method: "POST" });
}
