"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TambahResponsiAdmin() {
    const params = useParams();
    const id = params?.id as string;

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        topic: "",
        speaker: "",
        scheduleDate: "",
        scheduleTime: "",
        durationMinutes: 60,
        meetingLink: "",
        communityLink: "",
        requestMaterialLink: "",
        liveChatLink: "",
        status: "upcoming"
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
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");

            // Combine date and time
            const combinedDateTime = new Date(`${formData.scheduleDate}T${formData.scheduleTime}`);

            const payload = {
                title: formData.title,
                description: formData.description || undefined,
                topic: formData.topic || undefined,
                speaker: formData.speaker || undefined,
                scheduleDate: combinedDateTime.toISOString(),
                durationMinutes: Number(formData.durationMinutes),
                meetingLink: formData.meetingLink || undefined,
                communityLink: formData.communityLink || undefined,
                requestMaterialLink: formData.requestMaterialLink || undefined,
                liveChatLink: formData.liveChatLink || undefined,
                status: formData.status,
                mataKuliahId: id,
                prodiId: prodiId
            };

            const res = await fetch("http://localhost:8000/api/responsi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert("Responsi berhasil dijadwalkan! 🗓️");
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
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-sm border border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 hover:text-[#EF4444] transition-all">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 leading-tight">Jadwalkan Responsi</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Mata Kuliah: <strong className="text-[#EF4444]">{matkulName}</strong></p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-red-50 dark:border-slate-800">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Judul Responsi</label>
                                <input type="text" required placeholder="Contoh: Responsi Besar Kalkulus I" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Topik Pembahasan</label>
                                <input type="text" placeholder="Contoh: Turunan dan Integral" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Pemateri / Speaker</label>
                                <input type="text" placeholder="Nama pemateri..." className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.speaker} onChange={(e) => setFormData({ ...formData, speaker: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Tanggal Pelaksanaan</label>
                                <input type="date" required className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.scheduleDate} onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Waktu Mulai</label>
                                <input type="time" required className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.scheduleTime} onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Durasi (Menit)</label>
                                <input type="number" required className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.durationMinutes} onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Link Live Streaming</label>
                                <input type="url" placeholder="Tautan Live Streaming YouTube" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.meetingLink} onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Link Grup Komunitas</label>
                                <input type="url" placeholder="Tautan WhatsApp/Line Community" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.communityLink} onChange={(e) => setFormData({ ...formData, communityLink: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[#007AFF] dark:text-blue-400">Request Soal</label>
                                <input type="url" placeholder="Tautan Google Form" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.requestMaterialLink} onChange={(e) => setFormData({ ...formData, requestMaterialLink: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-[#059669] dark:text-emerald-400">Link Live Chat</label>
                                <input type="url" placeholder="Tautan Live Chat (Opsional)" className="w-full h-[48px] px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none" value={formData.liveChatLink} onChange={(e) => setFormData({ ...formData, liveChatLink: e.target.value })} />
                            </div>

                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Deskripsi (Opsional)</label>
                                <textarea placeholder="Informasi tambahan mengenai responsi..." className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm text-gray-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-[#EF4444] outline-none min-h-[100px] resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-100 transition-colors">Batal</button>
                            <button type="submit" disabled={loading} className="px-8 py-2.5 bg-[#EF4444] hover:bg-red-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-red-200 dark:shadow-none transition-colors disabled:opacity-50">{loading ? "Menyimpan..." : "Buat Responsi"}</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
