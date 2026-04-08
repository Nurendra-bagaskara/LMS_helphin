"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
import { useParams } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

// ── Inline base64 untuk SVG kecil ────────────────────────────────────────────
const GROUP2_B64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjI3IiBoZWlnaHQ9IjY4NyIgdmlld0JveD0iMCAwIDYyNyA2ODciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYzMS40IiBjeT0iMjQ4IiByPSIyNDMuNSIgc3Ryb2tlPSIjMDY4REZGIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIvPgo8Y2lyY2xlIGN4PSI1NjIuNCIgY3k9IjE4MyIgcj0iMjQzLjUiIHN0cm9rZT0iIzA2OERGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuNCIvPgo8Y2lyY2xlIGN4PSI1ODMuNCIgY3k9IjIxNSIgcj0iMjQzLjUiIHN0cm9rZT0iIzA2OERGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMF9mXzU5XzQ4OSkiPgo8Y2lyY2xlIGN4PSI0ODcuNCIgY3k9IjE5OSIgcj0iMjI4IiBmaWxsPSIjMDY4REZGIiBmaWxsLW9wYWNpdHk9IjAuMjUiLz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9mXzU5XzQ4OSIgeD0iLTkuMTU1MjdlLTA1IiB5PSItMjg4LjQiIHdpZHRoPSI5NzQuOCIgaGVpZ2h0PSI5NzQuOCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJzaGFwZSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxMjkuNyIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzU5XzQ4OSIvPgo8L2ZpbHRlcj4KPC9kZWZzPgo8L3N2Zz4K`;

const VECTOR21_B64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTM1IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEzNSAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMTYuNjAzIDQ2LjI1NTJMMTM1IC00Mi41NDIxTDAgLTYxVjEwNi4xMTlDOS42NDkzIDEwNi43ODQgMzUuNzExNCAxMDcuNzE1IDYyLjc2NTUgMTA2LjExOUM4OS44MTk2IDEwNC41MjIgMTAwLjEgMTEzLjYwMSAxMTYuNjAzIDQ2LjI1NTJaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTI0N18xMDk5NikiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMjQ3XzEwOTk2IiB4MT0iMTAxLjcyMyIgeTE9Ii01NS4wMTM3IiB4Mj0iLTQ3LjU1NiIgeTI9IjE4LjQwNzMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzMwQjVGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNjhERkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K`;

interface TopikItem {
  id: string; // Synthetic ID
  realId: string; // Original database ID
  title: string;
  subtitle?: string;
  type: "bank-soal" | "e-materi" | "smart-video" | "quiz" | "responsi";
  href: string;
  tahunAjaran?: string; // Filter by year
}

