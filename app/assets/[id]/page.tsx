import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
    ArrowLeft, MapPin, Calendar, Ruler, FileText, Download,
    ShieldCheck, AlertTriangle, Zap, TowerControl, Edit, Trash2,
    CheckCircle2, AlertCircle
} from "lucide-react";
import Image from "next/image";
import AssetGallery from "@/app/components/Asset/AssetGallery";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/auth/signin");

    const { id } = await params;

    // Fetch Asset
    const asset = await prisma.asetTower.findUnique({
        where: { id },
        include: { fotoAset: true }
    });

    if (!asset) return notFound();

    const userRole = (session?.user as any)?.role;
    const isOperator = userRole === "OPERATOR";
    const canEdit = userRole === "MASTER" || userRole === "ADMIN";

    const hasCertificate = asset.nomorSertifikat && asset.nomorSertifikat !== "-" && asset.nomorSertifikat !== "";
    const isProblem = asset.permasalahanAset && !asset.permasalahanAset.toLowerCase().includes("clean");

    // Filter photos for Operator
    const filteredPhotos = isOperator
        ? asset.fotoAset.filter((f: any) => f.kategori !== "ASET" && f.kategori !== null)
        : asset.fotoAset;

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
            {/* Header / Nav */}
            <div className="flex items-center justify-between">
                <Link href="/assets" className="flex items-center text-gray-500 hover:text-pln-blue transition-colors gap-2 font-medium">
                    <ArrowLeft size={20} />
                    Kembali ke Data Aset
                </Link>
            </div>

            {/* Title Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className="bg-pln-blue/10 text-pln-blue px-3 py-1 rounded text-xs font-bold tracking-wide">
                            SAP: {asset.kodeSap}
                        </span>
                        {asset.jenisBangunan === "GARDU_INDUK" ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                <Zap size={14} /> Gardu Induk
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                <TowerControl size={14} /> Tapak Tower
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {asset.deskripsi || "Aset Tanpa Nama"}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <MapPin size={16} />
                        {asset.alamat || "Alamat belum diisi"}
                        {asset.desa && <span>• {asset.desa}</span>}
                        {asset.kabupaten && <span>• {asset.kabupaten}</span>}
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-bold ${hasCertificate
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-red-50 border-red-100 text-red-700"
                        }`}>
                        {hasCertificate ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                        {hasCertificate ? "Bersertifikat" : "Belum Bersertifikat"}
                    </div>
                    <div className={`text-xs font-semibold px-2 py-0.5 rounded-md ${!isProblem ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
                        }`}>
                        {!isProblem ? "Kondisi Aman (Clean & Clear)" : "Masalah Sengketa"}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* LEFT COL: Photos & General Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Photos */}
                    <AssetGallery
                        assetId={asset.id}
                        initialPhotos={filteredPhotos}
                        canEdit={canEdit}
                    />

                    {/* General Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={18} className="text-pln-blue" />
                            Informasi Umum
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Kode Unit</label>
                                <p className="font-semibold text-gray-800">{asset.kodeUnit}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tahun Perolehan</label>
                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400" />
                                    {asset.tahunPerolehan || "-"}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Luas Tanah</label>
                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                    <Ruler size={16} className="text-gray-400" />
                                    {asset.luasTanah ? `${asset.luasTanah.toLocaleString('id-ID')} m²` : "-"}
                                </p>
                            </div>
                            {!isOperator && (
                                <div>
                                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Status Penguasaan</label>
                                    <p className="font-semibold text-gray-800">
                                        {asset.penguasaanTanah === "DIKUASAI" ? (
                                            <span className="text-green-600">Dikuasai Penuh</span>
                                        ) : (
                                            <span className="text-red-600">Tidak Dikuasai</span>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Alamat Lengkap</label>
                            <p className="font-medium text-gray-700 leading-relaxed flex items-start gap-2">
                                <MapPin size={18} className="text-pln-blue mt-0.5 flex-shrink-0" />
                                <span>
                                    {[
                                        asset.alamat,
                                        asset.desa && `Desa ${asset.desa}`,
                                        asset.kecamatan && `Kec. ${asset.kecamatan}`,
                                        asset.kabupaten && `Kab. ${asset.kabupaten}`,
                                        asset.provinsi && `Prov. ${asset.provinsi}`
                                    ].filter(Boolean).join(", ") || "Alamat belum dilengkapi"}
                                </span>
                            </p>
                        </div>
                    </div>
                </div >

                {/* RIGHT COL: Map & Legal */}
                < div className="space-y-6" >
                    {/* Maps Preview */}
                    < div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" >
                        <div className="p-4 border-b border-gray-100 font-bold text-gray-800 flex items-center gap-2">
                            <MapPin size={18} className="text-red-500" />
                            Lokasi
                        </div>
                        <div className="aspect-square bg-gray-100 relative">
                            {/* Static Map Image / Placeholder */}
                            <iframe
                                className="w-full h-full border-0"
                                src={`https://www.google.com/maps?q=${asset.koordinatY},${asset.koordinatX}&z=15&output=embed`}
                                loading="lazy"
                                allowFullScreen
                            ></iframe>
                            <div className="absolute bottom-4 left-4 right-4">
                                <a
                                    href={`https://www.google.com/maps?q=${asset.koordinatY},${asset.koordinatX}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-center bg-white/90 backdrop-blur text-pln-blue font-bold py-2 rounded-lg shadow-sm hover:bg-white transition-colors text-sm"
                                >
                                    Buka Google Maps
                                </a>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 text-xs text-gray-600 font-mono text-center">
                            Lat: {asset.koordinatY}, Long: {asset.koordinatX}
                        </div>
                    </div >

                    {/* LEGAL SECTION - RESTRICTED */}
                    {
                        !isOperator ? (
                            <div className="bg-white rounded-2xl shadow-sm border border-l-4 border-l-pln-blue border-gray-100 overflow-hidden">
                                <div className="p-4 border-b border-gray-100 bg-blue-50/30 font-bold text-pln-blue flex items-center gap-2">
                                    <ShieldCheck size={18} />
                                    Data Legalitas
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Jenis Dokumen</label>
                                        <p className="font-semibold text-gray-800">{asset.jenisDokumen || "-"}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Nomor Sertifikat</label>
                                        <p className="font-semibold text-gray-800">{asset.nomorSertifikat || "Belum ada nomor"}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tgl Terbit</label>
                                            <p className="text-sm font-semibold text-gray-600">
                                                {asset.tanggalAwalSertifikat ? new Date(asset.tanggalAwalSertifikat).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tgl Berakhir</label>
                                            <p className="text-sm font-semibold text-gray-600">
                                                {asset.tanggalAkhirSertifikat ? new Date(asset.tanggalAkhirSertifikat).toLocaleDateString("id-ID", { day: '2-digit', month: '2-digit', year: 'numeric' }) : "-"}
                                            </p>
                                        </div>
                                    </div>

                                    {asset.linkSertifikat && (
                                        <a
                                            href={asset.linkSertifikat}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-2.5 bg-pln-blue text-white rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm mt-2"
                                        >
                                            <Download size={18} />
                                            Unduh Softfile
                                        </a>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100 border-dashed">
                                <ShieldCheck size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm font-bold text-gray-400">Data Legalitas Terbatas</p>
                                <p className="text-xs text-gray-400 mt-1">Anda tidak memiliki akses untuk melihat dokumen legalitas aset ini.</p>
                            </div>
                        )
                    }
                </div >
            </div >
        </div >
    );
}
