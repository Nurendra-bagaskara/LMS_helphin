"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { 
  ArrowLeft, 
  Download, 
  Calendar, 
  User, 
  BookOpen, 
  FileText, 
  ChevronRight,
  Clock,
  Info,
  Archive,
  Edit,
  ShieldCheck
} from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

interface BankSoalDetail {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  tahunAjaran: string;
  mataKuliahId: string;
  mataKuliahName: string;
  prodiName: string;
  uploaderName: string;
  createdAt: string;
}

export default function AdminBankSoalDetail() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const soalId = params?.soalId as string;

  const [item, setItem] = useState<BankSoalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBankSoal();
  }, [soalId]);

  const fetchBankSoal = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/bank-soal/${soalId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setItem(data.data);
      } else {
        setError(data.message || "Gagal mengambil data bank soal");
      }
    } catch (e) {
      console.error("Failed to fetch bank soal", e);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const getFileUrl = (path: string) => {
    if (!path) return "";
    return `http://localhost:8000${path}`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-[#F8FBFF] dark:bg-slate-950 flex items-center justify-center ${inter.className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold tracking-wide">Membuka Bank Soal...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={`min-h-screen bg-[#F8FBFF] dark:bg-slate-950 flex items-center justify-center ${inter.className}`}>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 text-center max-w-md mx-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight uppercase">Data Tidak Ditemukan</h2>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-8 font-medium leading-relaxed">{error || "Bank soal tidak ditemukan"}</p>
          <button 
            onClick={() => router.back()}
            className="w-full py-4 bg-slate-800 dark:bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const isPDF = item.fileType?.toLowerCase() === "pdf";

  return (
    <div className={`min-h-screen bg-[#F8FBFF] dark:bg-slate-950 ${inter.className} pb-10 flex flex-col`}>
      {/* ── BREADCRUMB & HEADER ── */}
      <header className="px-6 py-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-6 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">
          <Link href="/admin/mata-kuliah" className="hover:text-blue-600 transition-colors">Manajemen MK</Link>
          <ChevronRight size={12} className="opacity-50" />
          <Link href={`/admin/mata-kuliah/${courseId}`} className="hover:text-blue-600 transition-colors">{item.mataKuliahName}</Link>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md">Arsip Bank Soal</span>
        </div>
 
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 hover:text-blue-600 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md dark:shadow-none shadow-blue-200/50">
                <Archive size={10} strokeWidth={4} />
                Admin View / Bank Soal
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-1">
              {item.title}
            </h1>
          </div>
 
          <div className="flex items-center gap-3 flex-wrap">
            <Link 
              href={`/admin/mata-kuliah/${courseId}/bank-soal/edit/${soalId}`}
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-[20px] font-black text-sm shadow-sm dark:shadow-none hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 transition-all"
            >
              <Edit size={18} />
              Edit Bank Soal
            </Link>
            <a 
              href={`${getFileUrl(item.fileUrl)}?download=true`}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-[20px] font-black text-sm shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all"
            >
              <Download size={18} strokeWidth={3} />
              Unduh Soal
            </a>
          </div>
        </div>
      </header>
 
      {/* ── CONTENT AREA ── */}
      <main className="px-6 flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 overflow-hidden relative group p-2">
            <div className="bg-slate-50/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-10 py-5 flex items-center justify-between rounded-t-[36px]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 shadow-sm dark:shadow-none">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-80">{item.fileType?.toUpperCase()} Document</div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{item.title.substring(0, 40)}...</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[650px] bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 rounded-b-[36px] overflow-hidden">
              {isPDF ? (
                <iframe 
                  src={`${getFileUrl(item.fileUrl)}#toolbar=0`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : item.fileType?.match(/(jpg|jpeg|png|webp|gif)/i) ? (
                <div className="p-12 w-full h-full flex items-center justify-center">
                  <img src={getFileUrl(item.fileUrl)} alt="Preview" className="max-w-full max-h-full rounded-[32px] shadow-2xl border border-white" />
                </div>
              ) : (
                <div className="text-center p-24 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-32 h-32 bg-white dark:bg-slate-900 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-2xl border border-blue-50">
                    <FileText size={56} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter uppercase">PRATINJAU TIDAK TERSEDIA</h3>
                  <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-bold mb-12 leading-relaxed">Format file ini (<span className="text-blue-600">{item.fileType?.toUpperCase()}</span>) belum didukung pratinjau browser, silakan unduh untuk mengecek isi soal.</p>
                  
                  <a 
                    href={`${getFileUrl(item.fileUrl)}?download=true`}
                    className="inline-flex items-center gap-4 px-12 py-5 bg-blue-600 text-white rounded-[28px] font-black text-sm shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-2 transition-all"
                  >
                    <Download size={24} />
                    UNDUH FILE BANK SOAL
                  </a>
                </div>
              )}
            </div>
          </div>
 
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-12 shadow-2xl shadow-slate-200/20">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2.5 h-10 bg-blue-600 rounded-full" />
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter uppercase">Keterangan Bank Soal</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-lg">
              {item.description || "Tidak ada deskripsi tambahan untuk bank soal ini. Materi bank soal siap digunakan untuk keperluan akademik."}
            </div>
          </div>
        </div>
 
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/40 sticky top-10 flex flex-col">
             <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-10 flex items-center gap-3 relative z-10 uppercase tracking-tighter">
              <Info size={24} className="text-blue-600" />
              Informasi Pengarsipan
            </h3>
 
            <div className="space-y-8 relative z-10">
              {[
                { icon: <Calendar />, label: "Tahun Ajaran", value: item.tahunAjaran, color: "blue" },
                { icon: <User />, label: "Pengunggah", value: item.uploaderName || "Dosen Pengampu", color: "blue" },
                { icon: <BookOpen />, label: "Mata Kuliah", value: item.mataKuliahName, color: "blue" },
                { icon: <Clock />, label: "Tanggal Dibuat", value: new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), color: "blue" }
              ].map((m, idx) => (
                <div key={idx} className="flex items-start gap-5 p-4 rounded-[28px] hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 transition-colors group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 transition-transform">
                    {React.cloneElement(m.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 opacity-70">{m.label}</div>
                    <div className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
 
            <div className="mt-12 pt-10 border-t border-slate-50 dark:border-slate-800/50 text-center">
               <button 
                 onClick={() => router.back()}
                 className="w-full py-5 bg-slate-100 dark:bg-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-[28px] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all"
               >
                 Tutup Arkiv
               </button>
            </div>
          </div>
        </div>
      </main>
 
      <div className="mt-auto px-6">
        <FooterDashboard />
      </div>
    </div>
  );
}
