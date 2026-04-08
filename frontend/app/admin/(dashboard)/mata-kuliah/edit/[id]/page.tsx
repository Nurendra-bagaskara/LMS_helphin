"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LogoUpload from "@/app/components/akun-prodi/logo-upload";
import { useTheme } from "@/context/ThemeContext";

export default function EditMatkulAdmin() {
    const { theme } = useTheme();
    const { id } = useParams();
    const [formData, setFormData] = useState({ name: "", coverUrl: "" });
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const router = useRouter();


    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success && data.data) {
                setFormData({
                    name: data.data.name,
                    coverUrl: data.data.coverUrl || "",
                });
            }
        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    coverUrl: formData.coverUrl
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Mata kuliah berhasil diperbarui! 📚");
                router.push("/admin/mata-kuliah");
            } else {
                alert(`Gagal memperbarui: ${data.message}`);
            }
        } catch (e) {
            console.error("Error updating matkul", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
             <div className="min-h-screen w-full flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin" />
             </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center py-20 overflow-hidden bg-[#FCFDFF] dark:bg-slate-950 transition-colors duration-300"
            style={{
                backgroundImage: "url('/images/background.svg')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "115% 0%",
            }}>

            <div className="mb-10">
                <Image src="/images/helPhin 2.png" alt="Logo Helphin" width={150} height={50} priority className="dark:brightness-200" />
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-[32px] font-semibold leading-[32px] text-[#1D1D1D] dark:text-slate-100">
                    Edit Mata Kuliah
                </h1>
                <p className="text-[#068DFF] dark:text-blue-400 text-sm mt-2">Perbarui data mata kuliah di sistem akademik</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[32px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl border border-transparent dark:border-slate-800 transition-all"
                style={{ background: theme === 'dark' ? 'linear-gradient(180deg, rgba(15, 23, 42, 0.8) 0%, #0f172a 100%)' : 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)' }}>

                <div className="w-full flex items-center border-b border-gray-100 dark:border-slate-800 pb-2">
                    <Link href="/admin/mata-kuliah" className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                        ← Kembali
                    </Link>
                    <h3 className="text-[20px] font-semibold leading-[32px] text-black dark:text-slate-100">
                        Data Mata Kuliah
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[1019px] flex flex-col gap-[32px]">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 w-full">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900 dark:text-slate-300">Nama Mata Kuliah</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Pemrograman Dasar"
                                className="w-full h-[45px] px-[12px] bg-white dark:bg-slate-800 border border-[#E6E6E6] dark:border-slate-700 rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] dark:text-slate-100 outline-none focus:border-[#068DFF] transition-all"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900 dark:text-slate-300 line-clamp-1">Cover Mata Kuliah</label>
                            <div className="w-full">
                                {/* @ts-ignore */}
                                <LogoUpload 
                                    label="Ubah Cover" 
                                    initialPreview={formData.coverUrl}
                                    onLogoChange={(img: string) => setFormData({ ...formData, coverUrl: img })} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[264px] h-[54px] bg-[#068DFF] text-white rounded-[4px] font-bold text-[16px] hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
                        >
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
