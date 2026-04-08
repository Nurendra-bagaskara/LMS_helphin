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
  Video, 
  ChevronRight,
  Clock,
  Info,
  ShieldCheck,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Edit,
  List
} from "lucide-react";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const inter = Inter({ subsets: ["latin"] });

interface VideoDetail {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  embedUrl: string;
  type: string;
  tahunAjaran: string;
  mataKuliahId: string;
  mataKuliahName: string;
  uploaderName: string;
  prodiName: string;
  createdAt: string;
}

interface Chapter {
  id: string;
  time: string;
  title: string;
  sortOrder: number;
}

export default function AdminVideoDetail() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const videoId = params?.videoId as string;

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

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

  useEffect(() => {
    fetchVideo();
    fetchChapters();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [videoId]);

  const fetchVideo = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/videos/${videoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setVideo(data.data);
        loadYouTubeAPI(data.data.embedUrl);
      } else {
        setError(data.message || "Gagal mengambil data video");
      }
    } catch (e) {
      console.error("Failed to fetch video", e);
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch(`http://localhost:8000/api/videos/${videoId}/chapters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setChapters(data.data);
    } catch (e) {
      console.error("Failed to fetch chapters", e);
    }
  };

  const parseTimeToSeconds = (time: string): number => {
    const parts = time.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
  };

  const seekToChapter = (time: string) => {
    const seconds = parseTimeToSeconds(time);
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      playerRef.current.playVideo();
    }
  };

  const getActiveChapterIndex = (): number => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= parseTimeToSeconds(chapters[i].time)) return i;
    }
    return 0;
  };

  const loadYouTubeAPI = (embedUrl: string) => {
    if (!embedUrl) return;
    const yId = embedUrl.split("/").pop();
    if (!yId) return;

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => initializePlayer(yId);
    } else {
      initializePlayer(yId);
    }
  };

  const initializePlayer = (id: string) => {
    playerRef.current = new window.YT.Player('helphin-player-admin', {
      height: '100%',
      width: '100%',
      videoId: id,
      playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, showinfo: 0, iv_load_policy: 3, disablekb: 1, fs: 0 },
      events: {
        onReady: (event: any) => setDuration(event.target.getDuration()),
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTimer();
          } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
            stopTimer();
          }
        },
      },
    });
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (playerRef.current?.getCurrentTime) setCurrentTime(playerRef.current.getCurrentTime());
    }, 500);
  };
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const togglePlay = () => {
    if (!playerRef.current) return;
    isPlaying ? playerRef.current.pauseVideo() : playerRef.current.playVideo();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    playerRef.current?.seekTo(time, true);
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    isMuted ? (playerRef.current.unMute(), setIsMuted(false)) : (playerRef.current.mute(), setIsMuted(true));
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    if (playerRef.current) {
      playerRef.current.setVolume(v);
      v === 0 ? setIsMuted(true) : (playerRef.current.unMute(), setIsMuted(false));
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    document.fullscreenElement ? (document.exitFullscreen(), setIsFullscreen(false)) : (playerContainerRef.current.requestFullscreen(), setIsFullscreen(true));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-[#F8FBFF] dark:bg-slate-950 flex items-center justify-center ${inter.className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold text-sm tracking-wide">Mempersiapkan Helphin Player...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className={`min-h-screen bg-[#F8FBFF] dark:bg-slate-950 flex items-center justify-center ${inter.className}`}>
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-2xl shadow-slate-200/50 border border-slate-100 dark:border-slate-800 text-center max-w-md mx-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500"><Info size={40} /></div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2 tracking-tight">VIDEO TIDAK TERSEDIA</h2>
          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-8 font-medium leading-relaxed">{error || "Video pembelajaran tidak ditemukan."}</p>
          <button onClick={() => router.back()} className="w-full py-4 bg-slate-800 dark:bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#F8FBFF] dark:bg-slate-950 ${inter.className} pb-10 flex flex-col`}>
      <header className="px-6 py-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-6 text-[10px] font-black text-slate-400 dark:text-slate-500 tracking-widest uppercase">
          <Link href="/admin/mata-kuliah" className="hover:text-blue-500 transition-colors">Manajemen MK</Link>
          <ChevronRight size={14} className="opacity-50" />
          <Link href={`/admin/mata-kuliah/${courseId}`} className="hover:text-blue-500 transition-colors">{video.mataKuliahName}</Link>
          <ChevronRight size={14} className="opacity-50" />
          <span className="text-blue-500 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md">Pratinjau Video</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <button 
                onClick={() => router.back()}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 hover:text-blue-500 transition-all"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm dark:shadow-none border border-blue-200">
                Admin Panel / Video Player
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-800 dark:text-slate-100 tracking-tighter leading-none mb-1">{video.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/admin/mata-kuliah/${courseId}/video/edit/${videoId}`}
              className="flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-sm shadow-sm dark:shadow-none hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 transition-all"
            >
              <Edit size={20} />
              Edit File Video
            </Link>
          </div>
        </div>
      </header>

      <main className="px-6 flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div 
             ref={playerContainerRef}
             className="bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden relative group ring-8 ring-white shadow-blue-100/50"
          >
            <div className="aspect-video relative overflow-hidden bg-black flex items-center justify-center">
              <div id="helphin-player-admin" className="w-full h-full pointer-events-none" />
              <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay}>
                <div className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2.5 bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                   <ShieldCheck size={16} className="text-blue-400" />
                   <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Admin Monitoring Mode</span>
                </div>
              </div>
              {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/30">
                   <div className="w-24 h-24 bg-white dark:bg-slate-900/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 shadow-2xl animate-pulse">
                      <Play size={40} className="text-white fill-white translate-x-1" />
                   </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 px-8 pb-8 pt-24 bg-gradient-to-t from-black/95 via-black/40 to-transparent">
                  <div className="relative mb-6 px-1">
                    <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek} className="w-full h-1.5 bg-white dark:bg-slate-900/20 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:h-2.5 transition-all" />
                    <div className="absolute left-1 top-[4px] h-1.5 bg-blue-500 rounded-l-lg pointer-events-none" style={{ width: `calc(${currentTime / (duration || 1) * 100}% - 8px)` }} />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5">
                      <button onClick={togglePlay} className="w-12 h-12 flex items-center justify-center text-white hover:scale-110 transition-all focus:outline-none">
                        {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                      </button>
                      <div className="text-xs font-black text-white tracking-widest flex items-center gap-2 opacity-80 uppercase leading-none">
                        <span>{formatTime(currentTime)}</span>
                        <span className="opacity-40">/</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-4">
                        <button onClick={toggleMute} className="text-white/70 hover:text-white transition-opacity focus:outline-none">{isMuted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}</button>
                        <input type="range" min="0" max="100" value={volume} onChange={handleVolume} className="w-24 h-1.5 bg-white dark:bg-slate-900/20 rounded-lg appearance-none cursor-pointer accent-white" />
                      </div>
                      <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-opacity p-2 focus:outline-none">{isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}</button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-10 shadow-xl shadow-slate-200/30">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2.5 h-10 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Deskripsi Video</h2>
            </div>
            <div className="prose prose-slate max-w-none text-slate-600 dark:text-slate-300 font-medium leading-relaxed text-lg">
              {video.description || "Video ini memberikan penjelasan mendalam. Selamat menyaksikan!"}
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          {/* ── NAVIGASI VIDEO (CHAPTER) ── */}
          {chapters.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-2xl shadow-slate-200/50 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <List size={20} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100 leading-tight">Navigasi Video (Chapter)</h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">Klik timestamp untuk berpindah menit</p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {chapters.map((ch, idx) => {
                  const isActive = getActiveChapterIndex() === idx;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => seekToChapter(ch.time)}
                      className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all duration-200 group/ch hover:bg-blue-50 ${
                        isActive
                          ? 'border-blue-400 bg-blue-50/80 shadow-sm dark:shadow-none shadow-blue-100'
                          : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 hover:border-blue-200'
                      }`}
                    >
                      <div className={`text-xs font-black tracking-wider mb-0.5 ${
                        isActive ? 'text-blue-500' : 'text-slate-400 dark:text-slate-500 group-hover/ch:text-blue-400'
                      }`}>
                        {ch.time}
                      </div>
                      <div className={`text-sm font-bold leading-snug ${
                        isActive ? 'text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {ch.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── INFORMASI TEKNIS ── */}
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 p-10 shadow-2xl shadow-slate-200/30 flex flex-col sticky top-10">
             <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-10 flex items-center gap-2 uppercase tracking-tight"><Info size={20} className="text-blue-500" /> Informasi Teknis</h3>
            <div className="space-y-8">
              {[
                { icon: <Calendar />, label: "Tahun Ajaran", value: video.tahunAjaran, color: "blue" },
                { icon: <User />, label: "Pengunggah", value: video.uploaderName || "Dosen Prodi", color: "emerald" },
                { icon: <BookOpen />, label: "Mata Kuliah", value: video.mataKuliahName, color: "purple" },
                { icon: <Clock />, label: "Tgl Unggah", value: new Date(video.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }), color: "orange" }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-5 p-2 hover:bg-slate-50 dark:bg-slate-800 dark:bg-slate-900/50 transition-colors rounded-3xl group">
                  <div className={`w-14 h-14 rounded-2xl bg-${item.color}-50 text-${item.color}-500 flex items-center justify-center shrink-0 border border-${item.color}-100/50 shadow-sm dark:shadow-none group-hover:scale-110 transition-transform`}>
                    {React.isValidElement(item.icon) ? React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 }) : item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 opacity-70">{item.label}</div>
                    <div className="text-base font-black text-slate-700 dark:text-slate-200 leading-tight">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
               <button onClick={() => router.back()} className="w-full py-5 bg-slate-100 dark:bg-slate-800 dark:bg-slate-900 text-slate-600 dark:text-slate-300 rounded-[28px] font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-all">Kembali Ke Topik</button>
            </div>
          </div>
        </div>
      </main>
      <div className="mt-auto px-6"><FooterDashboard /></div>
      <style jsx global>{`
        input[type='range']::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #3b82f6; cursor: pointer; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5); transition: scale 0.2s; }
        input[type='range']::-webkit-slider-thumb:hover { scale: 1.2; }
      `}</style>
    </div>
  );
}
