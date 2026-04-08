"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TambahRole() {
    const [formData, setFormData] = useState({ name: "", code: "" });
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const availablePermissions = [
        { group: "Sistem", perms: [{ label: "Akses Dashboard", key: "dashboard:view" }] },
        {
            group: "Manajemen Akun", perms: [
                { label: "Lihat Daftar Akun", key: "akun:view" },
                { label: "Kelola Akun (Tambah/Edit/Hapus)", key: "akun:manage" },
                { label: "Lihat Role", key: "role:view" },
                { label: "Kelola Role", key: "role:manage" },
            ]
        },
        {
            group: "Akademik", perms: [
                { label: "Kelola Fakultas", key: "fakultas:manage" },
                { label: "Kelola Prodi", key: "prodi:manage" },
                { label: "Lihat Mata Kuliah", key: "matkul:view" },
                { label: "Kelola Mata Kuliah", key: "matkul:manage" },
            ]
        },
        {
            group: "Konten", perms: [
                { label: "Lihat Responsi", key: "responsi:view" },
                { label: "Kelola Responsi", key: "responsi:manage" },
                { label: "Lihat Materi", key: "materi:view" },
                { label: "Kelola Materi", key: "materi:manage" },
                { label: "Lihat Video", key: "video:view" },
                { label: "Kelola Video", key: "video:manage" },
                { label: "Lihat Bank Soal", key: "bank_soal:view" },
                { label: "Kelola Bank Soal", key: "bank_soal:manage" },
            ]
        },
        { group: "Lainnya", perms: [{ label: "Lihat Log Aktivitas", key: "log:view" }] },
    ];

    const togglePermission = (key: string) => {
        setSelectedPermissions(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/roles", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    permissions: selectedPermissions
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Role berhasil ditambahkan! 🎉");
                router.push("/superadmin/manajemen/role");
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Error creating role", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center py-20 overflow-hidden"
            style={{
                backgroundImage: "url('/images/background.svg')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "115% 0%",
                backgroundColor: '#FCFDFF'
            }}>

            <div className="mb-10">
                <Image src="/images/helPhin 2.png" alt="Logo Helphin" width={150} height={50} priority />
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-[32px] font-semibold leading-[32px] text-[#1D1D1D]">
                    Tambah Role Baru
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Tentukan nama, kode, dan hak akses untuk role baru</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[32px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl"
                style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)" }}>

                <div className="w-full flex items-center border-b border-gray-100 pb-2">
                    <Link href="/superadmin/manajemen/role" className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                        ← Kembali
                    </Link>
                    <h3 className="text-[20px] font-semibold leading-[32px] text-black">
                        Informasi Role
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[1019px] flex flex-col gap-[32px]">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Nama Role</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Contoh: Manager Konten"
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Kode Role</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="Contoh: content_manager"
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <label className="text-sm font-bold text-gray-900 mb-4 block">Hak Akses (Permissions)</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {availablePermissions.map((group) => (
                                <div key={group.group} className="space-y-2 pb-4">
                                    <p className="text-xs font-bold text-[#068DFF] uppercase tracking-wider mb-2">{group.group}</p>
                                    {group.perms.map((p) => (
                                        <label key={p.key} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(p.key)}
                                                onChange={() => togglePermission(p.key)}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">{p.label}</span>
                                        </label>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[264px] h-[54px] bg-[#068DFF] text-white rounded-[4px] font-bold text-[16px] hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

