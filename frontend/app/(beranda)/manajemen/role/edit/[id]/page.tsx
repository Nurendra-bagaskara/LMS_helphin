"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FooterDashboard from "../../../../dashboard/components/footer_dashboard";

export default function EditRole() {
    const { id } = useParams();
    const [formData, setFormData] = useState({ name: "", code: "" });
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
            ]
        },
        { group: "Lainnya", perms: [{ label: "Lihat Log Aktivitas", key: "log:view" }] },
    ];

    const togglePermission = (key: string) => {
        setSelectedPermissions(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    useEffect(() => {
        fetchRole();
    }, []);

    const fetchRole = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/roles/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFormData({ name: data.data.name, code: data.data.code });
                setSelectedPermissions(data.data.permissions || []);
            } else {
                alert(data.message);
                router.push("/manajemen/role");
            }
        } catch (e) {
            console.error("Error fetching role", e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/roles/${id}`, {
                method: "PATCH",
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
                alert("Role berhasil diupdate! ✨");
                router.push("/manajemen/role");
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Error updating role", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-400 italic">Memuat data...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-black flex items-center gap-3">
                        Edit Role <span className="text-orange-500">⚙️</span>
                    </h1>
                    <p className="text-gray-400 text-sm italic">Perbarui informasi role "{formData.name}".</p>
                </div>

                <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Nama Role</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Contoh: Manager Konten"
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Kode Role</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                placeholder="Contoh: content_manager"
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm transition-all"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-2 italic">Hati-hati: Mengubah kode role dapat memengaruhi hak akses user yang menggunakan role ini.</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                            <label className="block text-sm font-bold text-gray-800 mb-4">Mempunyai Hak Akses Untuk: 🔑</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {availablePermissions.map((group) => (
                                    <div key={group.group} className="space-y-2 pb-4">
                                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">{group.group}</p>
                                        {group.perms.map((p) => (
                                            <label key={p.key} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(p.key)}
                                                    onChange={() => togglePermission(p.key)}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <span className="text-sm font-medium">{p.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-200 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? "Menyimpan..." : "Update Role"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition active:scale-95"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                </div>

                <FooterDashboard />
            </div>
        </div>
    );
}
