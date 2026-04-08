"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TambahVideoAdmin() {
    const params = useParams();
    const id = params?.id as string;

    const [formData, setFormData] = useState({
        title: "",
        youtubeUrl: "",
        type: "recording",
        description: "",
        tahunAjaran: ""
    });
    const [prodiId, setProdiId] = useState("");
    const [matkulName, setMatkulName] = useState("Memuat...");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.prodiId) setProdiId(user.prodiId);
            } catch (e) {
                console.error("Failed parsing user", e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setMatkulName(data.data.name);
                    if (!prodiId) setProdiId(data.data.prodiId); // Fallback
                }
            } catch (e) {
                console.error("Failed fetching matkul", e);
            }
        };
        if (id) fetchDetail();
    }, [id, prodiId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const payload = {
                title: formData.title,
                description: formData.description || undefined,
                youtubeUrl: formData.youtubeUrl,
                type: formData.type,
                prodiId: prodiId,
                mataKuliahId: id,
                tahunAjaran: formData.tahunAjaran || undefined
            };

            const res = await fetch("http://localhost:8000/api/videos", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert("Smart Video berhasil ditambahkan! 🎬");
                router.push(`/admin/mata-kuliah/${id}`);
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Submit error", e);
            alert("Terjadi kesalahan sistem saat menyimpan data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen py-10 px-4 flex justify-center bg-[#EEF5FF] dark:bg-slate-950 transition-colors duration-300" style={{ fontFamily: "inter" }}>
            <div className="w-full max-w-[900px]">
                {/* Header Context */}
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => router.back()}
                        className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:text-[#22C55E] hover:border-[#22C55E] transition-all"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight">Buat Smart Video Baru</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Mata Kuliah: <strong className="text-[#22C55E]">{matkulName}</strong></p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-green-50 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Judul Video</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Pertemuan 1 - Konsep Dasar"
                                    className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10 transition-all font-medium text-gray-800 dark:text-slate-100 placeholder:font-normal"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Tahun Ajaran</label>
                                <input
                                    type="text"
                                    placeholder="Contoh: 2023/2024"
                                    className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10 transition-all font-medium text-gray-800 dark:text-slate-100 placeholder:font-normal"
                                    value={formData.tahunAjaran}
                                    onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Tautan YouTube <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                                    </div>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://youtube.com/watch?v=..."
                                        className="w-full h-[48px] pl-12 pr-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10 transition-all font-medium text-gray-800 dark:text-slate-100 placeholder:font-normal font-mono"
                                        value={formData.youtubeUrl}
                                        onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                                    />
                                </div>
                            </div>



                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Deskripsi (Opsional)</label>
                                <textarea
                                    placeholder="Tuliskan keterangan mengenai isi dan tujuan video ini..."
                                    className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-[#22C55E] focus:ring-4 focus:ring-[#22C55E]/10 transition-all min-h-[120px] resize-none font-medium text-gray-800 dark:text-slate-100 placeholder:font-normal"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Info: Chapters otomatis dari YouTube */}
                        <div className="border-t border-gray-100 dark:border-slate-800 pt-6">
                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                                <div>
                                    <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">Chapter Otomatis dari YouTube</h3>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">Navigasi chapter akan ditampilkan otomatis jika video YouTube memiliki segmentasi chapter di deskripsinya. Atur chapter langsung dari YouTube Studio.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end border-t border-gray-100 dark:border-slate-800 pt-6 mt-2">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors mr-2"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 bg-[#22C55E] text-white text-sm font-semibold rounded-lg hover:bg-green-600 shadow-lg shadow-green-500/30 hover:shadow-green-500/50 dark:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Menyimpan..." : "Simpan Video"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
