"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Inter } from "next/font/google";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Info,
  Video,
  MessageCircle,
  Users,
  ChevronRight,
  Lock,
  Edit,
  ExternalLink
} from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

interface ResponsiDetail {
  id: string;
  title: string;
  description: string;
  speaker: string;
  topic: string;
  scheduleDate: string;
  durationMinutes: number;
  meetingLink: string;
  requestMaterialLink: string;
  communityLink: string;
  liveChatLink: string;
  status: string;
  mataKuliahId: string;
  mataKuliahName: string;
  prodiName: string;
  uploaderName: string;
  createdAt: string;
}

function getTimeStatus(scheduleDate: string, durationMinutes: number) {
  const now = new Date();
  const start = new Date(scheduleDate);
  const end = new Date(start.getTime() + (durationMinutes || 60) * 60000);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "live";
  return "completed";
}

function formatSchedule(dateStr: string) {
  const d = new Date(dateStr);
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  return `Pukul ${hours}:${minutes} WIB`;
}

export default function AdminResponsiDetail() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const resId = params?.resId as string;

  const [data, setData] = useState<ResponsiDetail | null>(null);
  const [otherResponsi, setOtherResponsi] = useState<ResponsiDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResponsi();
  }, [resId]);

  const fetchResponsi = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/responsi/${resId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (json.success) {
        setData(json.data);
        const listRes = await fetch(`http://localhost:8000/api/responsi?mataKuliahId=${json.data.mataKuliahId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const listJson = await listRes.json();
        if (listJson.success) {
          setOtherResponsi(listJson.data.filter((r: ResponsiDetail) => r.id !== resId));
        }
      } else {
        setError(json.message || "Gagal mengambil data responsi");
      }
    } catch (e) {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const liveStatus = useMemo(() => {
    if (!data) return "upcoming";
    return getTimeStatus(data.scheduleDate, data.durationMinutes);
  }, [data]);

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 dark:border-slate-800 border-t-[#007AFF] rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight uppercase">Menyiapkan Responsi...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight">Data Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Responsi ini mungkin telah dihapus atau Anda tidak memiliki akses.</p>
          <button onClick={() => router.back()} className="w-full mt-6 py-4 bg-[#007AFF] text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  const speakerName = data.speaker || data.uploaderName || "Pemateri";

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${inter.className} flex flex-col relative transition-colors duration-300`}>
      
      {/* ── BREADCRUMB NAVIGATION ── */}
      <div className="max-w-[1400px] mx-auto px-6 pt-10 w-full flex items-center gap-2 text-[10px] sm:text-sm font-black uppercase tracking-widest text-[#94A3B8] dark:text-slate-500">
        <Link href="/admin/mata-kuliah" className="hover:text-[#007AFF] transition-colors">
          MANAJEMEN MK
        </Link>
        <ChevronRight size={16} strokeWidth={3} className="text-[#CBD5E1] dark:text-slate-700" />
        <Link href={`/admin/mata-kuliah/${courseId}`} className="hover:text-[#007AFF] transition-colors">
          {data.mataKuliahName}
        </Link>
        <ChevronRight size={16} strokeWidth={3} className="text-[#CBD5E1] dark:text-slate-700" />
        <span className="bg-[#EBF5FF] dark:bg-blue-900/30 text-[#007AFF] dark:text-blue-400 px-4 py-1.5 rounded-xl">
          MONITORING RESPONSI
        </span>
      </div>

      {/* ── HERO BANNER ── */}
      <section className="relative w-full overflow-hidden lg:overflow-visible">
        <div className="max-w-[1400px] mx-auto px-6 pt-10 pb-6 relative flex items-center">
          <div className="absolute right-6 left-[20%] md:left-[30%] top-1/2 -translate-y-1/2 h-[180px] md:h-[220px] bg-gradient-to-r from-[#007AFF] to-[#00C2FF] rounded-[24px] shadow-lg z-0 flex items-center pl-[35%] md:pl-[28%] pr-10">
            <div className="text-white">
              <h1 className="text-xl lg:text-3xl font-black uppercase tracking-tight leading-tight">
                RESPONSI {data.mataKuliahName}
              </h1>
              <p className="text-white/90 text-md lg:text-xl font-medium mt-1">
                oleh <span className="font-black uppercase">{speakerName}</span>
              </p>
            </div>
          </div>

          <div className="relative w-[50%] md:w-[55%] min-h-[260px] md:min-h-[300px] bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl z-10 flex items-center overflow-hidden border border-slate-50 dark:border-slate-800">
            <div className="w-[55%] pl-6 md:pl-12 flex flex-col justify-center z-10">
              <div className="mb-2">
                <h2 className="text-[#007AFF] text-2xl md:text-3xl font-extrabold uppercase tracking-tight leading-none mb-1">
                  {data.title}
                </h2>
                <p className="text-[#007AFF] text-xs md:text-lg font-bold opacity-80 mt-1">
                  {data.mataKuliahName}
                </p>
              </div>

              <div className="relative mt-6">
                <div className="absolute inset-y-0 -left-12 w-[150%] bg-gradient-to-r from-[#007AFF] via-[#66B2FF] to-transparent h-10 md:h-12 flex items-center pl-12">
                  <span className="text-white text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">
                    ADMIN CONTROL
                  </span>
                </div>
              </div>
            </div>

            <div className="w-[45%] h-full relative self-end">
              <div className="relative h-[240px] md:h-[320px] w-full">
                <Image src="/images/Model.svg" alt="Model" fill className="object-contain object-bottom scale-110 origin-bottom" priority />
              </div>
            </div>
          </div>
          
          {/* Admin Tools (Floating Right) */}
          <div className="absolute right-10 top-0 flex flex-col gap-3">
             <Link 
               href={`/admin/mata-kuliah/${courseId}/responsi/edit/${resId}`}
               className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-black text-sm shadow-xl border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all ring-1 ring-slate-100 dark:ring-slate-800"
             >
                <Edit size={18} /> Edit Sesi
             </Link>
          </div>
        </div>
      </section>

      <main className="px-6 flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 mt-6 mb-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* 1. Detail Kegiatan */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-black shadow-lg shadow-blue-200 dark:shadow-none">1</div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Detail Kegiatan Responsi</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 ml-2 border-l-2 border-blue-100 dark:border-blue-900/50 pl-8">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] flex items-center justify-center shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Pelaksanaan</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200">{formatSchedule(data.scheduleDate)}</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-[#007AFF] flex items-center justify-center shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Waktu</div>
                  <div className="text-lg font-black text-slate-800 dark:text-slate-200">{formatTime(data.scheduleDate)}</div>
                </div>
              </div>
            </div>
            
            {(data.description) && (
              <div className="mt-8 ml-2 border-l-2 border-blue-100 dark:border-blue-900/50 pl-8">
                 <h4 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Deskripsi Sesi</h4>
                 <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-lg">
                   {data.description}
                 </p>
              </div>
            )}
          </div>

          {/* 2. Request Materi */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-black shadow-lg shadow-blue-200 dark:shadow-none">2</div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Link Pembahasan / Request Soal</h2>
            </div>
            <div className="ml-2 border-l-2 border-blue-100 dark:border-blue-900/50 pl-8">
              <div className={`rounded-[24px] p-8 flex items-center justify-between gap-6 relative overflow-hidden border transition-all duration-500 ${data.requestMaterialLink
                ? "bg-gradient-to-br from-[#007AFF] via-[#0055FF] to-[#0044CC] border-blue-400 shadow-[0_20px_50px_rgba(0,122,255,0.3)] dark:shadow-none"
                : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 shadow-sm"
                }`}>
                {/* Background Ornament */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-10 translate-x-10 blur-2xl" />

                <div className="flex-1 z-10">
                  <h4 className={`text-xl font-black mb-2 ${data.requestMaterialLink ? "text-white" : "text-slate-800 dark:text-slate-100"}`}>
                    Kelola Request Soal
                  </h4>
                  <p className={`font-medium mb-6 max-w-md leading-relaxed ${data.requestMaterialLink ? "text-white/80" : "text-slate-500 dark:text-slate-400"}`}>
                    {data.requestMaterialLink
                      ? "Buka tautan untuk mengelola, meninjau, atau memantau request soal dari mahasiswa."
                      : "Link request soal atau pembahasan belum disematkan pada sesi ini."
                    }
                  </p>
                  <button
                    disabled={!data.requestMaterialLink}
                    onClick={() => { if (data.requestMaterialLink) window.open(data.requestMaterialLink, '_blank') }}
                    className={`group/btn inline-flex items-center gap-3 px-10 py-4 rounded-xl font-black text-sm shadow-md transition-all ${data.requestMaterialLink
                      ? "bg-white text-[#007AFF] hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      }`}
                  >
                    {data.requestMaterialLink ? "BUKA LINK REQUEST" : "LINK BELUM ADA"}
                    {data.requestMaterialLink && <ExternalLink size={18} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />}
                  </button>
                </div>
                <div className={`w-32 h-32 relative hidden sm:block transition-all duration-500 ${data.requestMaterialLink ? "opacity-100 brightness-110" : "opacity-30 grayscale"}`}>
                  <Image src="/images/Phiiny dizzy.svg" alt="Icon" fill className="object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Komunitas */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-black shadow-lg shadow-blue-200 dark:shadow-none">3</div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Detail Informasi Responsi</h2>
            </div>
            <div className="ml-2 border-l-2 border-blue-100 dark:border-blue-900/50 pl-8">
              <div className="bg-[#E7FFEF] dark:bg-emerald-900/20 rounded-[24px] p-8 flex items-center justify-between gap-6 relative overflow-hidden border border-emerald-50 dark:border-emerald-900/30 shadow-[0_15px_40px_rgba(16,185,129,0.15)] dark:shadow-none">
                <div className="flex-1">
                  <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2">Komunitas helPhin</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 max-w-md">Pantau grup komunikasi atau obrolan komunitas untuk sesi responsi mahasiswa.</p>
                  <button 
                    onClick={() => { if (data.communityLink) window.open(data.communityLink, '_blank') }} 
                    disabled={!data.communityLink}
                    className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm shadow-sm hover:shadow-md transition-all border ${data.communityLink ? "bg-white dark:bg-slate-800 text-[#25D366] border-emerald-100 dark:border-emerald-900/50 cursor-pointer" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 cursor-not-allowed"}`}
                  >
                    {!data.communityLink && <Lock size={16} />}
                    {data.communityLink ? "Buka Group WA" : "Link Group Belum Diatur"}
                  </button>
                </div>
                <div className="w-32 h-32 text-[#25D366]/20 absolute right-4 -bottom-4 hidden sm:block">
                  <Users size={120} />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Open Meeting */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#007AFF] text-white flex items-center justify-center font-black shadow-lg shadow-blue-200 dark:shadow-none">4</div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Open Meeting Responsi</h2>
            </div>
            <div className="ml-2 border-l-2 border-blue-100 dark:border-blue-900/50 pl-8">
              <div className="bg-[#F0F7FF] dark:bg-blue-900/20 rounded-[24px] p-8 flex items-center justify-between gap-6 relative overflow-hidden border border-blue-50 dark:border-blue-900/30 shadow-[0_15px_40px_rgba(0,122,255,0.15)] dark:shadow-none">
                <div className="flex-1">
                  <h4 className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight mb-4">RESPONSI {data.mataKuliahName}</h4>
                  <div className="flex flex-wrap gap-4">
                    <button
                      disabled={!data.meetingLink}
                      onClick={() => { if (data.meetingLink) router.push(`/admin/mata-kuliah/${courseId}/responsi/${resId}/live`) }}
                      className={`px-10 py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg flex items-center gap-3 ${data.meetingLink
                        ? "bg-[#007AFF] text-white hover:bg-blue-600 shadow-blue-200 dark:shadow-none"
                        : "bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
                        } ${liveStatus === "live" && data.meetingLink ? "animate-pulse" : ""}`}
                    >
                      {!data.meetingLink && <Lock size={18} />}
                      {data.meetingLink ? "BUKA LINK MEETING" : "MEETING BELUM ADA"}
                    </button>
                  </div>
                </div>
                <div className="w-40 h-32 relative hidden sm:block">
                  <Image src="/images/CTO2mode.svg" alt="Meeting" fill className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Status & Responsi Lainnya */}
        <div className="lg:col-span-4 transition-colors duration-300">
          <div className="sticky top-8">
            
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none mb-6">
               <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-3 uppercase tracking-tighter">
                <Info size={24} className="text-[#007AFF] dark:text-blue-400" />
                Status Sesi
              </h3>
              <div className="flex items-center gap-4 p-5 rounded-[24px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mb-8">
                 <div className={`w-3 h-3 rounded-full ${liveStatus === 'live' ? 'bg-red-500 animate-pulse' : liveStatus === 'upcoming' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                 <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
                   {liveStatus === 'live' ? 'SEDANG BERLANGSUNG' : liveStatus === 'upcoming' ? 'AKAN DATANG' : 'SELESAI'}
                 </span>
              </div>
              <button 
                onClick={() => router.back()}
                className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-black dark:hover:bg-slate-700 transition-all mb-4"
              >
                Kembali ke Daftar
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
              Sesi Lain di MK Ini
              <span className="text-xs font-bold text-[#007AFF] bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg">
                {otherResponsi.length}
              </span>
            </h3>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {otherResponsi.length > 0 ? otherResponsi.map((item) => (
                <Link key={item.id} href={`/admin/mata-kuliah/${courseId}/responsi/${item.id}`} className="group block bg-white dark:bg-slate-900 rounded-[24px] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:shadow-black/50 transition-all duration-300">
                  <div className="relative h-44 w-full bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
                    <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-xl shadow-md flex items-center overflow-hidden border border-slate-50 dark:border-slate-800">
                      <div className="w-[60%] p-3">
                        <div className="text-[#007AFF] dark:text-blue-400 text-[10px] font-black uppercase leading-tight line-clamp-1">{item.mataKuliahName}</div>
                        <div className="text-[#007AFF] dark:text-blue-500 text-[8px] font-bold opacity-70 italic">oleh {item.speaker || item.uploaderName || "Pemateri"}</div>
                        <div className="mt-2 h-4 w-16 bg-gradient-to-r from-[#007AFF] to-transparent flex items-center pl-2">
                          <span className="text-white text-[6px] font-black uppercase">Responsi</span>
                        </div>
                      </div>
                      <div className="w-[40%] h-full relative self-end">
                        <Image src="/images/Model.svg" alt="Model" fill className="object-contain object-bottom scale-110" />
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <h5 className="font-black text-slate-800 dark:text-slate-100 text-sm mb-3">Responsi {item.mataKuliahName}</h5>
                    <div className="space-y-1.5 mb-5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        <Calendar size={12} className="text-[#007AFF]" /> {formatSchedule(item.scheduleDate)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 dark:text-slate-500">
                        <Clock size={12} className="text-[#007AFF]" /> {formatTime(item.scheduleDate)}
                      </div>
                    </div>
                    <div className="w-full text-center py-2.5 bg-[#007AFF] text-white rounded-xl text-xs font-black uppercase tracking-wider group-hover:bg-blue-600 transition-colors shadow-md shadow-blue-100 dark:shadow-none">
                      Lihat Sesi
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="text-center py-10 bg-white dark:bg-slate-900/50 rounded-[24px] border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400 dark:text-slate-600 font-bold">Tidak ada sesi lain</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FooterDashboard />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #007AFF; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; }
      `}</style>
    </div>
  );
}

