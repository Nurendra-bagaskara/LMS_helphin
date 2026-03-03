"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FooterDashboard from "../../dashboard/components/footer_dashboard";

export default function ManajemenRole() {
    const [dataRole, setDataRole] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch("http://localhost:8000/api/roles", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setDataRole(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch roles", e);
        } finally {
            setLoading(false);
        }
    };

    const hapusRole = async (id: string) => {
        const isConfirm = window.confirm("Yakin ingin menghapus role ini?");
        if (!isConfirm) return;

        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/roles/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            const data = await res.json();
            if (data.success) {
                alert("Role berhasil dihapus! 🗑️");
                fetchRoles();
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Gagal menghapus", e);
            alert("Terjadi kesalahan saat menghapus data.");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Manajemen Role</h1>
                    <p className="text-gray-400 text-sm italic">Atur hak akses pengguna dengan membuat role kustom.</p>
                </div>

                <div className="bg-white p-6 rounded-t-xl border-b flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-500">Daftar Role</div>
                    <Link href="/manajemen/role/tambah">
                        <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">Tambah Role +</button>
                    </Link>
                </div>

                <div className="bg-white rounded-b-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="p-4 border-b w-16">No</th>
                                <th className="p-4 border-b">Nama Role</th>
                                <th className="p-4 border-b">Kode Role</th>
                                <th className="p-4 border-b">Hak Akses</th>
                                <th className="p-4 border-b">Tanggal Dibuat</th>
                                <th className="p-4 border-b text-center w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {loading ? (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
                            ) : dataRole.length > 0 ? (
                                dataRole.map((row, index) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 border-b text-gray-500">{index + 1}</td>
                                        <td className="p-4 border-b font-medium">{row.name}</td>
                                        <td className="p-4 border-b">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-mono">
                                                {row.code}
                                            </span>
                                        </td>
                                        <td className="p-4 border-b">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {row.permissions?.includes("*") ? (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-bold">FULL ACCESS ⭐</span>
                                                ) : row.permissions && row.permissions.length > 0 ? (
                                                    row.permissions.map((p: string) => (
                                                        <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium whitespace-nowrap">
                                                            {p}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-300 italic text-xs">No permissions</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b text-gray-500">
                                            {new Date(row.createdAt).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="p-4 border-b text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => router.push(`/manajemen/role/edit/${row.id}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => hapusRole(row.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Hapus"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={6} className="p-10 text-center text-gray-400 italic">Belum ada role.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <FooterDashboard />
            </div>
        </div>
    );
}
