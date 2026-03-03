"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FooterDashboard from "../../dashboard/components/footer_dashboard";

export default function ManajemenVideo() {
    const [dataVideo, setDataVideo] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();
    const [userPermissions, setUserPermissions] = useState<string[]>([]);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserPermissions(user.permissions || []);
        }
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/videos", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDataVideo(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch videos", e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Yakin ingin menghapus video ini?")) return;
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/videos/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                alert("Video berhasil dihapus! 🗑️");
                fetchVideos();
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Delete error", e);
            alert("Terjadi kesalahan sistem.");
        }
    };

    const canManage = userPermissions.includes("*") || userPermissions.includes("video:manage");

    const filteredVideo = dataVideo.filter(v =>
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.mataKuliahName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.prodiName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 font-jakarta">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Manajemen Video Pembelajaran</h1>
                    <p className="text-gray-400 text-sm italic">Kelola konten video YouTube per prodi dan mata kuliah.</p>
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
                        <Link href="/manajemen/video/tambah">
                            <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition active:scale-95 shadow-lg shadow-gray-200">
                                Tambah Video +
                            </button>
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-b-xl shadow-sm overflow-hidden border-t-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                                <tr>
                                    <th className="p-4 border-b w-16 text-center">No</th>
                                    <th className="p-4 border-b">Judul Video</th>
                                    <th className="p-4 border-b">Mata Kuliah</th>
                                    <th className="p-4 border-b">Program Studi</th>
                                    <th className="p-4 border-b text-center">Tipe</th>
                                    <th className="p-4 border-b text-center w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
                                ) : filteredVideo.length > 0 ? (
                                    filteredVideo.map((v, index) => (
                                        <tr key={v.id} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="p-4 border-b text-gray-500 text-center">{index + 1}</td>
                                            <td className="p-4 border-b">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-800">{v.title}</span>
                                                    <span className="text-[10px] text-blue-500 font-mono italic truncate max-w-[200px]">{v.embedUrl}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 border-b text-gray-600">
                                                <span className="italic underline decoration-blue-100 decoration-2 underline-offset-4">{v.mataKuliahName || "-"}</span>
                                            </td>
                                            <td className="p-4 border-b">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-tight">
                                                    {v.prodiName}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b text-center">
                                                <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase border italic ${v.type === "live" ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                                                    }`}>
                                                    {v.type}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b text-center">
                                                <div className="flex justify-center gap-1.5">
                                                    <button
                                                        onClick={() => window.open(v.embedUrl, "_blank")}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        title="Tonton"
                                                    >
                                                        🎬
                                                    </button>
                                                    {canManage && (
                                                        <>
                                                            <button
                                                                onClick={() => router.push(`/manajemen/video/edit/${v.id}`)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(v.id)}
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
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Data video tidak ditemukan.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-white flex justify-between items-center text-sm text-gray-500 border-t rounded-b-xl border-gray-100">
                        <div className="flex items-center space-x-2">
                            <span>{filteredVideo.length}</span> <span className="text-xs uppercase font-bold text-gray-300">Total Videos</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Page 1 of 1</span>
                            <div className="flex space-x-1">
                                <button className="px-3 py-1 border rounded-md bg-black text-white text-xs font-bold shadow-md active:scale-95">1</button>
                            </div>
                        </div>
                    </div>
                </div>

                <FooterDashboard />
            </div>
        </div>
    );
}
