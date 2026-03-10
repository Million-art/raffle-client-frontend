"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LogIn,
  LayoutDashboard,
  LogOut,
  UserPlus,
  Ticket,
  Users,
  Menu,
  X
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export const Navbar = () => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo – bigger and more visible */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image src="/logo.png" alt="Logo" width={160} height={50} className="h-12 w-auto object-contain" priority />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">

          <Link
            href="/raffles"
            className={`flex items-center gap-1 text-sm font-medium ${
              pathname?.startsWith("/raffles")
                ? "text-brand-blue"
                : "text-gray-600 hover:text-brand-blue"
            }`}
          >
            <Users className="h-4 w-4" />
            Raffles
          </Link>

          {user && (
            <Link
              href="/my-raffles"
              className={`flex items-center gap-1 text-sm font-medium ${
                pathname?.startsWith("/my-raffles")
                  ? "text-brand-blue"
                  : "text-gray-600 hover:text-brand-blue"
              }`}
            >
              <Ticket className="h-4 w-4" />
              My Raffles
            </Link>
          )}

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-4">

                  <NotificationBell />

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {user.picture ? (
                        <img
                          src={user.picture}
                          className="h-8 w-8 rounded-full"
                          alt="user"
                        />
                      ) : (
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue font-bold">
                          {user.fullName?.charAt(0)?.toUpperCase() ||
                            user.email?.charAt(0)?.toUpperCase()}
                        </span>
                      )}

                      <span className="max-w-[120px] truncate">
                        {user.fullName || user.email}
                      </span>
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-white shadow-lg">

                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </Link>

                        <Link
                          href="/my-raffles"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          <Ticket className="h-4 w-4" />
                          My Raffles
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>

                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">

                  <Link
                    href="/login"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-brand-blue"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Link>

                  <Link
                    href="/signup"
                    className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
                  >
                    <UserPlus className="h-4 w-4 inline mr-1" />
                    Sign up
                  </Link>

                </div>
              )}
            </>
          )}

        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg animate-fade-in">
          <div className="px-4 py-4 space-y-1">

            <Link
              href="/raffles"
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                pathname?.startsWith("/raffles")
                  ? "bg-brand-blue/10 text-brand-blue"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              <Users className="h-5 w-5" />
              Raffles
            </Link>

            {user && (
              <>
                <Link
                  href="/my-raffles"
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    pathname?.startsWith("/my-raffles")
                      ? "bg-brand-blue/10 text-brand-blue"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Ticket className="h-5 w-5" />
                  My Raffles
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  Dashboard
                </Link>
              </>
            )}

            <div className="border-t border-slate-100 pt-3 mt-3">
              {!loading && (
                <>
                  {user ? (
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign out
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setMobileOpen(false)}
                      >
                        <LogIn className="h-4 w-4" />
                        Sign in
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-brand-blue text-sm font-semibold text-white hover:bg-blue-600"
                        onClick={() => setMobileOpen(false)}
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign up
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
};