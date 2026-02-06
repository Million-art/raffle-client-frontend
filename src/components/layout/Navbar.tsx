"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, Users, Trophy, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-[1.02]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-soft">
                        <Shield className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                        Raffle<span className="text-primary-600">Hub</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:ml-10 md:flex md:items-center md:gap-8">
                    <Link href="/raffles" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600">
                        <Users className="h-4 w-4" />
                        Explore Raffles
                    </Link>
                    <Link href="/winners" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-primary-600">
                        <Trophy className="h-4 w-4" />
                        Winners History
                    </Link>
                    <div className="h-6 w-px bg-slate-200" />
                    <Link 
                        href="/login" 
                        className="flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-900 transition-all hover:bg-slate-200"
                    >
                        <LogIn className="h-4 w-4" />
                        Join Now
                    </Link>
                </div>

                {/* Mobile Tablet Placeholder */}
                <div className="flex md:hidden">
                    {/* Mobile Menu Icon would go here */}
                </div>
            </div>
        </nav>
    );
};
