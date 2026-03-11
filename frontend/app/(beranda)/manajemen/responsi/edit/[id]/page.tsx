"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import InputFakultas from "@/app/components/akun-fakultas/input-fakultas";

export default function EditResponsi() {
    const [judulResponsi, setJudulResponsi] = useState("");
    const [namaPemateri, setNamaPemateri] = useState("");
    const [tanggal, setTanggal] = useState("");
    const [waktu, setWaktu] = useState("");
    const [linkResponsi, setLinkResponsi] = useState("");
    const [linkRequestMateri, setLinkRequestMateri] = useState("");
    const [linkKomunitas, setLinkKomunitas] = useState("");
    const [status, setStatus] = useState("upcoming");
    const [mataKuliahId, setMataKuliahId] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        fetchResponsi();
    }, [id]);

    const fetchResponsi = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch(`http://localhost:8000/api/responsi/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const r = data.data;
                setJudulResponsi(r.title || "");
                setNamaPemateri(r.speaker || "");
                setLinkResponsi(r.meetingLink || "");
                setLinkRequestMateri(r.requestMaterialLink || "");
                setLinkKomunitas(r.communityLink || "");
                setStatus(r.status || "upcoming");
                setMataKuliahId(r.mataKuliahId || "");

                if (r.scheduleDate) {
                    const dateObj = new Date(r.scheduleDate);
                    // Extract YYYY-MM-DD
                    const yyyy = dateObj.getFullYear();
                    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const dd = String(dateObj.getDate()).padStart(2, '0');
                    setTanggal(`${yyyy}-${mm}-${dd}`);

                    // Extract HH:MM
                    const hours = String(dateObj.getHours()).padStart(2, '0');
                    const mins = String(dateObj.getMinutes()).padStart(2, '0');
                    setWaktu(`${hours}:${mins}`);
                }
            } else {
                alert("Responsi tidak ditemukan!");
                router.push("/manajemen/responsi");
            }
        } catch (e) {
            console.error("Gagal memuat responsi", e);
            alert("Terjadi kesalahan.");
            router.push("/manajemen/responsi");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleBack = () => {
        if (mataKuliahId) {
            router.push(`/mata-kuliah/${mataKuliahId}`);
        } else {
            router.push("/mata-kuliah");
        }
    };

    const handleSimpan = async () => {
        if (!judulResponsi || !tanggal || !waktu) {
            alert("Harap isi Judul, Tanggal, dan Waktu Pelaksanaan!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const scheduleDate = new Date(`${tanggal}T${waktu}:00`).toISOString();

            const payload: any = {
                title: judulResponsi,
                scheduleDate,
                status,
            };
            if (namaPemateri) payload.speaker = namaPemateri;
            payload.meetingLink = linkResponsi || null;
            payload.requestMaterialLink = linkRequestMateri || null;
            payload.communityLink = linkKomunitas || null;

            const res = await fetch(`http://localhost:8000/api/responsi/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert("Data Responsi Berhasil Diperbarui!");
                handleBack();
            } else {
                alert(`Gagal: ${data.message || "Terjadi kesalahan"}`);
            }
        } catch (e) {
            console.error("Gagal menyimpan", e);
            alert("Terjadi kesalahan pada sistem.");
        } finally {
            setLoading(false);
        }
    };

    // Menggunakan komponen InputFakultas untuk tampilan seragam

    if (initialLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-gray-500">Memuat data responsi...</div>;
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center py-20 overflow-hidden"
            style={{
                backgroundImage: "url('/images/background.svg')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "115% 0%",
                backgroundColor: '#FCFDFF'
            }}>

            {/* Logo Helphin */}
            <div className="mb-10">
                <Image
                    src="/images/helPhin 2.png"
                    alt="Logo Helphin"
                    width={150}
                    height={50}
                    priority
                />
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-[32px] font-semibold leading-[32px] text-[#1D1D1D]">
                    Edit Data Responsi
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Perbarui Jadwal Responsi</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[32px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl relative"
                style={{
                    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)"
                }}>

                <div className="w-full flex items-center border-b border-gray-100 pb-2">
                    <button type="button" onClick={handleBack} className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                        ← Kembali
                    </button>
                    <h3 className="text-[20px] font-semibold leading-[32px] text-black">
                        Informasi Responsi
                    </h3>
                </div>

                {/* Grid Input */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full max-w-[1019px]">
                    <InputFakultas
                        label="Judul Responsi"
                        placeholder="Masukkan judul responsi"
                        value={judulResponsi}
                        onChange={setJudulResponsi}
                    />
                    <InputFakultas
                        label="Nama Pemateri"
                        placeholder="Masukkan nama pemateri"
                        value={namaPemateri}
                        onChange={setNamaPemateri}
                    />
                    <InputFakultas
                        label="Tanggal Pelaksanaan"
                        type="date"
                        value={tanggal}
                        onChange={setTanggal}
                    />
                    <InputFakultas
                        label="Waktu Pelaksanaan"
                        type="time"
                        value={waktu}
                        onChange={setWaktu}
                    />

                    <div className="flex flex-col gap-1.5 w-full mb-4">
                        <label className="text-sm font-bold text-gray-900">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all font-normal cursor-pointer"
                        >
                            <option value="upcoming">Upcoming</option>
                            <option value="live">Live</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <InputFakultas
                        label="Link Responsi (Meeting)"
                        placeholder="https://zoom.us/..."
                        value={linkResponsi}
                        onChange={setLinkResponsi}
                    />
                    <InputFakultas
                        label="Link Request Materi"
                        placeholder="https://forms.gle/..."
                        value={linkRequestMateri}
                        onChange={setLinkRequestMateri}
                    />
                    <div className="col-span-2">
                        <InputFakultas
                            label="Link Komunitas"
                            placeholder="https://chat.whatsapp.com/..."
                            value={linkKomunitas}
                            onChange={setLinkKomunitas}
                        />
                    </div>
                </div>

                {/* Tombol Simpan */}
                <div className="w-full flex justify-end gap-4 mt-4">
                    <button
                        onClick={handleSimpan}
                        disabled={loading}
                        className="w-[264px] h-[54px] bg-[#068DFF] text-white rounded-[4px] font-bold text-[16px] hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
