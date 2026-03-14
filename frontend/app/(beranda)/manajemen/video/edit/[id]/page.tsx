"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FooterDashboard from "../../../../dashboard/components/footer_dashboard";

export default function EditVideo() {
    const { id } = useParams();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        youtubeUrl: "",
        type: "recording",
        tahunAjaran: "",
        prodiId: "",
        mataKuliahId: "",
        prodiName: "",
        mataKuliahName: ""
    });
    const [dataProdi, setDataProdi] = useState<any[]>([]);
    const [dataMatkul, setDataMatkul] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsSuperAdmin(user.permissions?.includes("*"));
        }
        fetchProdi();
        fetchVideoDetail();
    }, [id]);

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

    const fetchVideoDetail = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/videos/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setFormData({
                    title: data.data.title,
                    description: data.data.description || "",
                    youtubeUrl: data.data.youtubeUrl || data.data.embedUrl || "",
                    type: data.data.type,
                    tahunAjaran: data.data.tahunAjaran || "",
                    prodiId: data.data.prodiId || "",
                    mataKuliahId: data.data.mataKuliahId || "",
                    prodiName: data.data.prodiName,
                    mataKuliahName: data.data.mataKuliahName
                });
            } else {
                alert(data.message);
                router.back();
            }
        } catch (e) {
            console.error("Fetch detail error", e);
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
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/videos/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    youtubeUrl: formData.youtubeUrl,
                    type: formData.type,
                    tahunAjaran: formData.tahunAjaran,
                    prodiId: formData.prodiId,
                    mataKuliahId: formData.mataKuliahId
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Video berhasil diperbarui! ✨");
                handleBack();
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Update error", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center text-gray-500 italic">Memuat data video...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800 font-jakarta">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Edit Video <span className="text-blue-600">✏️</span>
                    </h1>
                    <p className="text-gray-400 text-sm italic">Ubah detail link YouTube atau metadata video pembelajaran.</p>
                </div>

                <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Judul Video</label>
                            <input
                                type="text"
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Link YouTube</label>
                            <input
                                type="url"
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
                                value={formData.youtubeUrl}
                                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                            />
                            <p className="text-[10px] text-gray-400 italic mt-1">* Pastikan format link benar agar embed dapat berjalan.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Tipe Video</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="recording">Recording (Rekaman)</option>
                                    <option value="live">Live Stream</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Tahun Ajaran</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.tahunAjaran}
                                    onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Program Studi - Editable Dropdown */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Program Studi</label>
                            {isSuperAdmin ? (
                                <select
                                    required
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.prodiId}
                                    onChange={(e) => setFormData({ ...formData, prodiId: e.target.value, mataKuliahId: "" })}
                                >
                                    <option value="">Pilih Program Studi</option>
                                    {dataProdi.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={dataProdi.find(p => p.id === formData.prodiId)?.name || formData.prodiName || "Memuat..."}
                                    disabled
                                    className="w-full border border-gray-200 p-3 rounded-xl bg-gray-50 text-gray-500 font-medium"
                                />
                            )}
                        </div>

                        {/* Mata Kuliah - Editable Dropdown */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-gray-700">Mata Kuliah</label>
                            <select
                                required
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                                value={formData.mataKuliahId}
                                disabled={!formData.prodiId}
                                onChange={(e) => setFormData({ ...formData, mataKuliahId: e.target.value })}
                            >
                                <option value="">Pilih Mata Kuliah</option>
                                {dataMatkul.map((m) => (
                                    <option key={m.id} value={m.id}>({m.code}) {m.name}</option>
                                ))}
                            </select>
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
