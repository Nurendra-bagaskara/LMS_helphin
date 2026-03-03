"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FooterDashboard from "../../../../dashboard/components/footer_dashboard";

export default function EditMateri() {
    const { id } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tahunAjaran: "",
        mataKuliahId: "",
        prodiName: "",
        mataKuliahName: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) fetchMateri();
    }, [id]);

    const fetchMateri = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/materials/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setFormData({
                    title: json.data.title,
                    description: json.data.description || "",
                    tahunAjaran: json.data.tahunAjaran,
                    mataKuliahId: json.data.mataKuliahId,
                    prodiName: json.data.prodiName,
                    mataKuliahName: json.data.mataKuliahName
                });
            }
        } catch (error) {
            console.error("Failed to fetch material:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/materials/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    tahunAjaran: formData.tahunAjaran
                })
            });

            const json = await res.json();
            if (json.success) {
                alert("Materi berhasil diubah!");
                router.push("/manajemen/materi");
            } else {
                alert(json.message || "Gagal mengubah materi.");
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-500">Memuat data...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 font-jakarta">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Edit Materi <span className="text-blue-600">✏️</span>
                    </h1>
                    <p className="text-gray-400 text-sm italic">Ubah detail materi pembelajaran yang sudah ada.</p>
                </div>

                <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        {/* READ ONLY INFO */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                                <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Program Studi</label>
                                <p className="text-gray-700 font-semibold">{formData.prodiName}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-inner">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mata Kuliah</label>
                                <p className="text-gray-700 font-medium">{formData.mataKuliahName}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Judul Materi</label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Tahun Ajaran</label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-jakarta italic font-bold text-blue-800"
                                placeholder="e.g. 2023/2024"
                                value={formData.tahunAjaran}
                                onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Deskripsi</label>
                            <textarea
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {saving ? "Menyimpan..." : "Simpan Perubahan"}
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

                    <div className="mt-6 bg-orange-50/50 p-4 rounded-xl border border-orange-100 flex items-start gap-3">
                        <div className="text-orange-500 mt-0.5 animate-pulse">
                            ⚠️
                        </div>
                        <p className="text-[11px] text-orange-700 leading-relaxed italic">
                            Informasi Penting: Mengubah file materi harus dilakukan dengan cara menghapus dan mengunggah ulang materi untuk menjaga integritas data prodi.
                        </p>
                    </div>
                </div>

                <FooterDashboard />
            </div>
        </div>
    );
}
