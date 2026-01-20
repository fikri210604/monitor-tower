import { User, FileText, Trash2, Edit, Plus, LogIn, Key, CheckCircle2 } from "lucide-react";

interface HistoryMobileCardProps {
    log: any; // Using any for now to be safe, or ActivityLog if I know the path
}

export default function HistoryMobileCard({ log }: HistoryMobileCardProps) {
    // Helper to get Icon based on action
    const getActionIcon = (action: string) => {
        switch (action) {
            case "CREATE": return <Plus size={16} className="text-emerald-600" />;
            case "UPDATE": return <Edit size={16} className="text-amber-600" />;
            case "DELETE": return <Trash2 size={16} className="text-red-600" />;
            case "LOGIN": return <LogIn size={16} className="text-blue-600" />;
            case "CHANGE_PASSWORD": return <Key size={16} className="text-purple-600" />;
            default: return <FileText size={16} className="text-gray-600" />;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case "CREATE": return "bg-emerald-50 border-emerald-100";
            case "UPDATE": return "bg-amber-50 border-amber-100";
            case "DELETE": return "bg-red-50 border-red-100";
            case "LOGIN": return "bg-blue-50 border-blue-100";
            case "CHANGE_PASSWORD": return "bg-purple-50 border-purple-100";
            default: return "bg-gray-50 border-gray-100";
        }
    };

    // Format Date: "20 Jan 2026, 14:30"
    const formattedDate = new Date(log.createdAt).toLocaleDateString("id-ID", {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const formatDetails = (details: string | null) => {
        if (!details) return "Tidak ada detail";
        try {
            const obj = JSON.parse(details);

            // 1. Import Excel
            if (obj.action === "REPLACE_ALL" || obj.action === "UPDATE_EXISTING") {
                return (
                    <div className="flex flex-col gap-1 mt-1">
                        <span className="font-bold text-gray-700 text-xs">
                            {obj.action === "REPLACE_ALL" ? "Ganti Semua" : "Update & Tambah"}
                        </span>
                        <div className="flex gap-2 text-[10px]">
                            <span className="text-green-600 bg-green-50 px-1 rounded">+{obj.created} Baru</span>
                            <span className="text-amber-600 bg-amber-50 px-1 rounded">~{obj.updated} Update</span>
                            {obj.failed > 0 && <span className="text-red-600 bg-red-50 px-1 rounded">!{obj.failed} Gagal</span>}
                        </div>
                    </div>
                );
            }

            // 2. Delete All
            if (obj.action === "DELETE_ALL_BEFORE_IMPORT") {
                return <span className="text-red-600 text-xs font-bold">Menghapus {obj.count} data lama (Reset)</span>;
            }

            // 3. Asset Actions (Create/Update/Delete)
            if (obj.sap) {
                return (
                    <div className="flex flex-col mt-0.5">
                        <span className="font-bold text-gray-800 text-xs">SAP: {obj.sap}</span>
                        {obj.deskripsi && <span className="text-gray-500 italic text-[11px] line-clamp-2">{obj.deskripsi}</span>}
                    </div>
                );
            }

            // Fallback
            return JSON.stringify(obj);
        } catch (e) {
            return details;
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative overflow-hidden">
            {/* Left Border Indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${getActionColor(log.action).split(" ")[0].replace("bg-", "bg-opacity-100 bg-")}`} />

            <div className="flex items-start gap-3 pl-2">
                {/* Icon Box */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getActionColor(log.action)}`}>
                    {getActionIcon(log.action)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {log.action}
                        </span>
                        <span className="text-[10px] text-gray-400">
                            {formattedDate}
                        </span>
                    </div>

                    <div className="text-sm font-semibold text-gray-800 leading-snug">
                        {formatDetails(log.details)}
                    </div>

                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                            {log.user?.name?.[0] || "?"}
                        </div>
                        <span className="text-xs text-gray-600 font-medium truncate">
                            {log.user?.name || "Unknown User"}
                        </span>
                        <span className="text-[10px] text-gray-400 px-1.5 py-0.5 bg-gray-50 rounded">
                            {log.user?.role}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
