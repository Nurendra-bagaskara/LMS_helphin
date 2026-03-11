"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FooterDashboard from "../../../../dashboard/components/footer_dashboard";
import Link from "next/link";

export default function EditLatihanSoal() {
    const { id } = useParams();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subject: "",
        tahunAjaran: "",
        mataKuliahId: "",
        prodiName: "",
        mataKuliahName: "",
        googleFormUrl: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) fetchExercise();
    }, [id]);

    const fetchExercise = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/exercises/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            if (json.success) {
                setFormData({
                    title: json.data.title,
                    description: json.data.description || "",
                    subject: json.data.subject || "",
                    tahunAjaran: json.data.tahunAjaran || "",
                    mataKuliahId: json.data.mataKuliahId || "",
                    prodiName: json.data.prodiName || "",
                    mataKuliahName: json.data.mataKuliahName || "",
                    googleFormUrl: json.data.googleFormUrl || ""
                });
            }
        } catch (error) {
            console.error("Failed to fetch exercise:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (formData.mataKuliahId) {
            router.push(`/mata-kuliah/${formData.mataKuliahId}`);
        } else {
            router.push("/mata-kuliah");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.googleFormUrl.startsWith("http")) {
            alert("URL Google Form harus dimulai dengan http:// atau https://");
            return;
        }

        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/exercises/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description || undefined,
                    subject: formData.subject || undefined,
                    tahunAjaran: formData.tahunAjaran || undefined,
                    googleFormUrl: formData.googleFormUrl
                })
            });

            const json = await res.json();
            if (json.success) {
                alert("Latihan Soal berhasil diubah!");
                handleBack();
            } else {
                alert(json.message || "Gagal mengubah latihan soal.");
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
                        Edit Latihan Soal <span className="text-blue-600">✏️</span>
                    </h1>
                    <p className="text-gray-400 text-sm italic">Ubah detail tautan latihan soal yang sudah ada.</p>
                </div>

                <div className="w-full flex items-center pb-2 mb-4 mt-[-10px]">
                    <button type="button" onClick={handleBack} className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                        ← Kembali
                    </button>
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
                                <p className="text-gray-700 font-medium">{formData.mataKuliahName || "-"}</p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Judul Latihan</label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Tautan Google Form <span className="text-red-500">*</span></label>
                            <input
                                type="url"
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                value={formData.googleFormUrl}
                                onChange={(e) => setFormData({ ...formData, googleFormUrl: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Tahun Ajaran</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-jakarta italic font-bold text-blue-800"
                                    placeholder="e.g. 2023/2024"
                                    value={formData.tahunAjaran}
                                    onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Topik / Subject</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>
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
                                onClick={handleBack}
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
