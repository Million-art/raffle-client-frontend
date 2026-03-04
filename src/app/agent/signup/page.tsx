"use client";

import { useEffect } from "react";

const AGENT_SIGNUP_URL =
  process.env.NEXT_PUBLIC_AGENT_SIGNUP_URL || "http://localhost:5173/agent/signup";

export default function AgentSignupRedirect() {
  useEffect(() => {
    window.location.href = AGENT_SIGNUP_URL;
  }, []);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <p className="text-slate-400">Redirecting to agent signup…</p>
    </div>
  );
}
