"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import { 
  User, 
  Mail, 
  Hash, 
  Lock, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  ShieldCheck,
  Building2
} from "lucide-react";
import Image from "next/image";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

export default function StudentProfile() {
  const [user, setUser] = useState<any>(null);
  const [prodiName, setProdiName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    nim: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userStr = localStorage.getItem("user");
      
      if (!token || !userStr) return;
      
      const storedUser = JSON.parse(userStr);
      
      // Get latest profile data from backend
      const res = await fetch("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success && data.data) {
        const remoteUser = data.data;
        setUser(remoteUser);
        
        // Sync to localStorage
        localStorage.setItem("user", JSON.stringify(remoteUser));
        
        setFormData({
          name: remoteUser.name || "",
          nim: remoteUser.nim || "",
          newPassword: "",
          confirmPassword: "",
        });

        if (remoteUser.prodiId) {
          const prodiRes = await fetch(`http://localhost:8000/api/prodi/${remoteUser.prodiId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const prodiData = await prodiRes.json();
          if (prodiData.success) {
            setProdiName(prodiData.data.name);
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch user data", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak cocok" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      const body: any = {
        name: formData.name,
        nim: formData.nim,
      };

      if (formData.newPassword) {
        body.password = formData.newPassword;
      }

      const res = await fetch("http://localhost:8000/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
        // Update localStorage
        const updatedUser = { ...user, ...data.data };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
      } else {
        setMessage({ type: "error", text: data.message || "Gagal memperbarui profil" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">Menyiapkan profilmu...</p>
      </div>
    );
  }

  const initials = user?.name 
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "ST";

  return (
    <div className={`flex flex-col gap-8 p-6 max-w-5xl mx-auto min-h-screen ${inter.className}`}>
      {/* --- HERO HEADER --- */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0055FF] to-[#07D1FF] p-8 md:p-12 text-white shadow-2xl shadow-blue-200/50">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] bg-white/20 backdrop-blur-xl border-4 border-white/30 flex items-center justify-center text-4xl md:text-5xl font-black shadow-2xl transition-transform duration-500 group-hover:scale-105">
              {initials}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={20} className="text-white" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest uppercase border border-white/20">
                Student Account
              </span>
              <span className="px-4 py-1.5 bg-green-400/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest uppercase border border-green-400/20 text-green-100 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Verified
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Pengaturan Profil</h1>
            <p className="text-blue-50/80 text-lg font-medium max-w-md">
              Kelola data diri dan keamanan akun helPhin kamu di sini.
            </p>
          </div>
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Informasi Akademik</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Program Studi</p>
                  <p className="text-sm font-bold text-gray-700">{prodiName || "S1 Informatika"}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500 flex-shrink-0">
                  <Hash size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Nomor Induk Mahasiswa</p>
                  <p className="text-sm font-bold text-gray-700">{user?.nim || "Belum diatur"}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-dashed border-gray-100">
              <p className="text-xs text-gray-400 font-medium leading-relaxed italic">
                Data program studi dikunci oleh sistem. Hubungi departemen Akademik jika terdapat ketidaksesuaian data.
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2 space-y-8">
          {message && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-bold">{message.text}</p>
            </div>
          )}

          {/* Personal Data Card */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-200/10 transition-all duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-xl font-black text-gray-800">Data Personal</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">Nama Lengkap</label>
                <div className="group relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: John Doe"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">NIM (Student ID)</label>
                <div className="group relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input 
                    type="text" 
                    value={formData.nim}
                    onChange={(e) => setFormData({...formData, nim: e.target.value})}
                    placeholder="Contoh: 12345678"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">Alamat Email</label>
                <div className="group relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="email" 
                    value={user?.email || ""}
                    disabled
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-sm font-bold text-gray-400 cursor-not-allowed"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded-md">
                    Terkunci
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-orange-200/10 transition-all duration-500">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
              <h2 className="text-xl font-black text-gray-800">Keamanan Akun</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">Password Baru</label>
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={formData.newPassword}
                    onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-4">Konfirmasi Password</label>
                <div className="group relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                  <input 
                    type="password" 
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-orange-500 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-300"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-start gap-3 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
              <AlertCircle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-orange-800 leading-relaxed">
                Biarkan kolom password kosong jika tidak ingin mengubahnya. Gunakan kombinasi minimal 6 karakter.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-blue-600 to-[#0055FF] text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  Simpan Perubahan
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => fetchUserData()}
              className="px-8 py-4 bg-white text-gray-400 border border-gray-100 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      <FooterDashboard />
    </div>
  );
}
