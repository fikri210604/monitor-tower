"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface DashboardChartsProps {
    total: number;
    certified: number;
    safe: number;
}

export default function DashboardCharts({ total, certified, safe }: DashboardChartsProps) {
    const uncertified = total - certified;
    const problem = total - safe;

    const certData = [
        { name: "Bersertifikat", value: certified, color: "#10b981" }, // Emerald 500
        { name: "Belum", value: uncertified, color: "#f59e0b" }, // Amber 500
    ];

    const statusData = [
        { name: "Aman", value: safe, color: "#3b82f6" }, // Blue 500
        { name: "Masalah", value: problem, color: "#ef4444" }, // Red 500
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Sertifikasi */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-700 mb-2 w-full text-center">Status Sertifikasi</h3>
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
                <div className="grid grid-cols-2 gap-4 w-full mt-2 text-center text-sm">
                    <div>
                        <p className="text-gray-500">Sudah</p>
                        <p className="font-bold text-lg text-emerald-600">{certified}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Belum</p>
                        <p className="font-bold text-lg text-amber-500">{uncertified}</p>
                    </div>
                </div>
            </div>

            {/* Chart 2: Kesehatan Aset */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-700 mb-2 w-full text-center">Kesehatan Aset</h3>
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
                <div className="grid grid-cols-2 gap-4 w-full mt-2 text-center text-sm">
                    <div>
                        <p className="text-gray-500">Aman</p>
                        <p className="font-bold text-lg text-blue-500">{safe}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Masalah</p>
                        <p className="font-bold text-lg text-red-500">{problem}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
