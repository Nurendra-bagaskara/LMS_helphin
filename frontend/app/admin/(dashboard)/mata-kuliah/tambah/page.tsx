"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LogoUpload from "@/app/components/akun-prodi/logo-upload";
import { useTheme } from "@/context/ThemeContext";

export default function TambahMatkulAdmin() {
    const { theme } = useTheme();
    const [formData, setFormData] = useState({ name: "", coverUrl: "", prodiId: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.prodiId) {
                setFormData(prev => ({ ...prev, prodiId: user.prodiId }));
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.prodiId) {
            alert("Error: ID Prodi tidak ditemukan untuk admin ini.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/mata-kuliah", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Mata kuliah berhasil ditambahkan! 📚");
                router.push("/admin/mata-kuliah");
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Error creating matkul", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

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
                    Tambah Mata Kuliah Baru
                </h1>
                <p className="text-[#068DFF] dark:text-blue-400 text-sm mt-2 font-medium">Rekam mata kuliah baru ke dalam sistem akademik (Admin Prodi)</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[32px] rounded-[16px] flex flex-col items-center gap-[32px] shadow-2xl shadow-blue-500/5 bg-white/90 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 backdrop-blur-sm">

                <div className="w-full flex items-center border-b border-gray-100 dark:border-slate-800 pb-4">
                    <Link href="/admin/mata-kuliah" className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-bold mr-4">
                        ← Kembali
                    </Link>
                    <h3 className="text-[20px] font-black leading-[32px] text-gray-900 dark:text-white tracking-tight">
                        Data Mata Kuliah
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[1019px] flex flex-col gap-[32px]">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 w-full">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nama Mata Kuliah</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Pemrograman Dasar"
                                className="w-full h-[52px] px-[16px] bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700/50 rounded-xl text-sm font-bold text-gray-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-[#068DFF] transition-all placeholder:text-gray-300 dark:placeholder:text-slate-600"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest pl-1">Cover Mata Kuliah</label>
                            <div className="w-full">
                                <LogoUpload 
                                    label="Unggah Cover" 
                                    onLogoChange={(img: string) => setFormData({ ...formData, coverUrl: img })} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[264px] h-[54px] bg-gradient-to-r from-[#0055FF] to-[#068DFF] text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
