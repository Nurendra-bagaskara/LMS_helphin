"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

interface MataKuliah {
  id: string;
  name: string;
  code?: string;
  sks?: number;
  semester?: number;
  description?: string;
}

export default function MataKuliahPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [prodiName, setProdiName] = useState("");
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "User");
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

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

    const fetchMataKuliah = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/mata-kuliah", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setMataKuliahList(data.data);
        }
      } catch (e) {
        console.error("Failed to fetch mata kuliah", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProdi();
    fetchMataKuliah();
  }, []);

  const firstName = userName.split(" ")[0];

  const cardIcons = [
    <svg key="book" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>,
    <svg key="code" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>,
    <svg key="flask" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M9 3v7L5 20h14L15 10V3" />
    </svg>,
    <svg key="chart" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>,
  ];

  const cardGradients = [
    "from-[#0055FF] to-[#068DFF]",
    "from-[#7C3AED] to-[#A855F7]",
    "from-[#059669] to-[#10B981]",
    "from-[#D97706] to-[#F59E0B]",
    "from-[#DC2626] to-[#F87171]",
    "from-[#0891B2] to-[#22D3EE]",
  ];

  return (
    <div className="flex flex-col gap-6 mt-2">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0055FF] via-[#068DFF] to-[#07A3F9] text-white shadow-lg min-h-[180px] flex">
        <div className="flex flex-col justify-center pl-8 py-6 z-10 flex-1">
          <h1 className="font-bold text-3xl mb-1">Hallo, {firstName} 👋</h1>
          {prodiName && (
            <p className="text-lg font-medium opacity-95">{prodiName}</p>
          )}
          <p className="text-sm opacity-75 mt-1">by helPhin</p>
        </div>
        <div className="relative w-[400px] flex-shrink-0">
          <Image
            src="/Assets/gedung_kampus_image.png"
            alt="Gedung Kampus"
            width={400}
            height={200}
            className="object-cover object-center h-full w-full"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#068DFF] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07A3F9] via-transparent to-transparent opacity-60" />
        </div>
      </div>

      {/* Mata Kuliah Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Mata Kuliah</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[140px] rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : mataKuliahList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mataKuliahList.map((mk, index) => (
              <button
                key={mk.id}
                onClick={() => router.push(`/superadmin/mata-kuliah/${mk.id}`)}
                className={`
                                    group relative overflow-hidden flex flex-col justify-between
                                    p-5 rounded-2xl text-white text-left
                                    bg-gradient-to-br ${cardGradients[index % cardGradients.length]}
                                    shadow-md hover:shadow-xl
                                    transition-all duration-300 hover:-translate-y-1
                                    min-h-[140px] cursor-pointer
                                `}
              >
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                <div className="absolute bottom-0 right-4 w-16 h-16 rounded-full bg-white/10 translate-y-6" />

                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-white/30 transition-colors z-10">
                  {cardIcons[index % cardIcons.length]}
                </div>

                <div className="z-10">
                  <p className="font-semibold text-base leading-snug line-clamp-2">{mk.name}</p>
                  {mk.code && (
                    <p className="text-xs text-white/70 mt-1">{mk.code}</p>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-[#E3F0FF] rounded-2xl flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#068DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className="text-gray-700 font-semibold text-base mb-1">Belum ada mata kuliah</h3>
            <p className="text-gray-400 text-sm mb-6">Tambahkan mata kuliah pertama kamu</p>
            <button
              onClick={() => router.push("/superadmin/manajemen/matkul/tambah")}
              className="px-6 py-3 bg-[#068DFF] text-white rounded-xl font-semibold text-sm hover:bg-[#0055FF] transition-colors shadow-md"
            >
              Tambah Mata Kuliah
            </button>
          </div>
        )}
      </div>

      {/* CTA Banner */}
      {mataKuliahList.length > 0 && (
        <div className="flex items-center justify-between px-8 py-6 rounded-2xl bg-[#E3F0FF] mt-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Mau bikin matkul yang lainnya?</h3>
            <p className="text-sm text-gray-500 mt-1">Langsung buat sekarang ya...</p>
          </div>
          <button
            onClick={() => router.push("/superadmin/manajemen/matkul/tambah")}
            className="px-6 py-3 bg-white border-2 border-[#068DFF] text-[#068DFF] rounded-xl font-semibold text-sm hover:bg-[#068DFF] hover:text-white transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Buat Matkul Lainnya
          </button>
        </div>
      )}

      <FooterDashboard />
    </div>
  );
}