export default function MataKuliahDetail() {
  const params = useParams();
  const id = params?.id as string;
  
  const [activeFilter, setActiveFilter] = useState<"all" | "bank-soal" | "e-materi" | "smart-video" | "quiz" | "responsi">("all");
  const [userName, setUserName] = useState("User");
  const [mataKuliah, setMataKuliah] = useState("Mata Kuliah");
  const [semester, setSemester] = useState("-");
  const [topikList, setTopikList] = useState<TopikItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showYearMenu, setShowYearMenu] = useState(false);
  const [searchTopik, setSearchTopik] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("All");

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

      // 2. Fetch All Topics (Materials, Bank Soal, Videos)
      const fetchTopik = async <T,>(url: string, type: TopikItem["type"], prefix: string): Promise<TopikItem[]> => {
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        const d = await res.json();
        if (d.success && Array.isArray(d.data)) {
          return d.data
            .filter((item: any) => item.mataKuliahId === id)
            .map((item: any) => ({
                id: `${type}-${item.id}`,
                realId: item.id,
                title: item.title,
                subtitle: type === "bank-soal" ? `${item.fileType || 'Soal'}` : (item.subject || item.description?.substring(0, 30)),
                type,
                href: `/admin/mata-kuliah/${id}/${prefix}/${item.id}`,
                tahunAjaran: item.tahunAjaran || "Lainnya"
            }));
        }
        return [];
      };

      const [soal, materi, video, quiz, responsiData] = await Promise.all([
        fetchTopik(`http://localhost:8000/api/bank-soal?courseId=${id}`, "bank-soal", "bank-soal"),
        fetchTopik(`http://localhost:8000/api/materials?courseId=${id}`, "e-materi", "materi"),
        fetchTopik(`http://localhost:8000/api/videos?courseId=${id}`, "smart-video", "video"),
        fetchTopik(`http://localhost:8000/api/exercises?courseId=${id}`, "quiz", "quiz"),
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
    // 1. Filter by Category
    const categoryMatch = activeFilter === "all" || t.type === activeFilter;
    
    // 2. Filter by Year
    const yearMatch = selectedYear === "All" || t.tahunAjaran === selectedYear;
    
    // 3. Filter by Search
    const searchMatch = !searchTopik || 
      t.title.toLowerCase().includes(searchTopik.toLowerCase()) || 
      t.subtitle?.toLowerCase().includes(searchTopik.toLowerCase());
      
    return categoryMatch && yearMatch && searchMatch;
  });

  // Extract unique years for the filter
  const years = ["All", ...Array.from(new Set(topikList.map(t => t.tahunAjaran || "Lainnya"))).sort()];

  const filters: { key: typeof activeFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "bank-soal", label: "Bank Soal" },
    { key: "e-materi", label: "E-Materi" },
    { key: "quiz", label: "Quiz" },
    { key: "responsi", label: "Responsi" },
    { key: "smart-video", label: "Smart Video" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-[#EEF5FF] dark:bg-slate-950 transition-colors duration-300"
      style={{ fontFamily: "inter" }}
    >
      {/* ══════════════════════════════════════════════════ HERO SECTION ══════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════ HERO SECTION ══════════════════════════════════════════════════ */}
      <section
        className={`${inter.className} mx-auto mt-6 px-12`}
        style={{
          position: "relative",
          overflow: "hidden",
          maxWidth: "1200px",
          width: "calc(100% - 96px)",
          borderRadius: "24px",
          background: "linear-gradient(91.71deg, #0055FF 0%, #068DFF 49.5%, #07A3F9 100%)",
          boxShadow: "0 10px 30px rgba(6, 141, 255, 0.2)",
          minHeight: "220px",
        }}
      >
        {/* Texture Overlay (Noise/Mesh) */}
        <div 
          style={{ 
            position: "absolute", inset: 0, 
            opacity: 0.15, pointerEvents: "none", zIndex: 1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.12'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} 
        />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2, padding: "40px 0" }}>
          <div style={{ textAlign: "left", flex: 1 }}>
            <h1
              style={{
                fontSize: "clamp(24px, 3vw, 36px)",
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#FFFFFF",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Hallo, {userName}!<br />
              <span style={{ fontWeight: 600, fontSize: "clamp(18px, 1.8vw, 24px)", color: "rgba(255, 255, 255, 0.9)" }}>Siap mengelola materi <strong>{mataKuliah}</strong> hari ini?</span>
            </h1>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  padding: "6px 20px",
                  borderRadius: "999px",
                  backdropFilter: "blur(4px)"
                }}
              >
                Semester {semester}
              </span>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.25)",
                  color: "#FFFFFF",
                  fontWeight: 700,
                  fontSize: "12.5px",
                  padding: "6px 20px",
                  borderRadius: "999px",
                  backdropFilter: "blur(4px)"
                }}
              >
                Admin Prodi
              </span>
            </div>
          </div>

          <div style={{ 
            flexShrink: 0, 
            height: "220px", 
            width: "250px", 
            position: "absolute", 
            right: "20px", 
            bottom: "0px", 
            zIndex: 3 
          }}>
             <img 
               src="/images/Model.svg" 
               alt="Decoration" 
               style={{ 
                 width: "100%", 
                 height: "100%", 
                 objectFit: "contain",
                 filter: "drop-shadow(0 15px 30px rgba(0,0,0,0.2))"
               }} 
             />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════ TOPIK SECTION ══════════════════════════════════════════════════ */}
      <section
        className={`${inter.className} flex-1 bg-[#EEF5FF] dark:bg-slate-950 px-12 py-9 pb-12 w-full max-w-[1200px] mx-auto box-border transition-colors duration-300`}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div className="flex items-center gap-2.5">
            <h2 className="text-[22px] font-extrabold text-slate-900 dark:text-slate-100 m-0">
              Topik
            </h2>
            <div className="w-8 h-1 bg-blue-500 rounded-sm" />
          </div>

          <div className="flex items-center gap-3">
            {/* Category Select Dropdown */}
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold border-[1.5px] border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm dark:shadow-none transition-colors"
              >
                <span>📂</span> Kategori: {filters.find(f => f.key === activeFilter)?.label}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px", transform: showFilterMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showFilterMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 11 }} onClick={() => setShowFilterMenu(false)} />
                  <div style={{ 
                    position: "absolute", top: "100%", left: 0, marginTop: "8px", 
                    backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                    padding: "6px", zIndex: 12, width: "190px", border: "1px solid #F1F5F9"
                  }}>
                    {filters.map(f => (
                      <button 
                        key={f.key}
                        onClick={() => { setActiveFilter(f.key); setShowFilterMenu(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
                          fontSize: "13px", fontWeight: 600, color: activeFilter === f.key ? "#2196F3" : "#475569", 
                          textDecoration: "none", borderRadius: "10px", border: "none", cursor: "pointer",
                          backgroundColor: activeFilter === f.key ? "#F0F9FF" : "transparent", textAlign: "left"
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Year Select Dropdown */}
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setShowYearMenu(!showYearMenu)}
                className="flex items-center gap-2.5 px-5 py-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold border-[1.5px] border-slate-200 dark:border-slate-800 cursor-pointer shadow-sm dark:shadow-none transition-colors"
              >
                <span>📅</span> {selectedYear}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: "4px", transform: showYearMenu ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><path d="m6 9 6 6 6-6"/></svg>
              </button>
              {showYearMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 11 }} onClick={() => setShowYearMenu(false)} />
                  <div style={{ 
                    position: "absolute", top: "100%", left: 0, marginTop: "8px", 
                    backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                    padding: "6px", zIndex: 12, width: "160px", border: "1px solid #F1F5F9"
                  }}>
                    {years.map(y => (
                      <button 
                        key={y}
                        onClick={() => { setSelectedYear(y); setShowYearMenu(false); }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
                          fontSize: "13px", fontWeight: 600, color: selectedYear === y ? "#2196F3" : "#475569", 
                          textDecoration: "none", borderRadius: "10px", border: "none", cursor: "pointer",
                          backgroundColor: selectedYear === y ? "#F0F9FF" : "transparent", textAlign: "left"
                        }}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Search Topik Bar */}
            <div style={{ position: "relative", minWidth: "220px" }}>
              <input 
                type="text" 
                placeholder="Cari topik..."
                value={searchTopik}
                onChange={(e) => setSearchTopik(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 bg-white dark:bg-slate-900 rounded-xl text-[13.5px] font-semibold border-[1.5px] border-slate-200 dark:border-slate-800 outline-none shadow-sm dark:shadow-none text-slate-800 dark:text-slate-100 transition-colors"
              />
              <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", opacity: 0.4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
            </div>

            {/* Contextual Action Button */}
            {activeFilter !== "all" ? (
              <Link 
                href={`/admin/mata-kuliah/${id}/${activeFilter === 'smart-video' ? 'video' : activeFilter === 'e-materi' ? 'materi' : activeFilter}/tambah`}
                style={{
                  display: "flex", alignItems: "center", gap: "8px", padding: "10px 22px", 
                  backgroundColor: "#2196F3", color: "#FFFFFF", borderRadius: "12px", 
                  fontSize: "14px", fontWeight: 700, textDecoration: "none", boxShadow: "0 6px 20px rgba(33,150,243,0.3)",
                }}
              >
                <span>+</span> Buat {activeFilter.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </Link>
            ) : (
              <div style={{ position: "relative" }}>
                <button 
                  onClick={() => setShowAddMenu(!showAddMenu)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px", padding: "10px 22px", 
                    backgroundColor: "#0F172A", color: "#FFFFFF", borderRadius: "12px", 
                    fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(15,23,42,0.25)",
                  }}
                >
                  <span>+</span> Tambah Konten
                </button>
                {showAddMenu && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 11 }} onClick={() => setShowAddMenu(false)} />
                    <div style={{ 
                      position: "absolute", top: "100%", right: 0, marginTop: "8px", 
                      backgroundColor: "#FFFFFF", borderRadius: "14px", boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                      padding: "6px", zIndex: 12, width: "190px", border: "1px solid #F1F5F9"
                    }}>
                      {[
                        { label: "Materi", path: "materi", color: "#F97316" },
                        { label: "Bank Soal", path: "bank-soal", color: "#2563EB" },
                        { label: "Quiz", path: "quiz", color: "#A855F7" },
                        { label: "Responsi", path: "responsi", color: "#EF4444" },
                        { label: "Video", path: "video", color: "#22C55E" }
                      ].map(item => (
                        <Link 
                          key={item.label}
                          href={`/admin/mata-kuliah/${id}/${item.path}/tambah`}
                          style={{
                            display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px",
                            fontSize: "13px", fontWeight: 600, color: "#334155", textDecoration: "none",
                            borderRadius: "10px"
                          }}
                        >
                          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: item.color }} />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {isLoading ? (
            <div style={{ textAlign: "center", color: "#9CA3AF", padding: "56px 0", fontSize: "14px" }}>
              Memuat topik...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9CA3AF", padding: "56px 0", fontSize: "14px" }}>
              Tidak ada topik untuk kategori ini.
            </div>
          ) : (
            filtered.map((item) => <TopikCard key={item.id} item={item} onRefresh={fetchCourseData} />)
          )}
        </div>
      </section>

      <footer
        className={inter.className}
        style={{
          backgroundColor: "#2196F3",
          padding: "24px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          margin: "10px",
          borderRadius: "16px",
        }}
      >
        <div className="flex items-center gap-2">
            <img src="/helPhin.svg" alt="helPhin" style={{ height: "40px" }} />
             <span style={{ color: "#FFFFFF", fontWeight: 800, fontSize: "22px" }}>helPhin</span>
        </div>
        <div style={{ display: "flex", gap: "36px" }}>
          {["About", "Policy", "Terms"].map((link) => (
            <a key={link} href="#" style={{ color: "#FFFFFF", fontWeight: 500, fontSize: "15px", textDecoration: "none", opacity: 0.92 }}>{link}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}

function ActionCard({ label, href, gradient, shadow, textColor, height }: { label: string; href: string; gradient: string; shadow: string; textColor: string; height: number }) {
  const [hovered, setHovered] = useState(false);
  const lines = label.split("\n");
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: "200px",
          height: `${height}px`,
          borderRadius: "20px",
          background: gradient,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: hovered ? `0 14px 36px ${shadow}` : `0 4px 16px ${shadow}`,
          transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
          transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease",
        }}
      >
        <span style={{ color: textColor, fontWeight: 700, fontSize: "16px", textAlign: "center", lineHeight: 1.5 }}>
          {lines.map((line, i) => (<React.Fragment key={i}>{line}{i < lines.length - 1 && <br />}</React.Fragment>))}
        </span>
      </div>
    </Link>
  );
}

function TopikCard({ item, onRefresh }: { item: TopikItem; onRefresh: () => void }) {
  const [hovered, setHovered] = useState(false);
  const params = useParams();
  const courseId = params?.id as string;

  const getEditUrl = () => {
    switch (item.type) {
      case "e-materi": return `/admin/mata-kuliah/${courseId}/materi/edit/${item.realId}`;
      case "bank-soal": return `/admin/mata-kuliah/${courseId}/bank-soal/edit/${item.realId}`;
      case "quiz": return `/admin/mata-kuliah/${courseId}/quiz/edit/${item.realId}`;
      case "responsi": return `/admin/mata-kuliah/${courseId}/responsi/edit/${item.realId}`;
      case "smart-video": return `/admin/mata-kuliah/${courseId}/video/edit/${item.realId}`;
      default: return "#";
    }
  };

  const getDeleteUrl = () => {
    switch (item.type) {
      case "e-materi": return `http://localhost:8000/api/materials/${item.realId}`;
      case "bank-soal": return `http://localhost:8000/api/bank-soal/${item.realId}`;
      case "quiz": return `http://localhost:8000/api/exercises/${item.realId}`;
      case "responsi": return `http://localhost:8000/api/responsi/${item.realId}`;
      case "smart-video": return `http://localhost:8000/api/videos/${item.realId}`;
      default: return "";
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus "${item.title}"?`)) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(getDeleteUrl(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert("Berhasil dihapus!");
        onRefresh();
      } else {
        alert("Gagal menghapus: " + data.message);
      }
    } catch (e) {
      console.error("Delete error", e);
      alert("Terjadi kesalahan sistem.");
    }
  };

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
      className={inter.className}
      style={{ position: "relative", borderRadius: "16px", transition: "transform 0.2s", transform: hovered ? "translateY(-2px)" : "translateY(0)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={VECTOR21_B64} alt="" aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, width: "150px", height: "auto", pointerEvents: "none", zIndex: 4, borderBottomLeftRadius: "16px", borderTopLeftRadius: "16px", opacity: 0.1 }} />
      
      <div className={`flex items-stretch rounded-[16px] overflow-hidden min-h-[120px] relative z-[1] transition-all ${hovered ? 'shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-none -translate-y-0.5' : 'shadow-[0_1px_6px_rgba(0,0,0,0.05)] dark:shadow-none transform-none'} bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800`}>
        {/* Left Icon Section - Matched with Student Style */}
        <div 
          className="flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors"
          style={{ width: "120px", minWidth: "120px", flexShrink: 0 }}
        >
          <div 
            className="text-4xl transform transition-transform duration-500"
            style={{ 
              textShadow: `0 10px 20px ${config.color}33`,
              transform: hovered ? "scale(1.2)" : "scale(1)"
            }}
          >
            {config.icon}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex items-center px-8 py-5 relative overflow-hidden">
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="flex items-center gap-3 mb-1.5">
              <span 
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{ backgroundColor: `${config.color}15`, color: config.color }}
              >
                {config.label}
              </span>
              {item.tahunAjaran && (
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 tracking-wider">TA {item.tahunAjaran}</span>
              )}
            </div>
            <h3 className="m-0 text-[20px] font-extrabold text-slate-800 dark:text-slate-100 leading-[1.3] group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            {item.subtitle && <p className="mt-1 mb-0 text-[14px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">{item.subtitle}</p>}
          </div>
        </div>

        {/* Actions Section */}
        <div className="px-7 flex items-center gap-2.5 shrink-0 border-l border-slate-50 dark:border-slate-800">
          <button 
            onClick={handleDelete}
            style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", 
              backgroundColor: "#FEE2E2", color: "#EF4444", borderRadius: "10px", border: "none", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#FECACA"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FEE2E2"}
            title="Hapus"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>

          <Link 
            href={getEditUrl()}
            style={{ 
              display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", 
              backgroundColor: "#FEF3C7", color: "#D97706", borderRadius: "10px", border: "none", cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#FDE68A"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#FEF3C7"}
            title="Edit"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </Link>

          <Link 
            href={item.href} 
            style={{ 
              display: "inline-block", padding: "10px 24px", backgroundColor: "#2196F3", color: "#FFFFFF", 
              borderRadius: "12px", fontWeight: 800, fontSize: "14px", textDecoration: "none", whiteSpace: "nowrap", 
              boxShadow: hovered ? "0 8px 20px rgba(33,150,243,0.4)" : "0 4px 12px rgba(33,150,243,0.2)", 
              transition: "all 0.3s"
            }}
          >
            Buka
          </Link>
        </div>
      </div>
    </div>
  );
}
