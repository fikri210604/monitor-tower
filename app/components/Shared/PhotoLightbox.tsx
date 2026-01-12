"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
    id: string;
    url: string;
    deskripsi?: string | null;
}

interface PhotoLightboxProps {
    photos: Photo[];
    initialIndex: number;
    onClose: () => void;
}

export default function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    // Ensure index is valid when photos change (though photos shouldn't change while open usually)
    useEffect(() => {
        if (currentIndex >= photos.length && photos.length > 0) {
            setCurrentIndex(0);
        }
    }, [photos, currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]); // Dependencies handled inside handlers or by functional updates

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    if (!photos || photos.length === 0) return null;

    return (
        <div
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors z-[1001]"
            >
                <X size={32} />
            </button>

            <div
                className="relative max-w-7xl w-full h-full max-h-[90vh] flex flex-col items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Main Image Container */}
                <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
                    <img
                        src={photos[currentIndex].url}
                        alt={photos[currentIndex].deskripsi || "Foto Aset"}
                        className="max-w-full max-h-full w-auto h-auto object-contain shadow-2xl"
                    />

                    {/* Navigation Buttons */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={handleNext}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Caption / Description */}
                {(photos[currentIndex].deskripsi) && (
                    <div className="absolute bottom-24 bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-md text-sm font-medium">
                        {photos[currentIndex].deskripsi}
                    </div>
                )}

                {/* Thumbnails */}
                {photos.length > 1 && (
                    <div className="w-full max-w-3xl mt-4 h-20 flex gap-2 overflow-x-auto justify-center p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20">
                        {photos.map((photo, idx) => (
                            <button
                                key={photo.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`relative aspect-video h-full rounded-md overflow-hidden border-2 transition-all flex-shrink-0 ${idx === currentIndex
                                        ? "border-pln-blue opacity-100 ring-2 ring-pln-blue/50"
                                        : "border-transparent opacity-40 hover:opacity-100"
                                    }`}
                            >
                                <img
                                    src={photo.url}
                                    alt="thumb"
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
