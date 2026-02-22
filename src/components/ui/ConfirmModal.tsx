"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: "danger" | "primary";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    variant = "primary",
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md pointer-events-auto overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${variant === "danger"
                                                ? "bg-red-500/20 text-red-500"
                                                : "bg-primary-500/20 text-primary-500"
                                            }`}
                                    >
                                        <AlertCircle className="h-5 w-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">{title}</h3>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="rounded-full p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6 text-slate-400">
                                <p className="leading-relaxed">{message}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 border-t border-white/5 bg-white/[0.02] px-6 py-4">
                                <button
                                    onClick={onCancel}
                                    className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/5 transition-all active:scale-95"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={() => {
                                        onConfirm();
                                        onCancel(); // Close after confirm
                                    }}
                                    className={`rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${variant === "danger"
                                            ? "bg-red-600 hover:bg-red-500 shadow-red-600/20"
                                            : "bg-primary-600 hover:bg-primary-500 shadow-primary-600/20"
                                        }`}
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
