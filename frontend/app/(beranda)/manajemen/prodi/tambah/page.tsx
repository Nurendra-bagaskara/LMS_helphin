'use client';
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function BuatAkunProdi() {
    const [namaProdi, setNamaProdi] = useState("");
    const [organisasi, setOrganisasi] = useState("");
    const [fakultasId, setFakultasId] = useState("");
    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [listFakultas, setListFakultas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchFakultas = async () => {
            try {
                const token = localStorage.getItem("accessToken");
                if (!token) return;
                const res = await fetch("http://localhost:8000/api/fakultas", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (data.success) {
                    setListFakultas(data.data);
                }
            } catch (e) {
                console.error("Gagal load fakultas", e);
            }
        };
        fetchFakultas();
    }, []);

    const handleSimpan = async () => {
        if (!namaProdi || !fakultasId) {
            alert("Harap isi fakultas dan nama prodi!");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                alert("Anda belum login!");
                router.push("/login");
                return;
            }

            const res = await fetch("http://localhost:8000/api/prodi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: namaProdi,
                    description: organisasi,
                    fakultasId
                })
            });

            const data = await res.json();
            if (data.success) {
                alert("Data Prodi Berhasil Disimpan!");
                router.push("/manajemen/prodi");
            } else {
                alert(`Gagal: ${data.message || "Terjadi kesalahan"}`);
            }
        } catch (e) {
            console.error("Gagal menyimpan", e);
            alert("Terjadi kesalahan sistem saat menyimpan data.");
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

            <div className="mb-10">
                <Image src="/images/helPhin 2.png" alt="Logo Helphin" width={150} height={50} priority />
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-[32px] font-semibold leading-[32px] text-[#1D1D1D]">
                    Buat Akun Prodi
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Buatkan Akun Prodi</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[606px] p-[18px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl"
                style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)" }}>

                <h3 className="w-full max-w-[1019px] text-[20px] font-semibold leading-[32px] text-black border-b border-gray-100 pb-2 self-center">
                    Data Prodi
                </h3>

                <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full max-w-[1019px]">
                    <div className="flex flex-col gap-2">
                        <label className="text-gray-700 font-medium">Nama Universitas</label>
                        <select
                            value={selectedUniversity}
                            onChange={(e) => {
                                setSelectedUniversity(e.target.value);
                                setFakultasId("");
                            }}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 outline-none focus:border-[#068DFF]"
                        >
                            <option value="">Pilih Universitas</option>
                            {Array.from(new Set(listFakultas.map((f: any) => f.universityName || "Telkom University"))).map((uni, idx) => (
                                <option key={idx} value={uni as string}>{uni as string}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-700 font-medium">Fakultas</label>
                        <select
                            value={fakultasId}
                            onChange={(e) => setFakultasId(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 outline-none focus:border-[#068DFF]"
                        >
                            <option value="">Pilih Fakultas</option>
                            {listFakultas
                                .filter((f: any) => selectedUniversity ? (f.universityName || "Telkom University") === selectedUniversity : true)
                                .map((f: any) => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-700 font-medium">Program Studi</label>
                        <input
                            type="text"
                            placeholder="Masukkan nama prodi"
                            value={namaProdi}
                            onChange={(e) => setNamaProdi(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 outline-none focus:border-[#068DFF]"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-700 font-medium">Nama Organisasi Himpunan</label>
                        <input
                            type="text"
                            placeholder="Masukkan nama organisasi (opsional)"
                            value={organisasi}
                            onChange={(e) => setOrganisasi(e.target.value)}
                            className="px-4 py-3 bg-white border border-gray-200 rounded-lg text-gray-800 outline-none focus:border-[#068DFF]"
                        />
                    </div>
                </div>

                <div className="w-[1019px] flex justify-end mt-4">
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
