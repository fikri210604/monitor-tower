"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, X, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import PhotoLightbox from "../Shared/PhotoLightbox";

interface Photo {
    id: string;
    url: string;
    deskripsi: string | null;
}

interface AssetGalleryProps {
    assetId: string;
    initialPhotos: Photo[];
    canEdit: boolean;
}

export default function AssetGallery({ assetId, initialPhotos, canEdit }: AssetGalleryProps) {
    const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
    const [isUploading, setIsUploading] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
    const router = useRouter();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const uploadData = await uploadRes.json();
            const fileUrl = uploadData.url;

            // 2. Link to Asset
            const linkRes = await fetch(`/api/assets/${assetId}/photos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: fileUrl, deskripsi: "Foto Dokumentasi" }),
            });

            if (!linkRes.ok) throw new Error("Failed to link photo");
            const newPhoto = await linkRes.json();

            // 3. Update State
            setPhotos((prev) => [...prev, newPhoto]);
            router.refresh(); // Refresh server components to ensure sync
        } catch (error) {
            console.error(error);
            alert("Gagal mengupload foto");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (photoId: string) => {
        if (!confirm("Apakah anda yakin ingin menghapus foto ini?")) return;

        try {
            const res = await fetch(`/api/photos/${photoId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to delete");

            setPhotos((prev) => prev.filter((p) => p.id !== photoId));
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Gagal menghapus foto");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex justify-between items-center">
                <span>Galeri Foto ({photos.length})</span>
                {/* Optional: Add button logic if needed here */}
            </div>
            <div className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Photo List */}
                    {photos.map((foto) => (
                        <div key={foto.id} className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 group border border-gray-100">
                            <Image
                                src={foto.url}
                                alt={foto.deskripsi || "Foto Aset"}
                                fill
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                unoptimized // Fix for local uploads not appearing immediately
                            />

                            {/* Caption */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pointer-events-none">
                                <p className="text-white text-[10px] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    {foto.deskripsi}
                                </p>
                            </div>

                            {/* Click Area for Lightbox */}
                            <div
                                className="absolute inset-0 z-10 cursor-pointer"
                                onClick={() => {
                                    setSelectedPhotoIndex(photos.findIndex(p => p.id === foto.id));
                                    setIsLightboxOpen(true);
                                }}
                            ></div>

                            {/* Delete Button (Elevated z-index) */}
                            {canEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent opening lightbox
                                        handleDelete(foto.id);
                                    }}
                                    className="absolute top-2 right-2 z-20 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 transform scale-90 group-hover:scale-100 shadow-sm"
                                    title="Hapus Foto"
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    ))}

                    {/* Upload Button */}
                    {canEdit && (
                        <label className={`relative aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-pln-blue transition-all group ${isUploading ? 'pointer-events-none opacity-75' : ''}`}>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pln-blue"></div>
                            ) : (
                                <>
                                    <div className="p-2 rounded-full bg-white shadow-sm mb-2 group-hover:scale-110 transition-transform">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-xs font-semibold">Tambah Foto</span>
                                </>
                            )}
                        </label>
                    )}
                </div>

                {/* Empty State */}
                {photos.length === 0 && !canEdit && (
                    <div className="h-32 flex flex-col items-center justify-center text-gray-400 gap-2">
                        <ImageIcon size={32} className="opacity-20" />
                        <span className="text-sm">Belum ada foto dokumentasi</span>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {isLightboxOpen && (
                <PhotoLightbox
                    photos={photos}
                    initialIndex={selectedPhotoIndex}
                    onClose={() => setIsLightboxOpen(false)}
                />
            )}
        </div>
    );
}
