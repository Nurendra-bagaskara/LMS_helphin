"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import InputFakultas from "@/app/components/akun-fakultas/input-fakultas";

export default function BuatResponsi() {
    const [judulResponsi, setJudulResponsi] = useState("");
    const [namaPemateri, setNamaPemateri] = useState("");
    const [tanggal, setTanggal] = useState("");
    const [waktu, setWaktu] = useState("");
    const [linkResponsi, setLinkResponsi] = useState("");
    const [linkRequestMateri, setLinkRequestMateri] = useState("");
    const [linkKomunitas, setLinkKomunitas] = useState("");
    const [status, setStatus] = useState("upcoming");
    const [loading, setLoading] = useState(false);
    const [listProdi, setListProdi] = useState<any[]>([]);
    const [listMatkul, setListMatkul] = useState<any[]>([]);
    const [prodiId, setProdiId] = useState("");
    const [mataKuliahId, setMataKuliahId] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();

    // Inisialisasi dari query params jika ada
    useEffect(() => {
        const queryProdiId = searchParams?.get("prodiId");
        const queryMataKuliahId = searchParams?.get("mataKuliahId");

        if (queryProdiId) {
            setProdiId(queryProdiId);
        }
        if (queryMataKuliahId) {
            setMataKuliahId(queryMataKuliahId);
        }
    }, [searchParams]);

    const handleBack = () => {
        const queryMataKuliahId = searchParams?.get("mataKuliahId");
        if (queryMataKuliahId || mataKuliahId) {
            router.push(`/mata-kuliah/${queryMataKuliahId || mataKuliahId}`);
        } else {
            router.push("/mata-kuliah");
        }
    };

    useEffect(() => {
        const fetchProdi = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) {
                    console.warn("No token found for prodi fetch");
                    return;
                }
                const res = await fetch("http://localhost:8000/api/prodi", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    console.error("Prodi fetch failed with status:", res.status);
                    return;
                }
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setListProdi(data.data);
                } else {
                    console.warn("Prodi response:", data);
                }
            } catch (e) {
                console.error("Gagal load prodi", e);
            }
        };
        fetchProdi();
    }, []);

    useEffect(() => {
        if (prodiId) {
            const fetchMatkul = async () => {
                try {
                    const token = localStorage.getItem("accessToken");
                    const res = await fetch(`http://localhost:8000/api/mata-kuliah?prodiId=${prodiId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.success) {
                        setListMatkul(data.data);
                    }
                } catch (e) {
                    console.error("Gagal load matkul", e);
                }
            };
            fetchMatkul();
        } else {
            setListMatkul([]);
        }
    }, [prodiId]);

    const handleSimpan = async () => {
        if (!judulResponsi || !tanggal || !waktu || !prodiId) {
            alert("Harap isi Judul, Tanggal, Waktu Pelaksanaan, dan pilih Prodi!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                alert("Sesi login berakhir. Silakan login kembali.");
                router.push("/login");
                return;
            }

            const scheduleDate = new Date(`${tanggal}T${waktu}:00`).toISOString();

            const payload: any = {
                title: judulResponsi,
                scheduleDate,
                status,
                prodiId,
            };
            if (mataKuliahId) payload.mataKuliahId = mataKuliahId;
            if (namaPemateri) payload.speaker = namaPemateri;
            if (linkResponsi) payload.meetingLink = linkResponsi;
            if (linkRequestMateri) payload.requestMaterialLink = linkRequestMateri;
            if (linkKomunitas) payload.communityLink = linkKomunitas;

            const res = await fetch("http://localhost:8000/api/responsi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert("Data Responsi Berhasil Disimpan!");
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
                    Buat Data Responsi
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Buatkan Jadwal Responsi Baru</p>
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

                    <div className="flex flex-col gap-1.5 w-full mb-4">
                        <label className="text-sm font-bold text-gray-900">Prodi</label>
                        <select
                            value={prodiId}
                            onChange={(e) => setProdiId(e.target.value)}
                            className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all font-normal cursor-pointer"
                        >
                            <option value="">Pilih Prodi</option>
                            {listProdi.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-1.5 w-full mb-4">
                        <label className="text-sm font-bold text-gray-900">Mata Kuliah</label>
                        <select
                            value={mataKuliahId}
                            onChange={(e) => setMataKuliahId(e.target.value)}
                            disabled={!prodiId}
                            className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all font-normal cursor-pointer disabled:opacity-50"
                        >
                            <option value="">Pilih Mata Kuliah (Opsional)</option>
                            {listMatkul.map((m) => (
                                <option key={m.id} value={m.id}>({m.code}) {m.name}</option>
                            ))}
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
                <div className="w-full flex justify-end mt-4">
                    <button
                        onClick={handleSimpan}
                        disabled={loading}
                        className="w-[264px] h-[54px] bg-[#068DFF] text-white rounded-[4px] font-bold text-[16px] hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
                    >
                        {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
}
