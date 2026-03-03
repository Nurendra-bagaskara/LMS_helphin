"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FooterDashboard from "./footer_dashboard";

interface MataKuliah {
    id: string;
    name: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [userName, setUserName] = useState("User");
    const [prodiName, setProdiName] = useState("");
    const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);

    useEffect(() => {
        // Get user info from localStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserName(user.name || "User");
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }

        // Fetch prodi name and mata kuliah
        const token = localStorage.getItem("accessToken");
        if (!token) return;

        // Fetch user's prodi info
        const fetchProdi = async () => {
            try {
                const userStr = localStorage.getItem("user");
                if (!userStr) return;
                const user = JSON.parse(userStr);
                if (user.prodiId) {
                    const res = await fetch(`http://localhost:8000/api/prodi/${user.prodiId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const data = await res.json();
                    if (data.success) {
                        setProdiName(data.data.name || "");
                    }
                }
            } catch (e) {
                console.error("Failed to fetch prodi", e);
            }
        };

        // Fetch mata kuliah list
        const fetchMataKuliah = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/mata-kuliah", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (data.success && Array.isArray(data.data)) {
                    setMataKuliahList(data.data.slice(0, 4));
                }
            } catch (e) {
                console.error("Failed to fetch mata kuliah", e);
            }
        };

        fetchProdi();
        fetchMataKuliah();
    }, []);

    // Display first name only for greeting
    const firstName = userName.split(" ")[0];

    return (
        <div className="flex flex-col gap-6 mt-2">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0055FF] via-[#068DFF] to-[#07A3F9] text-white shadow-lg min-h-[180px] flex">
                {/* Text content */}
                <div className="flex flex-col justify-center pl-8 py-6 z-10 flex-1">
                    <h1 className="font-bold text-3xl mb-1">Hallo, {firstName} 👋</h1>
                    {prodiName && (
                        <p className="text-lg font-medium opacity-95">Prodi {prodiName}</p>
                    )}
                    <p className="text-sm opacity-75 mt-1">by helPhin</p>
                </div>

                {/* Building image */}
                <div className="relative w-[400px] flex-shrink-0">
                    <Image
                        src="/Assets/gedung_kampus_image.png"
                        alt="Gedung Kampus"
                        width={400}
                        height={200}
                        className="object-cover object-center h-full w-full"
                        priority
                    />
                    {/* Gradient overlay for smooth blend */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#068DFF] via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07A3F9] via-transparent to-transparent opacity-60" />
                </div>
            </div>

            {/* Rekomendasi Mata Kuliah */}
            <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Rekomendasi Mata Kuliah</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {mataKuliahList.length > 0 ? (
                        mataKuliahList.map((mk) => (
                            <div
                                key={mk.id}
                                className="group flex items-center gap-3 px-5 py-4 rounded-xl border-2 border-[#B8E986] bg-gradient-to-br from-[#E8F5D6] to-[#F0FADF] hover:from-[#D4ED9F] hover:to-[#E8F5D6] hover:shadow-md transition-all duration-200 cursor-pointer"
                            >
                                <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-white transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="16 18 22 12 16 6" />
                                        <polyline points="8 6 2 12 8 18" />
                                        <line x1="12" y1="2" x2="12" y2="22" opacity="0.3" />
                                    </svg>
                                </div>
                                <span className="font-medium text-gray-800 text-sm leading-tight">{mk.name}</span>
                            </div>
                        ))
                    ) : (
                        // Placeholder cards when no data
                        [1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-3 px-5 py-4 rounded-xl border-2 border-[#B8E986] bg-gradient-to-br from-[#E8F5D6] to-[#F0FADF]"
                            >
                                <div className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center shadow-sm">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="16 18 22 12 16 6" />
                                        <polyline points="8 6 2 12 8 18" />
                                    </svg>
                                </div>
                                <span className="font-medium text-gray-400 text-sm">Belum ada data</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* CTA Banner */}
            <div className="flex items-center justify-between px-8 py-6 rounded-2xl bg-[#E3F0FF] mt-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Mau bikin matkul yang lainnya?</h3>
                    <p className="text-sm text-gray-500 mt-1">Langsung buat sekarang ya...</p>
                </div>
                <button
                    onClick={() => router.push("/manajemen/matkul/tambah")}
                    className="px-6 py-3 bg-white border-2 border-[#068DFF] text-[#068DFF] rounded-xl font-semibold text-sm hover:bg-[#068DFF] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
                >
                    Buat Matkul Lainnya
                </button>
            </div>

            {/* Footer */}
            <FooterDashboard />
        </div>
    );
}
