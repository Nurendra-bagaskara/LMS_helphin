"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FooterDashboard from "../../dashboard/components/footer_dashboard";

export default function ManajemenMatkul() {
    const [dataMatkul, setDataMatkul] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserPermissions(user.permissions || []);
        }
        fetchMatkul();
    }, []);

    const fetchMatkul = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch("http://localhost:8000/api/mata-kuliah", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDataMatkul(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch mata kuliah", e);
        } finally {
            setLoading(false);
        }
    };

    const hapusMatkul = async (id: string) => {
        const isConfirm = window.confirm("Yakin ingin menghapus mata kuliah ini?");
        if (!isConfirm) return;

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (data.success) {
                alert("Mata kuliah berhasil dihapus! 🗑️");
                fetchMatkul();
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Gagal menghapus", e);
            alert("Terjadi kesalahan saat menghapus data.");
        }
    };

    const canManage = userPermissions.includes("matkul:manage") || userPermissions.includes("*");

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8 font-jakarta">
                    <h1 className="text-3xl font-bold">Manajemen Mata Kuliah</h1>
                    <p className="text-gray-400 text-sm italic text-jakarta">Kelola mata kuliah sesuai dengan program studi.</p>
                </div>

                <div className="bg-white p-6 rounded-t-xl border-b flex justify-between items-center shadow-sm">
                    <div className="text-sm font-medium text-gray-500">Daftar Mata Kuliah</div>
                    {canManage && (
                        <Link href="/manajemen/matkul/tambah">
                            <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">Tambah Matkul +</button>
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-jakarta">
                            <tr>
                                <th className="p-4 border-b w-16 text-center">No</th>
                                <th className="p-4 border-b">Kode MK</th>
                                <th className="p-4 border-b">Nama Mata Kuliah</th>
                                <th className="p-4 border-b">Program Studi</th>
                                <th className="p-4 border-b">Tanggal Dibuat</th>
                                {canManage && <th className="p-4 border-b text-center w-32">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="text-sm font-jakarta">
                            {loading ? (
                                <tr><td colSpan={canManage ? 6 : 5} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
                            ) : dataMatkul.length > 0 ? (
                                dataMatkul.map((row, index) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 border-b text-gray-500 text-center">{index + 1}</td>
                                        <td className="p-4 border-b">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-mono font-bold">
                                                {row.code}
                                            </span>
                                        </td>
                                        <td className="p-4 border-b font-medium text-gray-800">{row.name}</td>
                                        <td className="p-4 border-b">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-[11px] font-semibold">
                                                {row.prodiName}
                                            </span>
                                        </td>
                                        <td className="p-4 border-b text-gray-500">
                                            {new Date(row.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        {canManage && (
                                            <td className="p-4 border-b text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/manajemen/matkul/edit/${row.id}`)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                        title="Edit"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => hapusMatkul(row.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                        title="Hapus"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={canManage ? 6 : 5} className="p-10 text-center text-gray-400 italic">Belum ada mata kuliah.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <FooterDashboard />
            </div>
        </div>
    );
}
