"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import LogoUpload from "@/app/components/akun-prodi/logo-upload";

export default function EditMatkul() {
    const { id } = useParams();
    const [formData, setFormData] = useState({ name: "", coverUrl: "", prodiId: "" });
    const [dataProdi, setDataProdi] = useState<any[]>([]);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsSuperAdmin(user.permissions?.includes("*"));
        }
        fetchProdi();
        fetchMatkul();
    }, []);

    const fetchProdi = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/prodi", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDataProdi(data.data);
        } catch (e) {
            console.error("Failed to fetch prodi", e);
        }
    };

    const fetchMatkul = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFormData({
                    name: data.data.name,
                    coverUrl: data.data.coverUrl || "",
                    prodiId: data.data.prodiId
                });
            } else {
                alert(data.message);
                router.push("/superadmin/manajemen/matkul");
            }
        } catch (e) {
            console.error("Error fetching matkul", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.prodiId) {
            alert("Pilih Program Studi terlebih dahulu.");
            return;
        }
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: formData.name, coverUrl: formData.coverUrl, prodiId: formData.prodiId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Mata kuliah berhasil diperbarui! ✨");
                router.push("/superadmin/manajemen/matkul");
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Error updating matkul", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#FCFDFF' }}>
            <p className="text-gray-400 italic font-jakarta">Memuat data...</p>
        </div>
    );

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
                    Edit Mata Kuliah
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Perbarui informasi mata kuliah yang sudah terdaftar</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[32px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl"
                style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)" }}>

                <div className="w-full flex items-center border-b border-gray-100 pb-2">
                    <Link href="/superadmin/manajemen/matkul" className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                        ← Kembali
                    </Link>
                    <h3 className="text-[20px] font-semibold leading-[32px] text-black">
                        Data Mata Kuliah
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[1019px] flex flex-col gap-[32px]">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-bold text-gray-900">Program Studi</label>
                            {isSuperAdmin ? (
                                <select
                                    value={formData.prodiId}
                                    onChange={(e) => setFormData({ ...formData, prodiId: e.target.value })}
                                    className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all cursor-pointer"
                                    required
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
                            <label className="text-sm font-bold text-gray-900">Nama Mata Kuliah</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Contoh: Pemrograman Dasar"
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2">
                            <label className="text-sm font-bold text-gray-900">Cover Mata Kuliah</label>
                            <div className="w-full">
                                {/* @ts-ignore: JS to TS prop inference issue */}
                                <LogoUpload
                                    label="Ubah Cover"
                                    initialPreview={formData.coverUrl || undefined}
                                    onLogoChange={(img: string) => setFormData({ ...formData, coverUrl: img })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full flex justify-end gap-3 mt-4">
                        <Link href="/superadmin/manajemen/matkul">
                            <button
                                type="button"
                                className="w-[160px] h-[54px] bg-white text-gray-600 border border-gray-200 rounded-[4px] font-bold text-[16px] hover:bg-gray-50 transition-all"
                            >
                                Batal
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-[264px] h-[54px] bg-[#068DFF] text-white rounded-[4px] font-bold text-[16px] hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
                        >
                            {saving ? "Memperbarui..." : "Update Mata Kuliah"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
