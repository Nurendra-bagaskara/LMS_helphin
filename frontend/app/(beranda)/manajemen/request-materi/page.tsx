"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import FooterDashboard from "../../dashboard/components/footer_dashboard";

export default function ManajemenRequestMateri() {
    const [dataRequests, setDataRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState<string[]>([]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setPermissions(user.permissions || []);
        }

        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/requests", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                setDataRequests(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, requestTitle: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus request "${requestTitle}"?`)) return;

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/requests/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                alert("Request berhasil dihapus!");
                fetchRequests();
            } else {
                alert(json.message || "Gagal menghapus request.");
            }
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus request.");
        }
    };

    const canDelete = permissions.includes("*") || permissions.includes("request:manage");

    const [searchTerm, setSearchTerm] = useState("");

    const filteredRequests = dataRequests.filter(req =>
        req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.prodiName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 font-jakarta">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Request Materi</h1>
                    <p className="text-gray-400 text-sm italic">Lihat dan kelola saran / request materi dari mahasiswa.</p>
                </div>

                <div className="bg-white p-6 rounded-t-xl border-b flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Cari Judul / Mahasiswa / Prodi..."
                            className="border border-gray-200 p-2 rounded-lg w-72 text-sm focus:outline-blue-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border-t-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="p-4 border-b w-16 text-center">No</th>
                                    <th className="p-4 border-b">Detail Request</th>
                                    <th className="p-4 border-b">Pengusul (Mahasiswa)</th>
                                    <th className="p-4 border-b">Program Studi</th>
                                    <th className="p-4 border-b w-32">Tanggal</th>
                                    <th className="p-4 border-b text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
                                ) : filteredRequests.length > 0 ? (
                                    filteredRequests.map((req, index) => (
                                        <tr key={req.id} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="p-4 border-b text-gray-500 text-center">{index + 1}</td>
                                            <td className="p-4 border-b">
                                                <div className="font-semibold text-gray-800">{req.title}</div>
                                                {req.subject && (
                                                    <div className="text-xs text-blue-600 font-medium mt-1">Topik: {req.subject}</div>
                                                )}
                                                {req.description && (
                                                    <div className="text-xs text-gray-500 mt-1 mt-1 line-clamp-2" title={req.description}>
                                                        {req.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 border-b text-gray-700 font-medium">
                                                {req.studentName || '-'}
                                            </td>
                                            <td className="p-4 border-b">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-tight">
                                                    {req.prodiName}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b text-gray-500 text-xs">
                                                {new Date(req.createdAt).toLocaleDateString('id-ID', {
                                                    day: '2-digit', month: 'short', year: 'numeric'
                                                })}
                                            </td>
                                            <td className="p-4 border-b text-center">
                                                <div className="flex justify-center gap-1.5">
                                                    {canDelete ? (
                                                        <button
                                                            onClick={() => handleDelete(req.id, req.title)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Hapus / Selesai"
                                                        >
                                                            🗑️
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Data request materi tidak ditemukan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <FooterDashboard />
            </div>
        </div>
    );
}
