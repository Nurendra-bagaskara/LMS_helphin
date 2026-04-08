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
  BookOpen,
  ChevronRight,
  Info,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertCircle,
  Rewind,
  FastForward
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

export default function StudentVideoDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

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
  }, [id]);

  const fetchVideo = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8000/api/videos/${id}`, {
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
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8000/api/videos/${id}/chapters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const sortedChapters = data.data.sort((a: Chapter, b: Chapter) =>
          parseTimeToSeconds(a.time) - parseTimeToSeconds(b.time)
        );
        setChapters(sortedChapters);
      }
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

  const handleSkipBackward = () => {
    if (playerRef.current) {
      const newTime = Math.max(0, playerRef.current.getCurrentTime() - 5);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const handleSkipForward = () => {
    if (playerRef.current) {
      const newTime = Math.min(duration, playerRef.current.getCurrentTime() + 5);
      playerRef.current.seekTo(newTime, true);
      setCurrentTime(newTime);
    }
  };

  const getActiveChapterIndex = (): number => {
    let activeIdx = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (currentTime >= parseTimeToSeconds(chapters[i].time)) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  };

  const loadYouTubeAPI = (embedUrl: string) => {
    if (!embedUrl) return;
    const videoId = embedUrl.split("/").pop();
    if (!videoId) return;

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
      height: '100%', width: '100%', videoId: videoId,
      playerVars: { autoplay: 0, controls: 0, rel: 0, modestbranding: 1, showinfo: 0, iv_load_policy: 3, disablekb: 1, fs: 0 },
      events: {
        onReady: (event: any) => setDuration(event.target.getDuration()),
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            startTimer();
          } else {
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
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
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
    if (isMuted) { playerRef.current.unMute(); setIsMuted(false); }
    else { playerRef.current.mute(); setIsMuted(true); }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value);
    setVolume(v);
    if (playerRef.current) { playerRef.current.setVolume(v); setIsMuted(v === 0); }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) { playerContainerRef.current.requestFullscreen(); setIsFullscreen(true); }
    else { document.exitFullscreen(); setIsFullscreen(false); }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = (currentTime / (duration || 1)) * 100;

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-300">
      <div className="w-12 h-12 border-4 border-blue-100 dark:border-slate-800 border-t-blue-500 rounded-full animate-spin" />
    </div>
  );

  if (error || !video) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-10 rounded-[32px] shadow-xl dark:shadow-black/50 border border-slate-100 dark:border-slate-800 max-w-md">
        <Info size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold dark:text-slate-100 mb-4">{error || "Video tidak ditemukan"}</h2>
        <button onClick={() => router.back()} className="px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors">Kembali</button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 ${inter.className} pb-10 flex flex-col transition-colors duration-300`}>
      <header className="px-6 py-8 max-w-[1400px] mx-auto w-full">
        <div className="flex flex-wrap items-center gap-2 mb-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
          <Link href="/student/mata-kuliah">Mata Kuliah</Link><ChevronRight size={12} />
          <Link href={`/student/mata-kuliah/${video.mataKuliahId}`}>{video.mataKuliahName}</Link><ChevronRight size={12} />
          <span className="text-blue-500">Smart Video</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm text-slate-600 dark:text-slate-400 hover:text-blue-500 transition-all"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{video.title}</h1>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 font-medium">
          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-tighter">
            {video.uploaderName?.split(" ").map(n => n[0]).join("").substring(0, 2) || "HA"}
          </div>
          <span className="font-bold text-slate-700 dark:text-slate-300">{video.uploaderName || "Dosen Pengampu"}</span>
          <span className="mx-2 text-slate-300 dark:text-slate-700">|</span><span className="dark:text-slate-500">Diupload 2 hari yang lalu</span>
        </div>
      </header>

      <main className="px-6 flex-1 max-w-[1400px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div ref={playerContainerRef} className="bg-slate-900 rounded-[32px] overflow-hidden relative group ring-8 ring-white dark:ring-slate-900 shadow-xl shadow-blue-100/50 dark:shadow-black/50">
            <div className="aspect-video relative bg-black flex items-center justify-center">
              <div id="helphin-player" className="w-full h-full pointer-events-none" />
              <div className="absolute inset-0 z-10 cursor-pointer" onClick={togglePlay} />
              {!isPlaying && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-110">
                    <Play size={32} className="text-white fill-white translate-x-1" />
                  </div>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 z-30 p-6 pt-20 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                <input
                  type="range" min="0" max={duration || 100} value={currentTime} onChange={handleSeek}
                  className="w-full h-1.5 mb-4 cursor-pointer accent-transparent"
                  style={{ background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progressPercent}%, rgba(255, 255, 255, 0.2) ${progressPercent}%, rgba(255, 255, 255, 0.2) 100%)` }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-white">
                    {/* BUTTON SKIP BACKWARD */}
                    <button onClick={handleSkipBackward} className="w-8 h-8 flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:scale-110 transition-all" title="Mundur 5 detik">
                      <Rewind size={20} fill="currentColor" />
                    </button>

                    {/* BUTTON PLAY/PAUSE */}
                    <button onClick={togglePlay} className="w-10 h-10 flex items-center justify-center text-white hover:scale-110 transition-all">
                      {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                    </button>

                    {/* BUTTON SKIP FORWARD */}
                    <button onClick={handleSkipForward} className="w-8 h-8 flex items-center justify-center text-white opacity-70 hover:opacity-100 hover:scale-110 transition-all" title="Maju 5 detik">
                      <FastForward size={20} fill="currentColor" />
                    </button>

                    <span className="text-xs font-bold ml-2 text-slate-100">{formatTime(currentTime)} / {formatTime(duration)}</span>
                  </div>

                  <div className="flex items-center gap-6 text-white">
                    {/* BUTTON VOLUME (Styling Baru: Lingkaran Oranye) */}
                    <button
                      onClick={toggleMute}
                      className="p-2 bg-orange-100 text-orange-600 rounded-full hover:bg-orange-200 transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>

                    {/* BUTTON FULLSCREEN (Styling Baru: Lingkaran Biru) */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                    >
                      {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[24px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Deskripsi Materi</h2>
            <div className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium whitespace-pre-line">{video.description}</div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 leading-tight">Navigasi Video (Chapter)</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Klik timestamp untuk berpindah menit</p>
              <div className="h-[1px] bg-slate-100 dark:bg-slate-800 w-full mt-4" />
            </div>
            <div className="flex flex-col gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {chapters.length > 0 ? chapters.map((ch, idx) => {
                const isActive = getActiveChapterIndex() === idx;
                return (
                  <button
                    key={ch.id}
                    onClick={() => seekToChapter(ch.time)}
                    className={`w-full text-left px-5 py-4 rounded-xl transition-all duration-300 group relative shrink-0 border-l-4 ${isActive ? 'bg-[#E3F2FD] dark:bg-blue-900/30 border-[#008CFF] shadow-sm' : 'bg-[#F4F9FF] dark:bg-slate-800/50 border-transparent hover:bg-[#EBF5FF] dark:hover:bg-slate-800'}`}
                  >
                    <div className={`text-xs font-black mb-1 ${isActive ? 'text-[#008CFF]' : 'text-slate-400 dark:text-slate-500'}`}>{ch.time}</div>
                    <div className={`text-sm font-bold leading-snug ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{ch.title}</div>
                  </button>
                );
              }) : <p className="text-center text-slate-400 text-xs py-4 italic">Tidak ada navigasi chapter</p>}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Info size={16} className="text-blue-500" /> Informasi</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800/50">
                  <Calendar size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Tahun Ajaran</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{video.tahunAjaran}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800/50">
                  <BookOpen size={14} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Mata Kuliah</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{video.mataKuliahName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-auto px-6"><FooterDashboard /></div>

      <style jsx global>{`
        input[type='range'] { -webkit-appearance: none; appearance: none; border-radius: 10px; }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none; width: 14px; height: 14px; background: #3b82f6; border-radius: 50%; cursor: pointer; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
}