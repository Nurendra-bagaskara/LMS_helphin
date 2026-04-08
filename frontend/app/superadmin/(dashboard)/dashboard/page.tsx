"use client";

import React, { useState, useEffect } from "react";
import { Users, BookOpen, GraduationCap, Activity, ShieldCheck } from "lucide-react";

const mainStats = [
  { label: "Total Users", value: "1,248", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "Total Prodi", value: "24", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
  { label: "Total Courses", value: "156", icon: BookOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
  { label: "System Health", value: "99.9%", icon: ShieldCheck, color: "text-amber-600", bg: "bg-amber-50" },
];

export default function SuperAdminDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        setUser({ name: "Superadmin" });
      }
    }
  }, []);

  return (
    <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Superadmin Overview</h1>
        <p className="text-gray-500 font-medium tracking-wide">Selamat datang kembali, {user?.name}. Berikut adalah ringkasan sistem Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, i) => (
          <div key={i} className="bg-white p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-5">
              <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              <span className="text-[10px] bg-gray-50 text-gray-400 font-bold px-2 py-1 rounded-full">LIVE</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-800">Aktivitas Sistem Terkini</h2>
              <button className="text-sm font-bold text-blue-600 hover:underline">Lihat Semua</button>
           </div>
           <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                     <Activity size={18} />
                  </div>
                  <div className="flex-1">
                     <p className="text-sm font-bold text-gray-800">User <span className="text-blue-600">Admin Informatika</span> baru saja mengupload materi baru.</p>
                     <p className="text-[11px] text-gray-400 font-medium">2 menit yang lalu</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-6">
           <h2 className="text-xl font-black text-gray-800">Cepat Akses</h2>
           <div className="grid grid-cols-1 gap-3">
              {["Manajemen Role", "Tambah User Baru", "Setting API", "Database Backup"].map((item, i) => (
                <button key={i} className="w-full text-left p-4 rounded-2xl bg-gray-50 text-gray-700 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">
                  {item}
                </button>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

