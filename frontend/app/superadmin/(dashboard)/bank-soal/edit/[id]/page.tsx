"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

export default function EditBankSoal() {
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
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) fetchBankSoal();
    }, [id]);

    const fetchBankSoal = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/bank-soal/${id}`, {
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
            console.error("Failed to fetch bank soal:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");

            // Menggunakan FormData karena sekarang mendukung upload file
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("tahunAjaran", formData.tahunAjaran);
            if (file) {
                fd.append("file", file);
            }

            const res = await fetch(`http://localhost:8000/api/bank-soal/${id}`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: fd
            });

            const json = await res.json();
            if (json.success) {
                alert("Bank Soal berhasil diubah!");
                router.push("/bank-soal");
            } else {
                alert(json.message || "Gagal mengubah bank soal.");
            }
        } catch (error) {
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-500">Memuat data...</div>;

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
                    Edit Bank Soal
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Ubah informasi atau ganti file bank soal</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[32px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl"
                style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)" }}>

                <div className="w-full flex justify-between items-center border-b border-gray-100 pb-2">
                    <div className="flex items-center">
                        <Link href="/bank-soal" className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                            ← Kembali
                        </Link>
                        <h3 className="text-[20px] font-semibold leading-[32px] text-black">
                            Informasi Bank Soal
                        </h3>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="w-full max-w-[1019px] flex flex-col gap-[32px]">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
                        {/* Read-only info fields untuk konsistensi konteks */}
                        <div className="flex flex-col gap-1.5 focus-within:opacity-50 transition-opacity">
                            <label className="text-sm font-bold text-gray-400">Program Studi (Read-Only)</label>
                            <input
                                type="text"
                                disabled
                                className="w-full h-[45px] px-[12px] bg-gray-50 border border-[#E6E6E6] rounded-[4px] text-[14px] text-gray-500 font-medium cursor-not-allowed"
                                value={formData.prodiName}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 focus-within:opacity-50 transition-opacity">
                            <label className="text-sm font-bold text-gray-400">Mata Kuliah (Read-Only)</label>
                            <input
                                type="text"
                                disabled
                                className="w-full h-[45px] px-[12px] bg-gray-50 border border-[#E6E6E6] rounded-[4px] text-[14px] text-gray-500 font-medium cursor-not-allowed"
                                value={formData.mataKuliahName}
                            />
                        </div>

                        {/* Editable fields */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Judul Bank Soal</label>
                            <input
                                type="text"
                                required
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Tahun Ajaran</label>
                            <input
                                type="text"
                                required
                                placeholder="2023/2024"
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all"
                                value={formData.tahunAjaran}
                                onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                            <label className="text-sm font-bold text-gray-900">Deskripsi (Opsional)</label>
                            <textarea
                                placeholder="Deskripsi singkat bank soal..."
                                className="w-full px-[12px] py-[10px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all h-24 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 col-span-2">
                            <label className="text-sm font-bold text-gray-900">Ganti File Bank Soal (Opsional)</label>
                            <div className="border-2 border-dashed border-[#E6E6E6] rounded-[8px] p-6 text-center hover:border-[#068DFF] transition-all cursor-pointer bg-white"
                                onClick={() => document.getElementById('file-input')?.click()}>
                                <input
                                    id="file-input"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <p className="text-sm text-[#068DFF] font-semibold">📄 {file.name}</p>
                                        <p className="text-xs text-gray-500">File ini akan menimpa file yang lama saat disimpan.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-gray-400 text-sm">Klik untuk mengunggah file baru</p>
                                        <p className="text-gray-300 text-xs mt-1">Biarkan kosong jika tidak ingin mengubah file saat ini.</p>
                                        <p className="text-gray-300 text-xs mt-1">PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-[264px] h-[54px] bg-[#068DFF] text-white rounded-[4px] font-bold text-[16px] hover:bg-blue-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                            {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>

            </div>
            {/* Note: FooterDashboard removed here because the new UI layout spans the full height and doesn't explicitly use it like a boxed dashboard, but can be added if required. Kept out to match "Tambah" page layout */}
        </div>
    );
}
