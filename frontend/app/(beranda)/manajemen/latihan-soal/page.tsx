"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FooterDashboard from "../../dashboard/components/footer_dashboard";

export default function ManajemenLatihanSoal() {
    const [dataExercises, setDataExercises] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissions, setPermissions] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setPermissions(user.permissions || []);
        }

        fetchExercises();
    }, []);

    const fetchExercises = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/exercises", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                setDataExercises(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch exercises:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus latihan soal ini?")) return;

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/exercises/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const json = await res.json();
            if (json.success) {
                alert("Latihan Soal berhasil dihapus!");
                fetchExercises();
            } else {
                alert(json.message || "Gagal menghapus latihan soal.");
            }
        } catch (error) {
            alert("Terjadi kesalahan saat menghapus latihan soal.");
        }
    };

    const canManage = permissions.includes("*") || permissions.includes("exercise:manage");

    const [searchTerm, setSearchTerm] = useState("");

    const filteredExercises = dataExercises.filter(e =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.mataKuliahName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.prodiName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 font-jakarta">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Manajemen Latihan Soal</h1>
                    <p className="text-gray-400 text-sm italic">Kelola tautan Google Form untuk Latihan Soal per prodi dan mata kuliah.</p>
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
                        <Link href="/manajemen/latihan-soal/tambah">
                            <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition active:scale-95 shadow-lg shadow-gray-200">
                                Tambah Latihan +
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
                                    <th className="p-4 border-b">Judul Latihan</th>
                                    <th className="p-4 border-b">Mata Kuliah</th>
                                    <th className="p-4 border-b">Program Studi</th>
                                    <th className="p-4 border-b text-center">Semester/Tahun</th>
                                    <th className="p-4 border-b text-center w-32">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
                                ) : filteredExercises.length > 0 ? (
                                    filteredExercises.map((e, index) => (
                                        <tr key={e.id} className="hover:bg-blue-50/20 transition-colors">
                                            <td className="p-4 border-b text-gray-500 text-center">{index + 1}</td>
                                            <td className="p-4 border-b font-semibold text-gray-800">{e.title}</td>
                                            <td className="p-4 border-b text-gray-600">
                                                <span className="italic underline decoration-blue-100 decoration-2 underline-offset-4">{e.mataKuliahName || '-'}</span>
                                            </td>
                                            <td className="p-4 border-b">
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold uppercase tracking-tight">
                                                    {e.prodiName}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b text-center">
                                                <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded text-[11px] font-bold uppercase border border-blue-100 italic">
                                                    {e.tahunAjaran || '-'}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b text-center">
                                                <div className="flex justify-center gap-1.5">
                                                    <a
                                                        href={e.googleFormUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                                        title="Buka Google Form"
                                                    >
                                                        📝
                                                    </a>
                                                    {canManage && (
                                                        <>
                                                            <button
                                                                onClick={() => router.push(`/manajemen/latihan-soal/edit/${e.id}`)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(e.id)}
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
                                    <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Data latihan soal tidak ditemukan.</td></tr>
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
