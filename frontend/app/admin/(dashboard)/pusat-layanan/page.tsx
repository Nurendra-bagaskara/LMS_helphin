"use client";

import React, { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Bug,
  Lightbulb,
  UserCircle,
  BookOpen,
  FileText,
  Headphones,
  MessageSquare,
  Mail,
  Clock,
  ShieldCheck,
} from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

interface Category {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
}

const categories: Category[] = [
  {
    id: "bug",
    label: "Bug / Error",
    icon: <Bug size={20} />,
    color: "text-red-500",
    bgColor: "bg-red-50 border-red-100 hover:border-red-300",
    description: "Laporkan error atau masalah teknis pada sistem",
  },
  {
    id: "feature",
    label: "Permintaan Fitur",
    icon: <Lightbulb size={20} />,
    color: "text-amber-500",
    bgColor: "bg-amber-50 border-amber-100 hover:border-amber-300",
    description: "Sarankan fitur baru atau perbaikan",
  },
  {
    id: "account",
    label: "Masalah Akun",
    icon: <UserCircle size={20} />,
    color: "text-blue-500",
    bgColor: "bg-blue-50 border-blue-100 hover:border-blue-300",
    description: "Kendala login, password, atau akses",
  },
  {
    id: "content",
    label: "Konten / Materi",
    icon: <BookOpen size={20} />,
    color: "text-green-500",
    bgColor: "bg-green-50 border-green-100 hover:border-green-300",
    description: "Masalah pada materi, video, atau soal",
  },
  {
    id: "other",
    label: "Lainnya",
    icon: <FileText size={20} />,
    color: "text-slate-500 dark:text-slate-400 dark:text-slate-500",
    bgColor: "bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-300",
    description: "Pertanyaan atau kendala lainnya",
  },
];

export default function PusatLayanan() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    category: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse user", e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category) {
      setMessage({ type: "error", text: "Pilih kategori terlebih dahulu" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!formData.subject.trim()) {
      setMessage({ type: "error", text: "Subjek tidak boleh kosong" });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }


    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("accessToken");
      console.log("[PusatLayanan] Sending support ticket...", { category: formData.category, subject: formData.subject });
      
      const res = await fetch("http://localhost:8000/api/support/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject: formData.subject,
          category: formData.category,
          message: formData.message,
        }),
      });

      const data = await res.json();
      console.log("[PusatLayanan] Response:", data);

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setFormData({ category: "", subject: "", message: "" });
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mengirim laporan" });
      }
    } catch (e) {
      console.error("[PusatLayanan] Error:", e);
      setMessage({ type: "error", text: "Terjadi kesalahan jaringan. Silakan coba lagi." });
    } finally {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.category);

  return (
    <div className={`flex flex-col gap-8 p-6 max-w-5xl mx-auto min-h-screen ${inter.className}`}>
      {/* --- HERO HEADER --- */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-[#0055FF] via-[#068DFF] to-[#07A3F9] p-8 md:p-12 text-white shadow-2xl shadow-blue-300/20">
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-28 h-28 md:w-36 md:h-36 rounded-[2.5rem] bg-white/10 dark:bg-slate-900/20 backdrop-blur-xl border-4 border-white/30 flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-105">
              <Headphones size={56} className="text-white/90" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-400 border-4 border-white rounded-2xl flex items-center justify-center shadow-lg dark:shadow-none">
              <MessageSquare size={18} className="text-white" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
              <span className="px-4 py-1.5 bg-white/20 dark:bg-slate-900/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest uppercase border border-white/20">
                Support Center
              </span>
              <span className="px-4 py-1.5 bg-emerald-400/20 backdrop-blur-md rounded-full text-xs font-black tracking-widest uppercase border border-emerald-400/20 text-emerald-100 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Online
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">Pusat Layanan</h1>
            <p className="text-slate-300/80 text-lg font-medium max-w-md">
              Laporkan kendala atau berikan masukan untuk meningkatkan kualitas HelPhin LMS.
            </p>
          </div>
        </div>
      </div>

      {/* --- INFO CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 flex-shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Email Tujuan</p>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-200">Tim Support HelPhin</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 flex-shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Respon Time</p>
            <p className="text-sm font-bold text-gray-700 dark:text-slate-200">1 × 24 Jam Kerja</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-500 flex-shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1">Status</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-500">Sistem Berjalan Normal</p>
          </div>
        </div>
      </div>

      {/* --- FORM SECTION --- */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {message && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800/30"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800/30"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {/* Category Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-xl font-black text-gray-800 dark:text-slate-100">Pilih Kategori</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat.id })}
                className={`text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
                  formData.category === cat.id
                    ? `${cat.bgColor} border-current ring-2 ring-offset-2 dark:ring-offset-slate-900 ring-current scale-[1.02] shadow-md dark:shadow-none`
                    : `bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700`
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={cat.color}>{cat.icon}</span>
                  <span className="text-sm font-black text-gray-800 dark:text-slate-100">{cat.label}</span>
                </div>
                <p className="text-[11px] font-medium text-gray-500 dark:text-slate-400 leading-relaxed">{cat.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-gray-100 dark:border-slate-800 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
            <h2 className="text-xl font-black text-gray-800 dark:text-slate-100">Detail Laporan</h2>
          </div>

          <div className="space-y-6">
            {/* Pengirim (read-only) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest pl-4">Pengirim</label>
                <input
                  type="text"
                  value={user?.name || "Loading..."}
                  disabled
                  className="w-full px-4 py-3.5 bg-gray-100 dark:bg-slate-800/50 border border-transparent rounded-2xl text-sm font-bold text-gray-400 dark:text-slate-500 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest pl-4">Email Pengirim</label>
                <input
                  type="email"
                  value={user?.email || "Loading..."}
                  disabled
                  className="w-full px-4 py-3.5 bg-gray-100 dark:bg-slate-800/50 border border-transparent rounded-2xl text-sm font-bold text-gray-400 dark:text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-4">Subjek</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Contoh: Tidak bisa mengakses halaman quiz"
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-600 outline-none transition-all text-sm font-bold text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-4">Pesan / Deskripsi Kendala</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Jelaskan kendala yang kamu alami secara detail. Semakin lengkap informasinya, semakin cepat kami dapat membantu menyelesaikannya..."
                rows={6}
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 dark:focus:border-blue-600 outline-none transition-all text-sm font-bold text-gray-700 dark:text-slate-200 placeholder:text-gray-400 dark:placeholder:text-slate-500 resize-none leading-relaxed"
              />

            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-[#0055FF] to-[#068DFF] text-white py-4 rounded-2xl font-black text-sm tracking-widest uppercase shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Kirim Laporan
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ category: "", subject: "", message: "" });
              setMessage(null);
            }}
            className="px-8 py-4 bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 dark:text-slate-400 dark:text-slate-500 border border-gray-100 dark:border-slate-800 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-gray-50 dark:bg-slate-800 dark:bg-slate-900/50 transition-all active:scale-[0.98]"
          >
            Reset
          </button>
        </div>
      </form>

      <FooterDashboard />
    </div>
  );
}
