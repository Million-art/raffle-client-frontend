"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { getCsrfToken } from "@/lib/api";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getCsrfToken().catch(() => {});
  }, []);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const content = (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );

  if (!googleClientId) {
    return content;
  }

  return <GoogleOAuthProvider clientId={googleClientId}>{content}</GoogleOAuthProvider>;
}
