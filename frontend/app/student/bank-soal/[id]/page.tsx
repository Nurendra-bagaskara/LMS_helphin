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
  Archive
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

export default function StudentBankSoalDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<BankSoalDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBankSoal();
  }, [id]);

  const fetchBankSoal = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/bank-soal/${id}`, {
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
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 dark:border-slate-800 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wide">Membuka Bank Soal...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 text-center max-w-md mx-6">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Pencarian Gagal</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">{error || "Bank soal tidak ditemukan"}</p>
          <button 
            onClick={() => router.back()}
            className="w-full py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 shadow-lg dark:shadow-none"
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
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${inter.className} pb-10 flex flex-col transition-colors duration-300`}>
      {/* ── BREADCRUMB & HEADER ── */}
      <header className="px-6 py-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-6 text-[10px] font-black text-slate-400 tracking-widest uppercase">
          <Link href="/student/mata-kuliah" className="hover:text-blue-600 transition-colors">Mata Kuliah</Link>
          <ChevronRight size={12} className="opacity-50" />
          <Link href={`/student/mata-kuliah/${item.mataKuliahId}`} className="hover:text-blue-600 transition-colors">{item.mataKuliahName}</Link>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md">Detail Bank Soal</span>
        </div>
 
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-blue-200/50">
                <Archive size={10} strokeWidth={4} />
                Arsip Bank Soal
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-1">
              {item.title}
            </h1>
          </div>
 
          <div className="flex items-center gap-3">
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
        {/* Main Content Column */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* File Preview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-black/50 overflow-hidden relative group ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-10 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 shadow-sm">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{item.fileType?.toUpperCase()} Document</div>
                  <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-80">Pratinjau Langsung</div>
                </div>
              </div>
            </div>
            
            <div className="relative h-[500px] bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              {isPDF ? (
                <iframe 
                  src={`${getFileUrl(item.fileUrl)}#toolbar=0`} 
                  className="w-full h-full border-none"
                  title="PDF Preview"
                />
              ) : item.fileType?.match(/(jpg|jpeg|png|webp|gif)/i) ? (
                <div className="p-12 w-full h-full flex items-center justify-center">
                  <img src={getFileUrl(item.fileUrl)} alt="Preview" className="max-w-full max-h-full rounded-[32px] shadow-2xl border border-white ring-8 ring-white" />
                </div>
              ) : item.fileType?.match(/(pptx|docx|xlsx|ppt|doc|xls)/i) ? (
                <div className="w-full h-full bg-white relative">
                  <iframe 
                    src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(getFileUrl(item.fileUrl).replace('localhost:8000', 'YOUR_PUBLIC_TUNNEL_URL'))}`} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0"
                    title="Office Online Viewer"
                    className="border-none"
                  >
                    Office document viewer.
                  </iframe>
                  
                  {/* Local Testing Overlay */}
                  {getFileUrl(item.fileUrl).includes('localhost') && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-xl flex items-center justify-center p-16 text-center">
                      <div className="max-w-md">
                        <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100 flex-col gap-1 ring-1 ring-blue-100">
                           <FileText size={40} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter">PRATINJAU OFFICE</h3>
                        <p className="text-slate-500 font-bold mb-8 leading-relaxed">
                          Sistem mendeteksi file <span className="text-blue-600 font-black underline decoration-blue-200">{item.fileType?.toUpperCase()}</span>. Pratinjau otomatis hanya bekerja jika server terhubung ke internet.
                        </p>
                        
                        <div className="grid grid-cols-1 gap-4 mb-10">
                          <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-left">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <ShieldCheck size={14} className="text-emerald-500" /> Informasi Teknis
                            </p>
                            <p className="text-xs font-bold text-slate-600 leading-relaxed italic">Gunakan PDF atau Gambar untuk pratinjau instan di localhost. File Office membutuhkan tunneling seperti ngrok di localhost.</p>
                          </div>
                        </div>
 
                        <a 
                          href={`${getFileUrl(item.fileUrl)}?download=true`}
                          className="flex items-center justify-center gap-3 w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-sm hover:bg-black transition-all shadow-2xl shadow-slate-300"
                        >
                          <Download size={20} />
                          Unduh Untuk Baca Offline
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-24 w-full">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto mb-8 text-blue-600 shadow-2xl ring-1 ring-slate-100">
                    <FileText size={56} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tighter uppercase">FILE {item.fileType?.toUpperCase()}</h3>
                  <p className="text-slate-500 max-w-sm mx-auto font-bold mb-12 leading-relaxed">Format file ini belum didukung pratinjau browser, silakan unduh untuk mempelajarinya.</p>
                  
                  <a 
                    href={`${getFileUrl(item.fileUrl)}?download=true`}
                    className="inline-flex items-center gap-4 px-12 py-5 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-2xl shadow-blue-500/40 hover:bg-blue-700 hover:-translate-y-2 transition-all"
                  >
                    <Download size={24} />
                    UNDUH FILE SEKARANG
                  </a>
                </div>
              )}
            </div>
          </div>
 
          {/* Description Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-12 shadow-2xl shadow-slate-200/20 dark:shadow-black/30 ring-1 ring-slate-100 dark:ring-slate-800">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-2.5 h-10 bg-blue-600 rounded-full" />
              <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter">DESKRIPSI SOAL</h2>
            </div>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 font-bold leading-relaxed text-lg">
              {item.description || "Tidak ada deskripsi tambahan untuk bank soal ini. Silakan unduh atau baca pratinjau di atas."}
            </div>
          </div>
        </div>
 
        {/* Sidebar Info Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/40 dark:shadow-black/50 sticky top-8 flex flex-col overflow-hidden group ring-1 ring-slate-100 dark:ring-slate-800">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 dark:bg-blue-900/30 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
             
             <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-10 flex items-center gap-3 relative z-10 uppercase tracking-tighter">
              <Info size={24} className="text-blue-600" />
              Info Bank Soal
            </h3>
 
            <div className="space-y-8 relative z-10">
              {[
                { icon: <Calendar />, label: "Tahun Ajaran", value: item.tahunAjaran, color: "blue" },
                { icon: <User />, label: "Pengunggah", value: item.uploaderName || "Dosen Prodi", color: "blue" },
                { icon: <BookOpen />, label: "Mata Kuliah", value: item.mataKuliahName, color: "blue" },
                { icon: <Clock />, label: "Tgl Diunggah", value: new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), color: "blue" }
              ].map((m, idx) => (
                <div key={idx} className="flex items-start gap-5 p-5 rounded-[28px] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800/50">
                    {React.isValidElement(m.icon) ? React.cloneElement(m.icon as React.ReactElement<any>, { size: 24 }) : m.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 opacity-70">{m.label}</div>
                    <div className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight">{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
 
            <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
               <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <ShieldCheck size={32} className="mx-auto text-blue-200 dark:text-blue-900/50" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-widest">Dokumen ini dilindungi sistem Helphin Student Access.</p>
               </div>
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

function ShieldCheck({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
