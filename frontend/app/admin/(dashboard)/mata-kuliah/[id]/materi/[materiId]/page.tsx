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
  ExternalLink,
  ChevronRight,
  Clock,
  Info,
  Edit
} from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

interface MaterialDetail {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  tahunAjaran: string;
  mataKuliahId: string;
  mataKuliahName: string;
  prodiName: string;
  uploadedBy: string;
  createdAt: string;
}

export default function AdminMaterialDetail() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const materiId = params?.materiId as string;

  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterial();
  }, [materiId]);

  const fetchMaterial = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/materials/${materiId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setMaterial(data.data);
      } else {
        setError(data.message || "Gagal mengambil data materi");
      }
    } catch (e) {
      console.error("Failed to fetch material", e);
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
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold tracking-tight">Membuka materi...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className={`min-h-screen bg-[#F8FBFF] dark:bg-slate-950 flex items-center justify-center ${inter.className}`}>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight uppercase">Oops! Ada Masalah</h2>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-8 font-medium">{error || "Materi tidak ditemukan"}</p>
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

  const isPDF = material.fileType?.toLowerCase() === "pdf";

  return (
    <div className={`min-h-screen bg-[#F8FBFF] dark:bg-slate-950 ${inter.className} pb-10 flex flex-col`}>
      {/* ── BREADCRUMB & HEADER ── */}
      <header className="px-6 py-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-6 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">
          <Link href="/admin/mata-kuliah" className="hover:text-blue-500 transition-colors">Manajemen MK</Link>
          <ChevronRight size={14} className="opacity-50" />
          <Link href={`/admin/mata-kuliah/${courseId}`} className="hover:text-blue-500 transition-colors">{material.mataKuliahName}</Link>
          <ChevronRight size={14} className="opacity-50" />
          <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">Detail Materi</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 hover:text-blue-500 transition-all shadow-blue-100/20"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-blue-200">
                E-Materi / Admin View
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-tight">
              {material.title}
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link 
              href={`/admin/mata-kuliah/${courseId}/materi/edit/${materiId}`}
              className="flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-sm shadow-sm dark:shadow-none hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 transition-all"
            >
              <Edit size={18} />
              Edit Materi
            </Link>
            <a 
              href={`${getFileUrl(material.fileUrl)}?download=true`}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg dark:shadow-none shadow-blue-500/30 hover:bg-blue-600 hover:-translate-y-0.5 transition-all"
            >
              <Download size={18} />
              Download Materi
            </a>
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA ── */}
      <main className="px-6 flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 overflow-hidden relative group p-2">
            <div className="bg-slate-50/50 border-b border-slate-100 dark:border-slate-800 px-8 py-4 flex items-center justify-between rounded-t-[36px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-500 shadow-sm dark:shadow-none">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{material.fileType?.toUpperCase()} Document</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{material.title.substring(0, 40)}{material.title.length > 40 ? '...' : ''}</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[650px] bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 rounded-b-[36px] overflow-hidden">
              {isPDF ? (
                <iframe 
                  src={`${getFileUrl(material.fileUrl)}#toolbar=0`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : material.fileType?.match(/(jpg|jpeg|png|webp|gif)/i) ? (
                <div className="p-10 w-full h-full flex items-center justify-center">
                  <img src={getFileUrl(material.fileUrl)} alt="Preview" className="max-w-full max-h-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700" />
                </div>
              ) : (
                <div className="text-center p-20 w-full h-full flex flex-col items-center justify-center">
                  <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-[32px] flex items-center justify-center mb-6 text-blue-500 shadow-xl shadow-blue-100/50 border border-blue-50">
                    <FileText size={56} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4 tracking-tighter uppercase">Preview Tidak Tersedia</h3>
                  <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 max-w-sm mx-auto font-semibold mb-10 leading-relaxed">Format file ini (<span className="text-blue-500">{material.fileType?.toUpperCase()}</span>) tidak didukung untuk pratinjau langsung di browser, namun dapat diunduh di bawah ini.</p>
                  
                  <a 
                    href={`${getFileUrl(material.fileUrl)}?download=true`}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-blue-500 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-500/30 hover:bg-blue-600 hover:-translate-y-1 transition-all"
                  >
                    <Download size={20} />
                    Download File {material.fileType?.toUpperCase()}
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-10 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2.5 h-10 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Detail Keterangan</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-lg">
              {material.description || "Tidak ada deskripsi tambahan untuk materi ini."}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/30 sticky top-10 flex flex-col">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-10 flex items-center gap-2">
              <Info size={20} className="text-blue-500" />
              META INFORMASI
            </h3>

            <div className="space-y-8">
              {[
                { icon: <Calendar />, label: "Tahun Ajaran", value: material.tahunAjaran, color: "blue" },
                { icon: <User />, label: "Status", value: "Terpublikasi", color: "orange" },
                { icon: <BookOpen />, label: "Mata Kuliah", value: material.mataKuliahName, color: "purple" },
                { icon: <Clock />, label: "Terakhir Diupdate", value: new Date(material.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), color: "emerald" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5 p-2 hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 transition-all rounded-3xl group">
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-500 flex items-center justify-center shrink-0 shadow-sm dark:shadow-none border border-${item.color}-100/50 group-hover:scale-110 transition-transform`}>
                    {React.cloneElement(item.icon as React.ReactElement, { size: 24 })}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{item.label}</div>
                    <div className="text-base font-black text-slate-700 dark:text-slate-200 leading-tight">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-slate-50 dark:border-slate-800/50 space-y-4">
               <button 
                 onClick={() => router.back()}
                 className="w-full py-5 bg-slate-100 dark:bg-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-[24px] font-black text-sm uppercase tracking-wider hover:bg-slate-200 transition-all"
               >
                 Tutup Halaman
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
