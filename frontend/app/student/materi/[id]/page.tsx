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
  Info
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

export default function StudentMaterialDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/materials/${id}`, {
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
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-bold">Membuka materi...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 text-center max-w-md">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Oops! Ada Masalah</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{error || "Materi tidak ditemukan"}</p>
          <button 
            onClick={() => router.back()}
            className="w-full py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
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
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${inter.className} pb-10 flex flex-col transition-colors duration-300`}>
      {/* ── BREADCRUMB & HEADER ── */}
      <header className="px-6 py-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-bold text-slate-400 tracking-wider uppercase">
          <Link href="/student/mata-kuliah" className="hover:text-blue-500 transition-colors">Mata Kuliah</Link>
          <ChevronRight size={14} />
          <Link href={`/student/mata-kuliah/${material.mataKuliahId}`} className="hover:text-blue-500 transition-colors">{material.mataKuliahName}</Link>
          <ChevronRight size={14} />
          <span className="text-slate-600">Detail Materi</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-500 transition-all shadow-blue-100/20"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                E-Materi
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              {material.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a 
              href={`${getFileUrl(material.fileUrl)}?download=true`}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/30 hover:bg-blue-600 hover:-translate-y-0.5 transition-all"
            >
              <Download size={18} />
              Download Materi
            </a>
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA ── */}
      <main className="px-6 flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Main Content Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* File Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-black/50 overflow-hidden relative group">
            <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-500">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{material.fileType?.toUpperCase()} Document</div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{material.title.substring(0, 30)}...</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
  
              {isPDF ? (
                <iframe 
                  src={`${getFileUrl(material.fileUrl)}#toolbar=0`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : material.fileType?.match(/(jpg|jpeg|png|webp|gif)/i) ? (
                <div className="p-10 w-full h-full flex items-center justify-center">
                  <img src={getFileUrl(material.fileUrl)} alt="Preview" className="max-w-full max-h-full rounded-xl shadow-xl border border-slate-200" />
                </div>
              ) : material.fileType?.match(/(pptx|docx|xlsx|ppt|doc|xls)/i) ? (
                <div className="w-full h-full bg-white relative">
                  {/* The Viewer - Works on Production/Live URL */}
                  <iframe 
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(getFileUrl(material.fileUrl).replace('localhost:8000', 'YOUR_PUBLIC_TUNNEL_URL'))}`} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0"
                    title="Office Online Viewer"
                    className="border-none"
                  >
                    Office document viewer.
                  </iframe>
                  
                  {/* Local Testing Overlay - Helpful for Developer */}
                  {getFileUrl(material.fileUrl).includes('localhost') && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-12 text-center">
                      <div className="max-w-md">
                        <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse shadow-lg shadow-orange-200/50">
                           <FileText size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">Mode Testing Lokal</h3>
                        <p className="text-slate-500 font-semibold mb-8 leading-relaxed">
                          Untuk menampilkan file Office (<span className="text-blue-500 font-bold">{material.fileType?.toUpperCase()}</span>) secara otomatis, browser memerlukan layanan online (Microsoft/Google).
                        </p>
                        
                        <div className="space-y-4">
                          <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 text-left">
                            <p className="text-xs font-black text-blue-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <Info size={14} /> Solusi 1: Tes dengan PDF
                            </p>
                            <p className="text-xs font-bold text-blue-600 leading-relaxed">Format PDF dan Gambar tetap tampil otomatis meski di localhost.</p>
                          </div>
                          
                          <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100 text-left">
                            <p className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                              <ExternalLink size={14} /> Solusi 2: Gunakan Tunneling
                            </p>
                            <p className="text-xs font-bold text-emerald-600 leading-relaxed">Gunakan tool seperti <span className="font-black underline">ngrok</span> agar localhost Anda bisa diakses online, maka pratinjau ini akan muncul sempurna.</p>
                          </div>
                        </div>

                        <a 
                          href={`${getFileUrl(material.fileUrl)}?download=true`}
                          className="mt-10 inline-flex items-center gap-3 px-10 py-5 bg-slate-800 text-white rounded-[22px] font-black text-sm hover:bg-slate-700 transition-all shadow-xl shadow-slate-300"
                        >
                          <Download size={20} />
                          Download Untuk Baca Offline
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-20 w-full">
                  <div className="w-24 h-24 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-lg">
                    <FileText size={48} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">File {material.fileType?.toUpperCase()}</h3>
                  <p className="text-slate-500 max-w-sm mx-auto font-semibold mb-10 leading-relaxed">File ini dapat langsung Anda unduh untuk dipelajari lebih lanjut menggunakan aplikasi di perangkat Anda.</p>
                  
                  <a 
                    href={`${getFileUrl(material.fileUrl)}?download=true`}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-blue-500 text-white rounded-[20px] font-black text-sm shadow-xl shadow-blue-500/30 hover:bg-blue-600 hover:-translate-y-1 transition-all"
                  >
                    <Download size={20} />
                    Download File {material.fileType?.toUpperCase()}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-10 shadow-lg shadow-slate-200/20 dark:shadow-black/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Keterangan Materi</h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {material.description || "Tidak ada deskripsi tambahan untuk materi ini."}
            </div>
          </div>
        </div>

        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Metadata Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/30 dark:shadow-black/50 sticky top-8">
            <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2">
              <Info size={20} className="text-blue-500" />
              Informasi Materi
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Tahun Ajaran</div>
                  <div className="text-base font-black text-slate-700 dark:text-slate-200">{material.tahunAjaran}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-800/50">
                  <User size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Pengunggah</div>
                  <div className="text-base font-black text-slate-700 dark:text-slate-200">Dosen Pengampu</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800/50">
                  <BookOpen size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Mata Kuliah</div>
                  <div className="text-base font-black text-slate-700 dark:text-slate-200">{material.mataKuliahName}</div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-800/50">
                  <Clock size={22} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Tgl Diunggah</div>
                  <div className="text-base font-black text-slate-700 dark:text-slate-200">
                    {new Date(material.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50">
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
