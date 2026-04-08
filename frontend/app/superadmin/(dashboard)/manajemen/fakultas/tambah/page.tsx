'use client';
import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import InputFakultas from "@/app/components/akun-fakultas/input-fakultas";

export default function BuatAkunFakultas() {
    const [namaUniversitas, setNamaUniversitas] = useState("");
    const [namaFakultas, setNamaFakultas] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSimpan = async () => {
        if (!namaFakultas) {
            alert("Harap isi nama fakultas!");
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

            const res = await fetch("http://localhost:8000/api/fakultas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name: namaFakultas, universityName: namaUniversitas || "Telkom University" })
            });

            const data = await res.json();
            if (data.success) {
                alert("Data Fakultas Berhasil Disimpan!");
                router.push("/superadmin/manajemen/fakultas");
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
                    Buat Data Fakultas
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Buatkan Akun Fakultas</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[18px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl"
                style={{
                    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)"
                }}>

                <h3 className="w-full max-w-[1019px] text-[20px] font-semibold leading-[32px] text-black border-b border-gray-100 pb-2 self-center">
                    Data Prodi
                </h3>

                {/* Grid Input */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full max-w-[1019px]">
                    <div onInput={(e: any) => setNamaUniversitas(e.target.value)}>
                        <InputFakultas label="Nama Universitas" placeholder="Pilih universitas" />
                    </div>
                    <div onInput={(e: any) => setNamaFakultas(e.target.value)}>
                        <InputFakultas label="Fakultas" placeholder="Masukkan nama fakultas" />
                    </div>
                </div>

                {/* Grid Input */}

                {/* Tombol Simpan */}
                <div className="w-full max-w-[1019px] flex justify-end">
                    <button
                        onClick={handleSimpan}
                        className="w-[264px] h-[54px] bg-[#068DFF] text-white rounded-[4px] font-bold text-[16px] hover:bg-blue-600 transition-all shadow-md"
                    >
                        Simpan
                    </button>
                </div>
            </div>
        </div>
    );
}

