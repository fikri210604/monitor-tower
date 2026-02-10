"use client";

import { useEffect, useState } from "react";
import NextImage from "next/image";
import logoPln from "../../public/Logo_PLN.png";

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onFinish, 500); // Wait for fade-out animation
        }, 2000); // Show for 2 seconds

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
        >
            <div className="relative mb-8">
                <div className="w-32 h-32 flex items-center justify-center relative z-10 overflow-hidden">
                    <NextImage src={logoPln} alt="Logo PLN" className="w-full h-full object-contain" priority />
                </div>
            </div>

            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-pln-blue tracking-tight animate-pulse">
                    Sertifikasi Tower
                </h1>
                <p className="text-sm font-medium text-pln-cyan tracking-widest uppercase">
                    PT PLN (Persero)
                </p>
            </div>

            <div className="absolute bottom-10 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-pln-gradient animate-[loading_2s_ease-in-out_infinite]"></div>
            </div>

            <style jsx>{`
        @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0); }
            100% { transform: translateX(100%); }
        }
      `}</style>
        </div>
    );
}
