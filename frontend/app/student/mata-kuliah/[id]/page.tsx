"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Search, BookOpen, ChevronRight, Filter, Calendar } from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

const inter = Inter({ subsets: ["latin"] });

// ── Inline base64 untuk SVG latar melengkung ────────────────────────────────────────────
const VECTOR21_B64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTM1IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEzNSAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMTYuNjAzIDQ2LjI1NTJMMTM1IC00Mi41NDIxTDAgLTYxVjEwNi4xMTlDOS42NDkzIDEwNi43ODQgMzUuNzExNCAxMDcuNzE1IDYyLjc2NTUgMTA2LjExOUM4OS44MTk2IDEwNC41MjIgMTAwLjEgMTEzLjYwMSAxMTYuNjAzIDQ2LjI1NTJaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTI0N18xMDk5NikiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMjQ3XzEwOTk2IiB4MT0iMTAxLjcyMyIgeTE9Ii01NS4wMTM3IiB4Mj0iLTQ3LjU1NiIgeTI9IjE4LjQwNzMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzMwQjVGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNjhERkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K`;

interface TopikItem {
  id: string; // Synthetic ID
  realId: string; // Original database ID
  title: string;
  subtitle?: string;
  type: "bank-soal" | "e-materi" | "smart-video" | "quiz" | "responsi";
  href: string;
  tahunAjaran?: string;
}

export default function StudentMataKuliahDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [activeFilter, setActiveFilter] = useState<"all" | "bank-soal" | "e-materi" | "smart-video" | "quiz" | "responsi">("all");
  const [userName, setUserName] = useState("Student");
  const [mataKuliah, setMataKuliah] = useState("Mata Kuliah");
  const [semester, setSemester] = useState("-");
  const [topikList, setTopikList] = useState<TopikItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [searchTopik, setSearchTopik] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("Semua Tahun");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.name) setUserName(user.name.split(" ")[0]);
      } catch { }
    }

    fetchCourseData();
  }, [id]);

  const fetchCourseData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // 1. Fetch Mata Kuliah Detail
      const mkRes = await fetch(`http://localhost:8000/api/mata-kuliah/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mkData = await mkRes.json();
      if (mkData.success) {
        setMataKuliah(mkData.data.name);
        setSemester(mkData.data.semester || "I");
      }

      // 2. Fetch All Topics
      const fetchTopik = async (url: string, type: TopikItem["type"], prefix: string): Promise<TopikItem[]> => {
        try {
          const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
          const d = await res.json();
          if (d.success && Array.isArray(d.data)) {
            return d.data
              .filter((item: any) => (item.mataKuliahId === id || item.courseId === id))
              .map((item: any) => ({
                  id: `${type}-${item.id}`,
                  realId: item.id,
                  title: item.title,
                  subtitle: type === "bank-soal" ? `${item.fileType || 'Soal'}` : (item.subject || item.description?.substring(0, 40)),
                  type,
                   href: type === "e-materi" ? `/student/materi/${item.id}` : (type === "smart-video" ? `/student/video/${item.id}` : (type === "bank-soal" ? `/student/bank-soal/${item.id}` : (type === "quiz" ? `/student/quiz/${item.id}` : (type === "responsi" ? `/student/responsi/${item.id}` : `/${prefix}/${item.id}`)))),
                   tahunAjaran: item.tahunAjaran || "Lainnya"
               }));
          }
        } catch (e) { console.error(`Failed to fetch ${type}`, e); }
        return [];
      };

      const [soal, materi, video, quiz, responsiData] = await Promise.all([
        fetchTopik(`http://localhost:8000/api/bank-soal?mataKuliahId=${id}`, "bank-soal", "bank-soal"),
        fetchTopik(`http://localhost:8000/api/materials?mataKuliahId=${id}`, "e-materi", "materi"),
        fetchTopik(`http://localhost:8000/api/videos?mataKuliahId=${id}`, "smart-video", "smart-video"),
        fetchTopik(`http://localhost:8000/api/exercises?mataKuliahId=${id}`, "quiz", "quiz"),
        fetchTopik(`http://localhost:8000/api/responsi?mataKuliahId=${id}`, "responsi", "responsi")
      ]);
      
      setTopikList([...soal, ...materi, ...video, ...quiz, ...responsiData]);
    } catch (e) {
      console.error("Failed to fetch topics", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = topikList.filter((t) => {
    const categoryMatch = activeFilter === "all" || t.type === activeFilter;
    const yearMatch = selectedYear === "Semua Tahun" || t.tahunAjaran === selectedYear;
    const searchMatch = !searchTopik || 
      t.title.toLowerCase().includes(searchTopik.toLowerCase()) || 
      t.subtitle?.toLowerCase().includes(searchTopik.toLowerCase());
      
    return categoryMatch && yearMatch && searchMatch;
  });

  const years = ["Semua Tahun", ...Array.from(new Set(topikList.map(t => t.tahunAjaran || "Lainnya"))).sort()];

  const filters: { key: typeof activeFilter; label: string; icon: string }[] = [
    { key: "all", label: "Semua Topik", icon: "📚" },
    { key: "e-materi", label: "E-Materi", icon: "📄" },
    { key: "smart-video", label: "Video", icon: "🎬" },
    { key: "bank-soal", label: "Bank Soal", icon: "📝" },
    { key: "quiz", label: "Kuis / Latihan", icon: "💡" },
    { key: "responsi", label: "Responsi", icon: "🤝" },
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${inter.className} pb-10 flex flex-col gap-6 transition-colors duration-300`}>
      {/* ══════════════════════════════════════════════════ HERO SECTION ══════════════════════════════════════════════════ */}
      <section className="mx-4 mt-4 relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0055FF] via-[#068DFF] to-[#07D1FF] shadow-xl shadow-blue-200/50 min-h-[240px] flex">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        
        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 py-8">
          <h1 className="text-white font-black text-3xl md:text-4xl tracking-tight mb-2">
            Hallo, {userName}! 👋
          </h1>
          <p className="text-blue-50 text-xl font-medium mb-6 opacity-90 max-w-2xl">
            Siap menjelajahi materi dan mengasah kemampuan kamu di kelas <span className="text-white font-bold underline decoration-blue-300 underline-offset-4">{mataKuliah}</span> hari ini?
          </p>
          
          <div className="flex gap-3">
            <div className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-xs font-bold flex items-center gap-2 shadow-sm">
                <BookOpen size={14} className="opacity-70" />
                Student
            </div>
          </div>
        </div>

        {/* Mascot Image */}
        <div className="absolute right-0 bottom-0 h-full w-[35%] flex items-end justify-end pointer-events-none">
          <div className="relative h-[90%] w-full">
            <Image 
              src="/images/Model.svg" 
              alt="Mascot" 
              fill
              className="object-contain object-right-bottom drop-shadow-[-20px_10px_30px_rgba(0,0,0,0.3)]"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ FILTER & SEARCH ══════════════════════════════════════════════════ */}
      <section className="px-6 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-blue-500 rounded-full" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Topik Pembelajaran</h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Topik */}
            <div className="relative min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari materi, kuis, atau responsi..."
                value={searchTopik}
                onChange={(e) => setSearchTopik(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-400 outline-none transition-all text-sm font-semibold text-slate-600 dark:text-slate-300"
              />
            </div>

            {/* Filter Category */}
            <div className="relative">
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm font-bold text-sm hover:border-blue-200 dark:hover:border-blue-800 transition-all"
              >
                <Filter size={16} className="text-blue-500" />
                {filters.find(f => f.key === activeFilter)?.label}
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${showFilterMenu ? 'rotate-90' : ''}`} />
              </button>
              {showFilterMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowFilterMenu(false)} />
                  <div className="absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-2 z-30">
                    {filters.map(f => (
                      <button 
                        key={f.key}
                        onClick={() => { setActiveFilter(f.key); setShowFilterMenu(false); }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeFilter === f.key ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        <span className="text-lg">{f.icon}</span>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Year Filter */}
            <div className="relative">
              <button 
                onClick={() => setShowYearMenu(!showYearMenu)}
                className="flex items-center gap-2.5 px-5 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm font-bold text-sm hover:border-blue-200 dark:hover:border-blue-800 transition-all"
              >
                <Calendar size={16} className="text-blue-500" />
                {selectedYear}
                <ChevronRight size={16} className={`text-slate-400 transition-transform ${showYearMenu ? 'rotate-90' : ''}`} />
              </button>
              {showYearMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowYearMenu(false)} />
                  <div className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-100 dark:border-slate-800 p-2 z-30">
                    {years.map(y => (
                      <button 
                        key={y}
                        onClick={() => { setSelectedYear(y); setShowYearMenu(false); }}
                        className={`w-full flex items-center p-3 rounded-xl text-sm font-bold transition-all ${selectedYear === y ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════ LIST TOPIK ══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-4 pb-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 border-dashed">
              <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4" />
              <p className="text-slate-400 font-bold">Menyiapkan materi terbaik untukmu...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-50 dark:border-slate-800 border-dashed">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={40} className="text-slate-200 dark:text-slate-700" />
              </div>
              <h3 className="text-xl font-black text-slate-700 dark:text-slate-300 mb-2">Belum ada topik ditemukan</h3>
              <p className="text-slate-400 dark:text-slate-500 max-w-xs text-center font-medium">Coba gunakan filter lain atau hubungi admin untuk update materi terbarunya.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <TopikCard key={item.id} item={item} />
            ))
          )}
        </div>
      </section>

      <div className="mt-auto px-6">
        <FooterDashboard />
      </div>
    </div>
  );
}

function TopikCard({ item }: { item: TopikItem }) {
  const [hovered, setHovered] = useState(false);
  
  const getTypeConfig = (type: TopikItem["type"]) => {
    switch (type) {
      case "bank-soal": return { color: "#3B82F6", label: "Bank Soal", icon: "📝" };
      case "e-materi": return { color: "#F97316", label: "E-Materi", icon: "📄" };
      case "smart-video": return { color: "#22C55E", label: "Video", icon: "🎬" };
      case "quiz": return { color: "#6366F1", label: "Kuis", icon: "💡" };
      case "responsi": return { color: "#EF4444", label: "Responsi", icon: "🤝" };
      default: return { color: "#64748B", label: "Lainnya", icon: "📍" };
    }
  };

  const config = getTypeConfig(item.type);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-xl hover:shadow-blue-200/20 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Decorative Vector */}
      <img src={VECTOR21_B64} alt="" className="absolute -bottom-4 -left-4 w-32 h-auto opacity-10 dark:opacity-5 group-hover:opacity-25 dark:group-hover:opacity-10 transition-opacity pointer-events-none" />
      
      {/* Left Icon Section */}
      <div className="p-8 md:w-[120px] flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
        <div 
          className="text-4xl transform transition-transform group-hover:scale-125 duration-500"
          style={{ textShadow: `0 10px 20px ${config.color}33` }}
        >
          {config.icon}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-8 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-1">
            <span 
              className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{ backgroundColor: `${config.color}15`, color: config.color }}
            >
              {config.label}
            </span>
            {item.tahunAjaran && (
              <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 tracking-wider">TA {item.tahunAjaran}</span>
            )}
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{item.subtitle}</p>
          )}
        </div>

        <div className="flex items-center">
          <Link 
            href={item.href}
            className={`
              flex items-center gap-3 px-8 py-3.5 rounded-2xl font-black text-sm tracking-wide transition-all duration-300
              ${hovered 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40 translate-x-2' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}
            `}
          >
            Pelajari Sekarang
            <ChevronRight size={18} className={`transition-transform duration-300 ${hovered ? 'translate-x-1' : ''}`} />
          </Link>
        </div>
      </div>

      {/* Hover Background Accent */}
      <div className="absolute top-0 right-0 w-2 h-0 bg-blue-500 group-hover:h-full transition-all duration-500" />
    </div>
  );
}
