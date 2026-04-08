"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TambahQuizAdmin() {
    const params = useParams();
    const id = params?.id as string;

    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        googleFormUrl: "",
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
                    if (!prodiId) setProdiId(data.data.prodiId); 
                }
            } catch (e) {
                console.error("Failed fetching matkul", e);
            }
        };
        if (id) fetchDetail();
    }, [id, prodiId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.googleFormUrl.startsWith("http")) {
            alert("Tautan Google Form harus diawali dengan http:// atau https://");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const payload = {
                title: formData.title,
                description: formData.description || undefined,
                subject: formData.subject || undefined,
                prodiId: prodiId,
                mataKuliahId: id,
                tahunAjaran: formData.tahunAjaran || undefined,
                googleFormUrl: formData.googleFormUrl
            };

            const res = await fetch("http://localhost:8000/api/exercises", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert("Quiz berhasil ditambahkan! 📝");
                router.push(`/admin/mata-kuliah/${id}`);
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Submit error", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen py-10 px-4 flex justify-center bg-[#EEF5FF] dark:bg-slate-950 transition-colors duration-300" style={{ fontFamily: "inter" }}>
            <div className="w-full max-w-[900px]">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:text-[#A855F7] hover:border-[#A855F7] transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight">Buat Quiz Baru</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Mata Kuliah: <strong className="text-[#A855F7]">{matkulName}</strong></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-purple-50 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Judul Quiz</label>
                                <input type="text" required placeholder="Contoh: Quiz 1 - Logika Matematika" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#A855F7] outline-none text-gray-900 dark:text-slate-100" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Topik / Subjek</label>
                                <input type="text" placeholder="Contoh: Aljabar" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#A855F7] outline-none text-gray-900 dark:text-slate-100" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Tautan Google Form <span className="text-red-500">*</span></label>
                                <input type="url" required placeholder="https://forms.gle/..." className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#A855F7] outline-none text-gray-900 dark:text-slate-100 font-mono" value={formData.googleFormUrl} onChange={(e) => setFormData({ ...formData, googleFormUrl: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Tahun Ajaran</label>
                                <input type="text" placeholder="2023/2024" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#A855F7] outline-none text-gray-900 dark:text-slate-100" value={formData.tahunAjaran} onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Deskripsi (Opsional)</label>
                                <textarea placeholder="Keterangan quiz..." className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#A855F7] outline-none min-h-[100px] resize-none text-gray-900 dark:text-slate-100" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors">Batal</button>
                            <button type="submit" disabled={loading} className="px-8 py-2.5 bg-[#A855F7] hover:bg-purple-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-purple-200 dark:shadow-none transition-colors disabled:opacity-50">{loading ? "Menyimpan..." : "Simpan Quiz"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
