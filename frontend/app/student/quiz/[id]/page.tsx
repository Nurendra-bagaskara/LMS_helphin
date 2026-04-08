"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  BookOpen, 
  ChevronRight,
  Clock,
  Info,
  Lightbulb,
  ExternalLink,
  ClipboardCheck,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

interface ExerciseDetail {
  id: string;
  title: string;
  subject: string;
  description: string;
  googleFormUrl: string;
  tahunAjaran: string;
  mataKuliahId: string;
  mataKuliahName: string;
  prodiName: string;
  uploaderName: string;
  createdAt: string;
}

export default function StudentQuizDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [quiz, setQuiz] = useState<ExerciseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/exercises/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setQuiz(data.data);
      } else {
        setError(data.message || "Gagal mengambil data kuis");
      }
    } catch (e) {
      console.error("Failed to fetch quiz", e);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (quiz?.googleFormUrl) {
      window.open(quiz.googleFormUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-100 dark:border-purple-900/30 border-t-purple-600 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-wide">Mempersiapkan Kuis...</p>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 text-center max-w-md mx-6">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">Akses Terputus</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">{error || "Kuis tidak ditemukan"}</p>
          <button 
            onClick={() => router.back()}
            className="w-full py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-2xl font-bold hover:bg-slate-700 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${inter.className} pb-10 flex flex-col transition-colors duration-300`}>
      {/* ── BREADCRUMB & HEADER ── */}
      <header className="px-6 py-10 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-8 text-[10px] font-black text-slate-400 tracking-widest uppercase">
          <Link href="/student/mata-kuliah" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Mata Kuliah</Link>
          <ChevronRight size={12} className="opacity-50" />
          <Link href={`/student/mata-kuliah/${quiz.mataKuliahId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{quiz.mataKuliahName}</Link>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-indigo-600 dark:text-indigo-400 font-extrabold bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">Pintu Gerbang Kuis</span>
        </div>
 
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => router.back()}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                <ClipboardCheck size={12} strokeWidth={3} />
                Latihan Mandiri
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-2 transition-colors">
              {quiz.title}
            </h1>
            <p className="text-slate-400 dark:text-slate-500 font-bold text-lg md:text-xl tracking-tight opacity-80 uppercase transition-colors">{quiz.subject || "Evaluasi Belajar"}</p>
          </div>
        </div>
      </header>
 
      {/* ── CONTENT AREA ── */}
      <main className="px-6 flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        {/* Main Instruction Column */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Hero Instruction Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 p-12 relative overflow-hidden group ring-1 ring-slate-100/50 dark:ring-slate-800/50">
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-40 -mr-20 -mt-20" />
             
             <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                   <div className="w-16 h-16 bg-indigo-100/50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-800/50">
                      <Lightbulb size={32} />
                   </div>
                   <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tighter transition-colors">INSTRUKSI PENGERJAAN</h2>
                </div>
 
                <div className="prose prose-slate dark:prose-invert max-w-none mb-12">
                   <div className="text-xl text-slate-600 dark:text-slate-300 font-bold leading-relaxed space-y-6">
                      {quiz.description ? (
                        <p className="whitespace-pre-line">{quiz.description}</p>
                      ) : (
                        <p>Silakan kerjakan kuis ini dengan jujur dan teliti. Pastikan koneksi internet Anda stabil sebelum mulai mengerjakan.</p>
                      )}
                   </div>
                </div>
 
                {/* Rules Alert */}
                <div className="bg-amber-50 dark:bg-amber-950/20 rounded-[32px] p-8 border border-amber-100 dark:border-amber-900/30 mb-12 flex items-start gap-5">
                   <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-200 dark:shadow-none">
                      <AlertCircle size={24} />
                   </div>
                   <div>
                      <h4 className="text-amber-800 dark:text-amber-400 font-black text-lg tracking-tight mb-1 uppercase">Penting!</h4>
                      <p className="text-amber-700/80 dark:text-amber-500/80 font-bold leading-snug">Kuis ini menggunakan platform Google Form. Pastikan Anda sudah login ke akun email yang sesuai sebelum menekan tombol di bawah.</p>
                   </div>
                </div>
 
                <button 
                  onClick={handleStartQuiz}
                  className="group w-full py-7 bg-slate-900 hover:bg-black text-white rounded-[32px] font-black text-xl tracking-tight transition-all shadow-2xl shadow-slate-300 flex items-center justify-center gap-4"
                >
                  MULAI KERJAKAN SEKARANG
                  <ExternalLink size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
             </div>
          </div>
        </div>
 
        {/* Sidebar Metadata Column */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 flex flex-col relative overflow-hidden group ring-1 ring-slate-100/50 dark:ring-slate-800/50">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 dark:bg-indigo-900/10 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-1000" />
             
             <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-10 flex items-center gap-3 relative z-10 uppercase tracking-tighter transition-colors">
              <Info size={24} className="text-indigo-600 dark:text-indigo-400" />
              Detail Kuis
            </h3>
 
            <div className="space-y-8 relative z-10">
              {[
                { icon: <Calendar />, label: "Tahun Ajaran", value: quiz.tahunAjaran, color: "indigo" },
                { icon: <User />, label: "Pengunggah", value: quiz.uploaderName || "Dosen Prodi", color: "indigo" },
                { icon: <BookOpen />, label: "Mata Kuliah", value: quiz.mataKuliahName, color: "indigo" },
                { icon: <Clock />, label: "Diunggah Pada", value: new Date(quiz.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), color: "indigo" }
              ].map((m, idx) => (
                <div key={idx} className="flex items-start gap-5 p-5 rounded-[32px] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                  <div className="w-14 h-14 rounded-[20px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-800/50 transition-all">
                    {React.isValidElement(m.icon) ? React.cloneElement(m.icon as React.ReactElement<any>, { size: 24 }) : m.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 opacity-70">{m.label}</div>
                    <div className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none transition-colors">{m.value}</div>
                  </div>
                </div>
              ))}
            </div>
 
            <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800 text-center">
               <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[40px] border border-slate-100 dark:border-slate-800 flex flex-col gap-3">
                  <ShieldCheck size={40} className="mx-auto text-indigo-200 dark:text-indigo-900/50 transition-colors" />
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-widest">Sistem Keamanan Helphin Quiz Protection.</p>
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
