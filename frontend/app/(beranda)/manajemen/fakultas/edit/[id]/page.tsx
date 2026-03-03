'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import InputFakultas from "@/app/components/akun-fakultas/input-fakultas";
import LogoFakultas from "@/app/components/akun-fakultas/Logo-fakultas";

export default function EditFakultasPage() {
    const [namaUniversitas, setNamaUniversitas] = useState("Telkom University");
    const [namaFakultas, setNamaFakultas] = useState("");
    const [logoBase64, setLogoBase64] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        fetchFakultas();
    }, [id]);

    const fetchFakultas = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                router.push("/login");
                return;
            }
            const res = await fetch(`http://localhost:8000/api/fakultas/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setNamaFakultas(data.data.name);
                setNamaUniversitas(data.data.universityName || "Telkom University");
            } else {
                alert("Fakultas tidak ditemukan!");
                router.push("/manajemen/fakultas");
            }
        } catch (e) {
            console.error("Gagal memuat fakultas", e);
            alert("Terjadi kesalahan.");
            router.push("/manajemen/fakultas");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSimpan = async () => {
        if (!namaFakultas) {
            alert("Harap isi nama fakultas!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/fakultas/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: namaFakultas, universityName: namaUniversitas || "Telkom University" })
            });

            const data = await res.json();
            if (data.success) {
                alert("Data Fakultas Berhasil Diperbarui!");
                router.push("/manajemen/fakultas");
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

    if (initialLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] text-gray-500">Memuat data fakultas...</div>;
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
                    Edit Data Fakultas
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Perbarui Data Fakultas</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[18px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl relative"
                style={{
                    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)"
                }}>

                <div className="w-full max-w-[1019px] flex items-center border-b border-gray-100 pb-2">
                    <Link href="/manajemen/fakultas" className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                        ← Kembali
                    </Link>
                    <h3 className="text-[20px] font-semibold leading-[32px] text-black">
                        Data Fakultas
                    </h3>
                </div>

                {/* Grid Input */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full max-w-[1019px]">
                    <div onInput={(e: any) => setNamaUniversitas(e.target.value)}>
                        <InputFakultas label="Nama Universitas" placeholder={namaUniversitas} />
                    </div>
                    <div onInput={(e: any) => setNamaFakultas(e.target.value)}>
                        <InputFakultas label="Fakultas" placeholder={namaFakultas || "Masukkan nama fakultas"} />
                    </div>
                </div>

                {/* Logo Section */}
                <div className="w-full max-w-[1019px]">
                    <LogoFakultas
                        label="Logo Fakultas"
                        onLogoChange={(img: any) => setLogoBase64(img)}
                    />
                </div>

                {/* Tombol Simpan */}
                <div className="w-full max-w-[1019px] flex justify-end gap-4">
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
