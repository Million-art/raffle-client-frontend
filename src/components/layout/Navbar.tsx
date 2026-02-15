"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Users, Trophy, LogIn, LayoutDashboard, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-slate-950/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-soft">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Raffle<span className="text-primary-400">Hub</span>
          </span>
        </Link>

        <div className="hidden md:ml-10 md:flex md:items-center md:gap-8">
          <Link
            href="/raffles"
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-primary-400 ${
              pathname?.startsWith("/raffles") ? "text-primary-400" : "text-slate-400"
            }`}
          >
            <Users className="h-4 w-4" />
            Explore Raffles
          </Link>
          {user && (
            <Link
              href="/winners"
              className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-primary-400 ${
                pathname?.startsWith("/winners") ? "text-primary-400" : "text-slate-400"
              }`}
            >
              <Trophy className="h-4 w-4" />
              Winners History
            </Link>
          )}
          <div className="h-6 w-px bg-white/10" />

          {!loading && (
            <>
              {user ? (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((o) => !o)}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-2 pr-3 py-1.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
                      aria-expanded={menuOpen}
                      aria-haspopup="true"
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 font-bold">
                          {user.fullName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || "?"}
                        </span>
                      )}
                      <span className="max-w-[120px] truncate">{user.fullName || user.email}</span>
                    </button>
                    {menuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          aria-hidden="true"
                          onClick={() => setMenuOpen(false)}
                        />
                        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-white/10 bg-slate-900 py-2 shadow-xl backdrop-blur-md">
                          <div className="border-b border-white/5 px-4 py-2">
                            <p className="truncate text-sm font-semibold text-white">{user.fullName || "User"}</p>
                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                            {user.phone && <p className="mt-1 truncate text-xs text-slate-500">{user.phone}</p>}
                            {user.location && <p className="truncate text-xs text-slate-500">{user.location}</p>}
                          </div>
                          <Link
                            href="/dashboard"
                            className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-white/5 ${
                              pathname === "/dashboard" ? "bg-primary-500/20 text-primary-400 font-semibold" : "text-slate-300"
                            }`}
                            onClick={() => setMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            My dashboard
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-primary-400"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-950 transition-all hover:bg-slate-100"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex md:hidden">
          {user && (
            <Link
              href="/dashboard"
              className={`rounded-full p-2 ${
                pathname === "/dashboard" ? "bg-primary-500/20 text-primary-400" : "bg-white/5 text-slate-400"
              }`}
              aria-label="My dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}
          {!user && !loading && (
            <div className="flex gap-2">
              <Link href="/login" className="rounded-full bg-white/5 p-2 text-slate-400" aria-label="Sign in">
                <LogIn className="h-5 w-5" />
              </Link>
              <Link href="/signup" className="rounded-full bg-white p-2 text-slate-950" aria-label="Sign up">
                <UserPlus className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
