"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FooterDashboard from "../../../../dashboard/components/footer_dashboard";

export default function EditMatkul() {
    const { id } = useParams();
    const [formData, setFormData] = useState({ name: "", code: "", prodiId: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchMatkul();
    }, []);

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
                    code: data.data.code,
                    prodiId: data.data.prodiId
                });
            } else {
                alert(data.message);
                router.push("/manajemen/matkul");
            }
        } catch (e) {
            console.error("Error fetching matkul", e);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: formData.name, code: formData.code })
            });
            const data = await res.json();
            if (data.success) {
                alert("Mata kuliah berhasil diperbarui! ✨");
                router.push("/manajemen/matkul");
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

    if (loading) return <div className="p-10 text-center text-gray-400 italic font-jakarta">Memuat data...</div>;

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        Edit Mata Kuliah <span className="text-orange-500">⚙️</span>
                    </h1>
                    <p className="text-gray-400 text-sm italic">Ubah informasi mata kuliah yang sudah terdaftar.</p>
                </div>

                <div className="max-w-xl bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6 font-jakarta">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-400">Program Studi (Terkunci)</label>
                            <input
                                type="text"
                                value={formData.prodiId} // We could fetch name, but ID suffices for a locked view
                                disabled
                                className="w-full border border-gray-100 p-3 rounded-xl bg-gray-50 text-gray-300 font-mono text-xs"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Kode Mata Kuliah</label>
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Nama Mata Kuliah</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {saving ? "Memperbarui..." : "Update Matkul"}
                            </button>
                            <button
                                type="button"
                                onClick={() => router.back()}
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
