"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useState } from "react";

// ... imports

interface DashboardChartsProps {
    total: number;
    certified: number;
    belum: number;
    nullCert: number;
    safe: number;
    problem: number;
    unknownHealth: number;
}

export default function DashboardCharts({ tower, gi }: { tower: DashboardChartsProps, gi: DashboardChartsProps }) {
    const [activeTab, setActiveTab] = useState<"TOWER" | "GI">("TOWER");

    const data = activeTab === "TOWER" ? tower : gi;

    const certData = [
        { name: "Bersertifikat", value: data.certified, color: "#10b981" }, // Emerald 500
        { name: "Belum", value: data.belum, color: "#f97316" }, // Orange 500 (Belum)
        { name: "Tanpa Data", value: data.nullCert, color: "#9ca3af" }, // Gray 400 (Tanpa Data)
    ];

    const statusData = [
        { name: "Aman", value: data.safe, color: "#3b82f6" }, // Blue 500
        { name: "Masalah", value: data.problem, color: "#ef4444" }, // Red 500
        { name: "Tanpa Data", value: data.unknownHealth, color: "#9ca3af" }, // Gray 400
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex justify-center">
                <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                    <button
                        onClick={() => setActiveTab("TOWER")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "TOWER"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Tapak Tower
                    </button>
                    <button
                        onClick={() => setActiveTab("GI")}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === "GI"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Gardu Induk
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1: Sertifikasi */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-700 mb-2 w-full text-center">Status Sertifikasi ({activeTab === "TOWER" ? "Tower" : "GI"})</h3>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={certData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {certData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full mt-2 text-center text-sm">
                        <div>
                            <p className="text-gray-500">Sudah</p>
                            <p className="font-bold text-lg text-emerald-600">{data.certified}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Belum</p>
                            <p className="font-bold text-lg text-amber-500">{data.belum}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">No Data</p>
                            <p className="font-bold text-lg text-gray-500">{data.nullCert}</p>
                        </div>
                    </div>
                </div>

                {/* Chart 2: Kesehatan Aset */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-gray-700 mb-2 w-full text-center">Kesehatan Aset ({activeTab === "TOWER" ? "Tower" : "GI"})</h3>
                    <div className="w-full h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-2 w-full mt-2 text-center text-sm">
                        <div>
                            <p className="text-gray-500">Aman</p>
                            <p className="font-bold text-lg text-blue-500">{data.safe}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">Masalah</p>
                            <p className="font-bold text-lg text-red-500">{data.problem}</p>
                        </div>
                        <div>
                            <p className="text-gray-500">No Data</p>
                            <p className="font-bold text-lg text-gray-500">{data.unknownHealth}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
