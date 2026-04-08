"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, BookOpen, ChevronRight, MoreVertical, Edit2, Trash2, Plus } from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

interface MataKuliah {
  id: string;
  name: string;
  coverUrl?: string | null;
  materialCount?: number;
  prodiId: string;
}

export default function MataKuliahAdminPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [prodiName, setProdiName] = useState("");
  const [mataKuliahList, setMataKuliahList] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const closeDropdown = () => setActiveDropdown(null);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, []);

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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Apakah Anda yakin ingin menghapus mata kuliah ini?")) return;
    
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMataKuliahList((prev) => prev.filter((mk) => mk.id !== id));
      } else {
        alert(`Gagal menghapus: ${data.message}`);
      }
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Terjadi kesalahan sistem");
    }
  };

  const firstName = userName.split(" ")[0];

  const filteredMatkul = mataKuliahList.filter((mk) =>
    mk.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6 mt-2 max-w-[1600px] mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0055FF] via-[#068DFF] to-[#07A3F9] text-white shadow-xl min-h-[200px] flex group">
        <div className="flex flex-col justify-center pl-10 py-8 z-10 flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 dark:bg-slate-900/20 backdrop-blur-md rounded-full w-fit mb-4 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin Portal</span>
          </div>
          <h1 className="font-black text-4xl mb-2 tracking-tight">Hallo, {firstName} 👋</h1>
          {prodiName && (
            <p className="text-xl font-semibold opacity-90">{prodiName}</p>
          )}
          <p className="text-sm opacity-70 mt-2 font-medium">Panel Manajemen Mata Kuliah</p>
        </div>
        
        {/* Background Image/Graphics */}
        <div 
          className="absolute right-0 top-0 h-full w-[45%] z-5 overflow-hidden hidden md:block"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 100%)'
          }}
        >
             <Image
                src="/Assets/gedung_kampus_image.png"
                alt="Gedung"
                fill
                className="object-cover object-left translate-x-4 group-hover:scale-105 transition-transform duration-700"
                priority
            />
        </div>
      </div>

      {/* Search Bar Section */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 group-focus-within:text-[#068DFF] transition-all duration-300" />
        </div>
        <input
          type="text"
          placeholder="Cari mata kuliah berdasarkan nama..."
          className="w-full pl-13 pr-4 py-4.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[24px] shadow-sm dark:shadow-none focus:ring-[6px] focus:ring-[#068DFF]/10 focus:border-[#068DFF] outline-none transition-all text-base font-semibold text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300 transition-colors"
          >
            <div className="w-6 h-6 flex items-center justify-center bg-gray-50 dark:bg-slate-800 dark:bg-slate-900/50 rounded-full hover:bg-gray-100">✕</div>
          </button>
        )}
      </div>

      {/* Mata Kuliah Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
            <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-slate-100 tracking-tight">Daftar Mata Kuliah</h2>
                <p className="text-sm text-gray-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium">Kelola materi dan konten pembelajaran</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-2xl hidden md:flex">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{filteredMatkul.length} Total Course</span>
                </div>
                <button 
                  onClick={() => router.push("/admin/mata-kuliah/tambah")}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#0055FF] to-[#068DFF] text-white rounded-2xl font-bold shadow-lg dark:shadow-none shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:block">Tambah Mata Kuliah</span>
                  <span className="block sm:hidden">Tambah</span>
                </button>
            </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[280px] rounded-[32px] bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filteredMatkul.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMatkul.map((mk) => (
              <div
                key={mk.id}
                onClick={() => router.push(`/admin/mata-kuliah/${mk.id}`)}
                className="group bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-sm dark:shadow-none border border-gray-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-blue-200/50 hover:-translate-y-2 transition-all duration-500 text-left flex flex-col relative cursor-pointer"
              >
                {/* 3-dots Menu Button */}
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDropdown(activeDropdown === mk.id ? null : mk.id);
                    }}
                    className="w-10 h-10 rounded-full bg-white/20 dark:bg-slate-900/20 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/40 dark:bg-slate-900/40 transition-colors shadow-sm dark:shadow-none"
                  >
                    <MoreVertical className="w-5 h-5 text-white drop-shadow-md dark:shadow-none" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === mk.id && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden z-30 transform origin-top-right transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/mata-kuliah/edit/${mk.id}`);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:bg-slate-800 dark:bg-slate-900/50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                        Edit Mata Kuliah
                      </button>
                      <button
                        onClick={(e) => handleDelete(mk.id, e)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50 dark:border-slate-800/50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Hapus Mata Kuliah
                      </button>
                    </div>
                  )}
                </div>

                {/* Cover Image Area */}
                <div className="relative w-full h-[180px] bg-gradient-to-br from-[#0055FF] to-[#068DFF] overflow-hidden flex-shrink-0">
                  {mk.coverUrl ? (
                    <img
                      src={mk.coverUrl}
                      alt={mk.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-20 h-20 bg-white/20 dark:bg-slate-900/20 backdrop-blur-md rounded-[24px] flex items-center justify-center mb-0 group-hover:rotate-12 transition-transform duration-500">
                             <BookOpen size={40} className="text-white" />
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 dark:bg-slate-900/10 rounded-full -translate-y-16 translate-x-16" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 dark:bg-slate-900/5 rounded-full translate-y-12 -translate-x-12" />
                    </div>
                  )}
                  
                  {/* Overlay for better text readability if it was on top, but now it's below */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-colors" />
                </div>

                {/* Content Area */}
                <div className="p-6 flex flex-col flex-1 bg-white dark:bg-slate-900 relative">
                  <h3 className="font-extrabold text-lg text-gray-900 dark:text-slate-100 leading-tight line-clamp-2 mb-4 group-hover:text-[#0055FF] transition-colors duration-300 min-h-[3.5rem]">
                    {mk.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-50 dark:border-slate-800/50 pt-5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Total Materi</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{mk.materialCount || 0} Materi</span>
                        </div>
                    </div>
                    
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-[#0055FF] group-hover:rotate-45 transition-all duration-500">
                      <ChevronRight size={20} className="text-[#0055FF] group-hover:text-white transition-colors -rotate-0 group-hover:-rotate-45" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none mx-2">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mb-6 group hover:scale-110 transition-transform duration-500">
               <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-[24px] shadow-sm dark:shadow-none flex items-center justify-center">
                  <Search size={32} className="text-blue-500" />
               </div>
            </div>
            <h3 className="text-gray-900 dark:text-slate-100 font-black text-2xl mb-2 tracking-tight">Mata kuliah tidak ditemukan</h3>
            <p className="text-gray-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 font-medium max-w-xs mx-auto">
                Tidak ada hasil untuk kata kunci <span className="text-blue-600 font-bold">"{searchQuery}"</span>. Coba kata kunci lain atau pastikan penulisan benar.
            </p>
            <button 
              onClick={() => setSearchQuery("")}
              className="mt-8 px-8 py-3 bg-blue-50 text-blue-600 font-black rounded-2xl hover:bg-blue-600 hover:text-white transition-all transform active:scale-95"
            >
              Ulangi Pencarian
            </button>
          </div>
        )}
      </div>

      <FooterDashboard />
      <div className="h-10" />
    </div>
  );
}
