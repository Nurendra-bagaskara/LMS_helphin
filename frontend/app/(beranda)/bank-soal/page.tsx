"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FooterDashboard from "../dashboard/components/footer_dashboard";
import UploadSoal from "./components/UploadModal";

export default function ManajemenBankSoal() {
    const [dataBankSoal, setDataBankSoal] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setPermissions(user.permissions || []);
        }

        fetchBankSoal();
    }, []);

    const fetchBankSoal = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/bank-soal", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                setDataBankSoal(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch bank soal:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus bank soal ini?")) return;

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/bank-soal/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                alert("Bank Soal berhasil dihapus!");
                fetchBankSoal();
            } else {
                alert(json.message || "Gagal menghapus bank soal.");
            }
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus bank soal.");
        }
    };

    const handleDownload = async (id: string, fileName: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/bank-soal/${id}/download`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName.split('/').pop() || "bank-soal";
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            alert("Gagal mengunduh file.");
        }
    };

    const handlePreview = async (id: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/bank-soal/${id}/preview`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Preview failed");

            const blob = await res.blob();
            const fileBlob = new Blob([blob], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(fileBlob);

            setPreviewUrl(url);
            setIsPreviewOpen(true);
        } catch (error) {
            console.error("Preview error:", error);
            alert("Gagal memuat preview PDF.");
        }
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const canManage = permissions.includes("*") || permissions.includes("bank_soal:manage");

    const [searchTerm, setSearchTerm] = useState("");

    const filteredBankSoal = dataBankSoal.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.mataKuliahName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.prodiName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 font-jakarta">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Bank Soal</h1>
                    <p className="text-gray-400 text-sm italic">Kelola konten bank soal per prodi dan mata kuliah.</p>
                </div>

                <div className="bg-white p-6 rounded-t-xl border-b flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            placeholder="Cari Judul / Matkul / Prodi..."
                            className="border border-gray-200 p-2 rounded-lg w-72 text-sm focus:outline-blue-500 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {canManage && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsUploadOpen(true)}
                                className="px-6 py-2.5 rounded-[14px] text-white font-bold text-sm bg-[#068DFF] shadow-md hover:bg-blue-600 transition active:scale-95"
                            >
                                Upload Soal
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border-t-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="p-4 border-b w-16 text-center">No</th>
                                    <th className="p-4 border-b">Judul Bank Soal</th>
                                    <th className="p-4 border-b">Mata Kuliah</th>
                                    <th className="p-4 border-b">Program Studi</th>
                                    <th className="p-4 border-b text-center">Semester/Tahun</th>
                                    <th className="p-4 border-b text-center w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
                                ) : filteredBankSoal.length > 0 ? (
                                    filteredBankSoal.map((m, index) => (
                                        <tr key={m.id} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="p-4 border-b text-gray-500 text-center">{index + 1}</td>
                                            <td className="p-4 border-b font-semibold text-gray-800">{m.title}</td>
                                            <td className="p-4 border-b text-gray-600">
                                                <span className="italic underline decoration-blue-100 decoration-2 underline-offset-4">{m.mataKuliahName}</span>
                                            </td>
                                            <td className="p-4 border-b">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-tight">
                                                    {m.prodiName}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b text-center">
                                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-[11px] font-bold uppercase border border-blue-100 italic">
                                                    {m.tahunAjaran}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b text-center">
                                                <div className="flex justify-center gap-1.5">
                                                    <button
                                                        onClick={() => handlePreview(m.id)}
                                                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                                        title="Preview"
                                                    >
                                                        👁️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownload(m.id, m.fileUrl)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        title="Download"
                                                    >
                                                        📥
                                                    </button>
                                                    {canManage && (
                                                        <>
                                                            <button
                                                                onClick={() => router.push(`/bank-soal/edit/${m.id}`)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(m.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                                title="Hapus"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Data bank soal tidak ditemukan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer (Simulated to match design) */}
                    <div className="p-4 bg-white flex justify-between items-center text-sm text-gray-500 border-t rounded-b-xl border-gray-100">
                        <div className="flex items-center space-x-2">
                            <span>{filteredBankSoal.length}</span> <span className="text-xs uppercase font-bold text-gray-300">Total Items</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Page 1 of 1</span>
                            <div className="flex space-x-1">
                                <button className="px-3 py-1 border rounded-md bg-black text-white text-xs font-bold transition shadow-md active:scale-95">1</button>
                            </div>
                        </div>
                    </div>
                </div>

                <FooterDashboard />
            </div>

            {/* Modal Preview PDF */}
            {isPreviewOpen && previewUrl && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", backdropFilter: "blur(4px)" }}
                >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                        {/* Header Modal */}
                        <div className="flex justify-between items-center p-4 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Preview Dokumen Bank Soal</h2>
                            <button
                                onClick={closePreview}
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                                title="Tutup Preview"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        {/* Konten PDF */}
                        <div className="flex-1 w-full bg-gray-100">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full border-0"
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Upload */}
            {isUploadOpen && <UploadSoal onClose={() => setIsUploadOpen(false)} />}
        </div>
    );
}
