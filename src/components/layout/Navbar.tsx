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
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-soft">
            <Shield className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Raffle<span className="text-primary-600">Hub</span>
          </span>
        </Link>

        <div className="hidden md:ml-10 md:flex md:items-center md:gap-8">
          <Link
            href="/raffles"
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-primary-600 ${
              pathname?.startsWith("/raffles") ? "text-primary-600" : "text-slate-600"
            }`}
          >
            <Users className="h-4 w-4" />
            Explore Raffles
          </Link>
          <Link
            href="/winners"
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors hover:text-primary-600 ${
              pathname?.startsWith("/winners") ? "text-primary-600" : "text-slate-600"
            }`}
          >
            <Trophy className="h-4 w-4" />
            Winners History
          </Link>
          <div className="h-6 w-px bg-slate-200" />

          {!loading && (
            <>
              {user ? (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((o) => !o)}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 pl-2 pr-3 py-1.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-100"
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
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold">
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
                        <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-medium">
                          <div className="border-b border-slate-100 px-4 py-2">
                            <p className="truncate text-sm font-semibold text-slate-900">{user.fullName || "User"}</p>
                            <p className="truncate text-xs text-slate-500">{user.email}</p>
                            {user.phone && <p className="mt-1 truncate text-xs text-slate-500">{user.phone}</p>}
                            {user.location && <p className="truncate text-xs text-slate-500">{user.location}</p>}
                          </div>
                          <Link
                            href="/dashboard"
                            className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 ${
                              pathname === "/dashboard" ? "bg-primary-50 text-primary-700 font-semibold" : "text-slate-700"
                            }`}
                            onClick={() => setMenuOpen(false)}
                          >
                            <LayoutDashboard className="h-4 w-4" />
                            My dashboard
                          </Link>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
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
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-slate-800"
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
                pathname === "/dashboard" ? "bg-primary-100 text-primary-600" : "bg-slate-100 text-slate-700"
              }`}
              aria-label="My dashboard"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Link>
          )}
          {!user && !loading && (
            <div className="flex gap-2">
              <Link href="/login" className="rounded-full bg-slate-100 p-2 text-slate-700" aria-label="Sign in">
                <LogIn className="h-5 w-5" />
              </Link>
              <Link href="/signup" className="rounded-full bg-slate-900 p-2 text-white" aria-label="Sign up">
                <UserPlus className="h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
