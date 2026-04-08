"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TambahBankSoalAdmin() {
    const params = useParams();
    const id = params?.id as string;

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        tahunAjaran: "",
        file: null as File | null
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.file) {
            alert("Harap pilih file pembahasan soal!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const body = new FormData();
            body.append("title", formData.title);
            body.append("description", formData.description);
            body.append("tahunAjaran", formData.tahunAjaran);
            body.append("mataKuliahId", id);
            body.append("prodiId", prodiId);
            body.append("file", formData.file);

            const res = await fetch("http://localhost:8000/api/bank-soal", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${token}` 
                },
                body: body
            });
            const data = await res.json();
            if (data.success) {
                alert("Bank Soal berhasil ditambahkan! 📚");
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
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:text-[#2563EB] transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight">Buat Bank Soal Baru</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Mata Kuliah: <strong className="text-[#2563EB]">{matkulName}</strong></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-blue-50 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                         <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">File Pembahasan Soal <span className="text-red-500">*</span></label>
                            <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-8 text-center bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 hover:border-[#2563EB] dark:hover:border-[#2563EB] transition-all cursor-pointer relative">
                                <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 13 7 8"/><line x1="12" x2="12" y1="1" y2="13"/></svg>
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">{formData.file ? formData.file.name : "Klik atau seret file PDF/DOCX ke sini"}</p>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">Pastikan file berisi pembahasan soal yang lengkap</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Judul Bank Soal</label>
                                <input type="text" required placeholder="Contoh: Pembahasan UTS 2023" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#2563EB] outline-none text-gray-900 dark:text-slate-100" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                             <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Tahun Ajaran</label>
                                <input type="text" placeholder="2023/2024" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#2563EB] outline-none text-gray-900 dark:text-slate-100" value={formData.tahunAjaran} onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })} />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Deskripsi (Opsional)</label>
                                <textarea placeholder="Keterangan mengenai bank soal ini..." className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-[#2563EB] outline-none min-h-[100px] resize-none text-gray-900 dark:text-slate-100" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors">Batal</button>
                            <button type="submit" disabled={loading} className="px-8 py-2.5 bg-[#2563EB] hover:bg-blue-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-200 dark:shadow-none transition-colors disabled:opacity-50">{loading ? "Uploading..." : "Simpan Bank Soal"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
