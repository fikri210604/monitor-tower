"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 ${type === "success"
                ? "bg-white border-green-100 text-green-700 shadow-green-100"
                : "bg-white border-red-100 text-red-700 shadow-red-100"
            }`}>
            {type === "success" ? (
                <div className="bg-green-100 p-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                </div>
            ) : (
                <div className="bg-red-100 p-1 rounded-full">
                    <XCircle className="w-4 h-4" />
                </div>
            )}

            <p className="font-medium text-sm pr-4">{message}</p>

            <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
