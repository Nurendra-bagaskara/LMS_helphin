"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function TambahMateri() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        prodiId: "",
        mataKuliahId: "",
        tahunAjaran: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const [dataProdi, setDataProdi] = useState<any[]>([]);
    const [dataMatkul, setDataMatkul] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Inisialisasi dari query params jika ada
    useEffect(() => {
        const queryProdiId = searchParams?.get("prodiId");
        const queryMataKuliahId = searchParams?.get("mataKuliahId");
        
        if (queryProdiId || queryMataKuliahId) {
            setFormData(prev => ({
                ...prev,
                ...(queryProdiId ? { prodiId: queryProdiId } : {}),
                ...(queryMataKuliahId ? { mataKuliahId: queryMataKuliahId } : {})
            }));
        }
    }, [searchParams]);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsSuperAdmin(user.permissions?.includes("*"));
            if (!user.permissions?.includes("*")) {
                setFormData(prev => ({ ...prev, prodiId: user.prodiId || "" }));
            }
        }
        fetchProdi();
    }, []);

    useEffect(() => {
        if (formData.prodiId) {
            fetchMatkul(formData.prodiId);
        } else {
            setDataMatkul([]);
        }
    }, [formData.prodiId]);

    const fetchProdi = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/prodi", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDataProdi(data.data);
        } catch (e) {
            console.error("Fetch prodi error", e);
        }
    };

    const fetchMatkul = async (prodiId: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/mata-kuliah?prodiId=${prodiId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDataMatkul(data.data);
        } catch (e) {
            console.error("Fetch matkul error", e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Pilih file materi terlebih dahulu.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("prodiId", formData.prodiId);
            fd.append("mataKuliahId", formData.mataKuliahId);
            fd.append("tahunAjaran", formData.tahunAjaran);
            fd.append("file", file);

            const res = await fetch("http://localhost:8000/api/materials", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (data.success) {
                alert("Materi berhasil ditambahkan! 📄");
                router.back();
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
                    Tambah Materi
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Upload materi pembelajaran baru ke dalam sistem</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[32px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl"
                style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)" }}>

                <div className="w-full flex items-center border-b border-gray-100 pb-2">
                    <button type="button" onClick={() => router.back()} className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                        ← Kembali
                    </button>
                    <h3 className="text-[20px] font-semibold leading-[32px] text-black">
                        Informasi Materi
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[1019px] flex flex-col gap-[32px]">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Judul Materi</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Modul 1 - Pengenalan"
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Tahun Ajaran</label>
                            <input
                                type="text"
                                placeholder="2023/2024"
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all"
                                value={formData.tahunAjaran}
                                onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Program Studi</label>
                            {isSuperAdmin ? (
                                <select
                                    required
                                    className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all cursor-pointer"
                                    value={formData.prodiId}
                                    onChange={(e) => setFormData({ ...formData, prodiId: e.target.value, mataKuliahId: "" })}
                                >
                                    <option value="">Pilih Program Studi</option>
                                    {dataProdi.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={dataProdi.find(p => p.id === formData.prodiId)?.name || "Memuat..."}
                                    disabled
                                    className="w-full h-[45px] px-[12px] bg-gray-50 border border-[#E6E6E6] rounded-[4px] text-[14px] text-gray-500 font-medium"
                                />
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Mata Kuliah</label>
                            <select
                                required
                                disabled={!formData.prodiId}
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all cursor-pointer disabled:opacity-50"
                                value={formData.mataKuliahId}
                                onChange={(e) => setFormData({ ...formData, mataKuliahId: e.target.value })}
                            >
                                <option value="">Pilih Mata Kuliah</option>
                                {dataMatkul.map(m => (
                                    <option key={m.id} value={m.id}>({m.code}) {m.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2">
                            <label className="text-sm font-bold text-gray-900">Deskripsi (Opsional)</label>
                            <textarea
                                placeholder="Deskripsi singkat materi..."
                                className="w-full px-[12px] py-[10px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all h-24 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2">
                            <label className="text-sm font-bold text-gray-900">File Materi</label>
                            <div className="border-2 border-dashed border-[#E6E6E6] rounded-[8px] p-6 text-center hover:border-[#068DFF] transition-all cursor-pointer"
                                onClick={() => document.getElementById('file-input')?.click()}>
                                <input
                                    id="file-input"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                {file ? (
                                    <p className="text-sm text-[#068DFF] font-semibold">📄 {file.name}</p>
                                ) : (
                                    <div>
                                        <p className="text-gray-400 text-sm">Klik untuk memilih file</p>
                                        <p className="text-gray-300 text-xs mt-1">PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX (Maks. 50MB)</p>
                                    </div>
                                )}
                            </div>
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
