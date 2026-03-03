"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FooterDashboard from "../../dashboard/components/footer_dashboard";

export default function ManajemenResponsi() {
    const [dataResponsi, setDataResponsi] = useState<any[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchResponsi();
    }, []);

    const fetchResponsi = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch("http://localhost:8000/api/responsi", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.status === 401) {
                router.push("/login");
                return;
            }
            const data = await res.json();
            if (data.success) {
                setDataResponsi(data.data);
            }
        } catch (e) {
            console.error("Failed to fetch responsi", e);
        } finally {
            setLoading(false);
        }
    };

    const hapusResponsi = async (id: string) => {
        const isConfirm = window.confirm("Yakin ingin menghapus responsi ini?");
        if (!isConfirm) return;

        setOpenMenuId(null);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/responsi/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (data.success) {
                alert("Responsi berhasil dihapus! 🗑️");
                fetchResponsi();
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Gagal menghapus", e);
            alert("Terjadi kesalahan saat menghapus data.");
        }
    };

    const formatTanggal = (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    };

    const formatWaktu = (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Data Responsi</h1>
                    <p className="text-gray-400 text-sm italic">Daftar responsi yang terdaftar di sistem.</p>
                </div>

                <div className="bg-white p-6 rounded-t-xl border-b flex justify-between items-center">
                    <input type="text" placeholder="Cari Responsi" className="border border-gray-200 p-2 rounded-lg w-72 text-sm" />

                    <Link href="/manajemen/responsi/tambah">
                        <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">
                            Tambah Responsi +
                        </button>
                    </Link>
                </div>

                <div className="bg-white rounded-b-xl shadow-sm overflow-visible">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="p-4 border-b">No</th>
                                    <th className="p-4 border-b">Judul Responsi</th>
                                    <th className="p-4 border-b">Nama Pemateri</th>
                                    <th className="p-4 border-b">Tanggal</th>
                                    <th className="p-4 border-b">Waktu</th>
                                    <th className="p-4 border-b">Status</th>
                                    <th className="p-4 border-b">Link Responsi</th>
                                    <th className="p-4 border-b">Link Request</th>
                                    <th className="p-4 border-b">Link Komunitas</th>
                                    <th className="p-4 border-b text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {loading ? (
                                    <tr><td colSpan={10} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
                                ) : dataResponsi.length > 0 ? (
                                    dataResponsi.map((row, index) => (
                                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 border-b">{index + 1}</td>
                                            <td className="p-4 border-b font-medium">{row.title || "-"}</td>
                                            <td className="p-4 border-b text-gray-600">{row.speaker || "-"}</td>
                                            <td className="p-4 border-b text-gray-400 text-xs">{formatTanggal(row.scheduleDate)}</td>
                                            <td className="p-4 border-b text-gray-400 text-xs">{formatWaktu(row.scheduleDate)}</td>
                                            <td className="p-4 border-b">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${row.status === "completed" ? "bg-green-100 text-green-700" :
                                                    row.status === "live" ? "bg-blue-100 text-blue-700" :
                                                        "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : "Upcoming"}
                                                </span>
                                            </td>
                                            <td className="p-4 border-b">
                                                {row.meetingLink ? <a href={row.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Buka Link</a> : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="p-4 border-b">
                                                {row.requestMaterialLink ? <a href={row.requestMaterialLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Buka Link</a> : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="p-4 border-b">
                                                {row.communityLink ? <a href={row.communityLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Buka Link</a> : <span className="text-gray-400">-</span>}
                                            </td>
                                            <td className="p-4 border-b text-center relative overflow-visible">
                                                <button onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)} className="text-gray-400 font-bold p-1 text-xl leading-none hover:text-black">...</button>
                                                {openMenuId === row.id && (
                                                    <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-100 shadow-2xl rounded-lg z-[50] py-1 animate-in fade-in zoom-in duration-150">
                                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition flex items-center gap-2" onClick={() => router.push(`/manajemen/responsi/edit/${row.id}`)}>
                                                            ✏️ Edit
                                                        </button>
                                                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition flex items-center gap-2" onClick={() => hapusResponsi(row.id)}>
                                                            🗑️ Hapus
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={10} className="p-10 text-center text-gray-400 italic">Belum ada data responsi.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 bg-white flex justify-between items-center text-sm text-gray-500 border-t rounded-b-xl">
                        <div className="flex items-center space-x-2"><span>10</span> <span className="text-xs">Rows per page</span></div>
                        <div className="flex items-center space-x-4">
                            <span className="text-xs">Page 1 of 1</span>
                            <div className="flex space-x-1">
                                <button className="px-3 py-1 border rounded-md bg-black text-white text-xs">1</button>
                                <button className="px-3 py-1 border rounded-md text-xs hover:bg-gray-50 disabled:opacity-50" disabled>2</button>
                            </div>
                        </div>
                    </div>
                </div>

                <FooterDashboard />
            </div>
        </div>
    );
}
