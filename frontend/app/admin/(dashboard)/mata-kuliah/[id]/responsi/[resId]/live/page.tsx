"use client";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import { 
  ArrowLeft, 
  Play, 
  Pause,
  Calendar, 
  User, 
  BookOpen, 
  ChevronRight,
  Info,
  ShieldCheck,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Rewind,
  FastForward,
  MessageCircle
} from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";
import { API_URL } from "@/lib/api";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const inter = Inter({ subsets: ["latin"] });

interface ResponsiDetail {
  id: string;
  title: string;
  description: string;
  speaker: string;
  scheduleDate: string;
  meetingLink: string;
  mataKuliahId: string;
  mataKuliahName: string;
  prodiName: string;
  liveChatLink: string;
  uploaderName?: string;
}

export default function AdminLiveResponsiDetail() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const resId = params?.resId as string;

  const [responsi, setResponsi] = useState<ResponsiDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player State
  const playerRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const baseTimeRef = useRef(Date.now());
  const baseDurationRef = useRef(0);

  useEffect(() => {
    fetchResponsi();
    
    // Track fullscreen changes (e.g., ESC key press)
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [resId]);

  const fetchResponsi = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
          router.push("/login"); // Admin might want to login if token is gone
          return;
      }

      const res = await fetch(`${API_URL}/api/responsi/${resId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setResponsi(data.data);
        if (data.data.meetingLink) {
           loadYouTubeAPI(data.data.meetingLink);
        } else {
           setError("Link live streaming belum tersedia.");
        }
      } else {
        setError(data.message || "Gagal mengambil data responsi");
      }
    } catch (e) {
      console.error("Failed to fetch responsi", e);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const loadYouTubeAPI = (url: string) => {
    if (!url) return;

    // Ekstrak Video ID dari berbagai format YouTube
    let videoId = "";
    if (url.includes("youtu.be/")) {
        videoId = url.split("youtu.be/")[1]?.split("?")[0];
    } else if (url.includes("v=")) {
        videoId = url.split("v=")[1]?.split("&")[0];
    } else if (url.includes("youtube.com/live/")) {
        videoId = url.split("youtube.com/live/")[1]?.split("?")[0];
    }

    if (!videoId) {
        setError("Format link live streaming tidak valid. Harus menggunakan link YouTube.");
        return;
    }

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => initializePlayer(videoId);
    } else {
      initializePlayer(videoId);
    }
  };

  const initializePlayer = (videoId: string) => {
    playerRef.current = new window.YT.Player('helphin-player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        showinfo: 0,
        iv_load_policy: 3,
        disablekb: 1,
        fs: 0,
      },
      events: {
        onReady: (event: any) => {
          const d = event.target.getDuration() || 0;
          setDuration(d);
          baseDurationRef.current = d;
          baseTimeRef.current = Date.now();
          event.target.playVideo(); 
          startTimer(); 
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
          }
        },
      },
    });
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
        if (playerRef.current.getDuration) {
          const currentDur = playerRef.current.getDuration() || 0;
          setDuration(currentDur);
          if (currentDur > baseDurationRef.current + 5) {
             baseDurationRef.current = currentDur;
             baseTimeRef.current = Date.now();
          }
        }
      }
    }, 500);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleRewind5s = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      const newTime = Math.max(0, currentTime - 5);
      playerRef.current.seekTo(newTime, true);
    }
  };

  const handleForward5s = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (playerRef.current) {
      const newTime = currentTime + 5;
      playerRef.current.seekTo(newTime, true);
    }
  };

  const togglePlay = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const estimatedLiveEdge = baseDurationRef.current + ((Date.now() - baseTimeRef.current) / 1000);
  const isAtLiveEdge = Math.abs(estimatedLiveEdge - currentTime) <= 3;

  const handleGoToLive = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(999999, true); 
      if (!isPlaying) {
        playerRef.current.playVideo();
      }
      setTimeout(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
           baseDurationRef.current = playerRef.current.getCurrentTime() || 0;
           baseTimeRef.current = Date.now();
        }
      }, 1500);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-[calc(100vh-200px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 dark:border-slate-800 border-t-red-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm tracking-wide">Mempersiapkan Live Player...</p>
        </div>
      </div>
    );
  }

  if (error || !responsi) {
    return (
      <div className={`min-h-[calc(100vh-200px)] bg-slate-50 dark:bg-slate-950 flex items-center justify-center ${inter.className} transition-colors duration-300`}>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800 text-center max-w-md mx-6">
          <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
            <Info size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">SIARAN TIDAK TERSEDIA</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">{error || "Live stream responsi tidak ditemukan."}</p>
          <button onClick={() => router.back()} className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Kembali
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${inter.className} pb-10 flex flex-col transition-colors duration-300`}>
      {/* ── BREADCRUMB & HEADER ── */}
      <header className="px-6 py-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-6 text-[10px] sm:text-xs font-black text-slate-400 tracking-widest uppercase">
          <Link href="/admin/mata-kuliah" className="hover:text-red-500 transition-colors">Manajemen MK</Link>
          <ChevronRight size={14} className="opacity-50" />
          <Link href={`/admin/mata-kuliah/${courseId}`} className="hover:text-red-500 transition-colors">{responsi.mataKuliahName}</Link>
          <ChevronRight size={14} className="opacity-50" />
          <Link href={`/admin/mata-kuliah/${courseId}/responsi/${resId}`} className="hover:text-red-500 transition-colors">Monitoring Responsi</Link>
          <ChevronRight size={14} className="opacity-50" />
          <span className="text-red-500 font-extrabold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md animate-pulse">Live Stream</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm border border-red-200 dark:border-red-900/50">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                Admin Player Control
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-1">
                Responsi {responsi.mataKuliahName}
            </h1>
          </div>
        </div>
      </header>

      {/* ── CONTENT AREA ── */}
      <main className="px-6 flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* ────── HELPHIN CUSTOM PLAYER ────── */}
          <div 
             ref={playerContainerRef}
             className={`bg-slate-900 overflow-hidden relative group ${isFullscreen ? 'w-full h-full' : 'rounded-[32px] border border-slate-800 shadow-2xl ring-4 md:ring-8 ring-white dark:ring-slate-900 shadow-red-200/50 dark:shadow-none'}`}
          >
            <div className={`relative overflow-hidden bg-black flex items-center justify-center ${isFullscreen ? 'w-full h-full' : 'aspect-video'}`}>
              <div id="helphin-player" className="w-full h-full pointer-events-none" />

              <div 
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={togglePlay} 
              >
                <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ShieldCheck size={14} className="text-red-400" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Admin Live Secure</span>
                </div>
              </div>

              {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-sm">
                   <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl scale-110">
                      <Play size={40} className="text-white fill-white translate-x-1" />
                   </div>
                </div>
              )}

              {/* ────── CUSTOM CONTROL BAR ────── */}
              <div className="absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 px-6 pb-6 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <button onClick={handleRewind5s} className="w-8 h-8 flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:scale-110 transition-all" title="Mundur 5 detik">
                        <Rewind size={20} fill="currentColor" />
                      </button>

                      <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center text-white hover:scale-110 transition-all">
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                      </button>

                      <button onClick={handleForward5s} className="w-8 h-8 flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:scale-110 transition-all" title="Maju 5 detik">
                        <FastForward size={20} fill="currentColor" />
                      </button>

                      <button 
                        onClick={handleGoToLive}
                        className={`text-[11px] font-black tracking-widest flex items-center gap-1.5 px-2 py-1 rounded-md uppercase transition-all ${
                          isAtLiveEdge 
                            ? "bg-red-500/20 text-red-100" 
                            : "bg-slate-500/20 text-slate-300 hover:bg-slate-500/30"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAtLiveEdge ? "bg-red-500 animate-pulse" : "bg-slate-400"}`}></span>
                        LIVE
                      </button>
                    </div>

                    <div className="flex items-center gap-6">
                      <button onClick={toggleMute} className="w-8 h-8 flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:scale-110 transition-all">
                        {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>

                      <button onClick={toggleFullscreen} className="w-8 h-8 flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:scale-110 transition-all">
                         {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                      </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-10 shadow-xl shadow-slate-200/30 dark:shadow-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-8 bg-red-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Agenda Pembahasan</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
              <p className="font-bold text-lg text-slate-800 dark:text-slate-200 mb-2">{responsi.title}</p>
              {responsi.description || "Sesi tanya jawab khusus materi terkait responsi ini. Persiapkan pertanyaanmu dan ikuti dengan seksama."}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <button
            disabled={!responsi.liveChatLink}
            onClick={() => responsi.liveChatLink && window.open(responsi.liveChatLink, '_blank')}
            className={`w-full py-6 rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-4 group border ${
              responsi.liveChatLink 
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-slate-200 dark:shadow-none hover:bg-slate-800 dark:hover:bg-slate-100 border-slate-800 dark:border-white" 
                : "bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed shadow-none"
            }`}
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform ${
              responsi.liveChatLink ? "bg-white/10 dark:bg-slate-950/10 group-hover:scale-110" : "bg-slate-200 dark:bg-slate-800"
            }`}>
              <MessageCircle size={20} className={responsi.liveChatLink ? "text-red-400" : "text-slate-300 dark:text-slate-700"} />
            </div>
            {responsi.liveChatLink ? "Buka Live Chat" : "Chat Belum Tersedia"}
          </button>

          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 dark:bg-red-900/10 rounded-full opacity-50 group-hover:scale-125 transition-transform duration-700" />
             <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-8 flex items-center gap-2 relative z-10"><Info size={20} className="text-red-500" /> Informasi Siaran</h3>
            <div className="space-y-6 relative z-10">
              {[
                { icon: <User />, label: "Pemateri", value: responsi.speaker || responsi.uploaderName || "Pemateri Prodi", color: "emerald" },
                { icon: <BookOpen />, label: "Mata Kuliah", value: responsi.mataKuliahName, color: "purple" },
                { icon: <Calendar />, label: "Tanggal Responsi", value: new Date(responsi.scheduleDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), color: "blue" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-[24px] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 dark:bg-${item.color}-900/30 text-${item.color}-500 flex items-center justify-center shrink-0`}>
                    {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { size: 22 }) : item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 opacity-70">{item.label}</div>
                    <div className="text-base font-black text-slate-700 dark:text-slate-200">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
               <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-100 dark:border-red-900/40 italic">
                  <p className="text-[11px] font-bold text-red-500/80 dark:text-red-400 ml-1 leading-relaxed">
                    SIARAN LANGSUNG INI EKSKLUSIF HASIL KOLABORASI HELPHIN DENGAN HIMA.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-auto px-6"><FooterDashboard /></div>

    </div>
  );
}
