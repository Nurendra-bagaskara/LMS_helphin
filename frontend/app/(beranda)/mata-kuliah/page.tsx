"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FooterDashboard from "../dashboard/components/footer_dashboard";
import { BookOpen, Search } from "lucide-react";

interface MataKuliah {
  id: string;
  code: string;
  name: string;
  prodiName: string;
  prodiId: string;
  createdAt: string;
}

export default function MataKuliahPage() {
  const [dataMatkul, setDataMatkul] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchMatkul();
  }, []);

  const fetchMatkul = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      const res = await fetch("http://localhost:8000/api/mata-kuliah", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setDataMatkul(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch mata kuliah", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatkul = dataMatkul.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.prodiName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Palette warna untuk card
  const cardColors = [
    { bg: "from-blue-500 to-blue-700", light: "bg-blue-50", text: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
    { bg: "from-violet-500 to-violet-700", light: "bg-violet-50", text: "text-violet-600", badge: "bg-violet-100 text-violet-700" },
    { bg: "from-emerald-500 to-emerald-700", light: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
    { bg: "from-orange-500 to-orange-600", light: "bg-orange-50", text: "text-orange-600", badge: "bg-orange-100 text-orange-700" },
    { bg: "from-pink-500 to-pink-700", light: "bg-pink-50", text: "text-pink-600", badge: "bg-pink-100 text-pink-700" },
    { bg: "from-teal-500 to-teal-700", light: "bg-teal-50", text: "text-teal-600", badge: "bg-teal-100 text-teal-700" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-jakarta">
      <div className="flex-1 p-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mata Kuliah</h1>
          <p className="text-gray-400 text-sm italic mt-1">
            Pilih mata kuliah untuk melihat materi, video, dan bank soal.
          </p>
        </div>

        {/* Search bar */}
        <div className="mb-6 relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama matkul, kode, atau prodi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-28 bg-gray-200" />
                <div className="p-5 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredMatkul.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMatkul.map((matkul, index) => {
              const color = cardColors[index % cardColors.length];
              return (
                <button
                  key={matkul.id}
                  onClick={() => router.push(`/mata-kuliah/${matkul.id}`)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-left hover:shadow-lg hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {/* Card Header */}
                  <div className={`h-28 bg-gradient-to-br ${color.bg} flex items-center justify-center relative overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/10" />
                    <BookOpen size={40} className="text-white/90 relative z-10" />
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Code badge */}
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono mb-2 ${color.badge}`}>
                      {matkul.code}
                    </span>

                    {/* Name */}
                    <h3 className="font-bold text-gray-900 text-base leading-tight mb-2 group-hover:text-blue-600 transition-colors">
                      {matkul.name}
                    </h3>

                    {/* Prodi */}
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                      {matkul.prodiName}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="px-5 pb-4">
                    <span className={`text-xs font-semibold ${color.text} flex items-center gap-1`}>
                      Lihat Konten →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <BookOpen size={48} className="mb-4 opacity-30" />
            <p className="text-lg font-medium">
              {searchTerm ? "Mata kuliah tidak ditemukan." : "Belum ada mata kuliah."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 text-sm text-blue-500 hover:underline"
              >
                Hapus filter pencarian
              </button>
            )}
          </div>
        )}

        <FooterDashboard />
      </div>
    </div>
  );
}
