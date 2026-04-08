"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

interface Chapter {
    id: string;
    timestamp: string;   // "00:00", "05:12", dll
    timestampSec: number; // dalam detik untuk seek
    title: string;
}

interface SmartVideoData {
    id: string;
    title: string;
    instructor: string;
    instructorInitials: string;
    uploadedAt: string;
    description: string;
    videoUrl: string;     // URL video (bisa YouTube embed atau file langsung)
    chapters: Chapter[];
}

// Data statis contoh — diganti API bila tersedia
const STATIC_VIDEOS: Record<string, SmartVideoData> = {
    t3: {
        id: "t3",
        title: "Integral Ganda: Konsep dan Aplikasi Dasar",
        instructor: "Hendra Akbar, S.T., M.T.",
        instructorInitials: "HA",
        uploadedAt: "2 hari yang lalu",
        description:
            "Materi ini membahas konsep dasar integral ganda sebagai perluasan dari integral tunggal pada fungsi dua variabel. Integral ganda digunakan untuk menganalisis besaran yang bergantung pada dua variabel dan diterapkan pada daerah dua dimensi. Pembahasan meliputi pengertian integral ganda, makna geometrisnya sebagai perhitungan volume di bawah suatu permukaan, serta cara menentukan daerah integrasi dan urutan integrasi yang tepat. Selain itu, materi ini memperkenalkan aplikasi dasar integral ganda dalam kehidupan nyata, seperti perhitungan luas daerah, volume benda, massa dengan kerapatan tertentu, dan penerapannya dalam bidang sains dan teknik.",
        videoUrl: "",   // kosong = tampilkan placeholder
        chapters: [
            { id: "c1", timestamp: "00:00", timestampSec: 0, title: "Pendahuluan & Review" },
            { id: "c2", timestamp: "05:12", timestampSec: 312, title: "Konsep Integral Lipat Dua" },
            { id: "c3", timestamp: "15:45", timestampSec: 945, title: "Perhitungan Area Luas" },
            { id: "c4", timestamp: "32:20", timestampSec: 1940, title: "Pembahasan Soal UTS 2023" },
        ],
    },
};

export default function SmartVideoPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const matkulId = searchParams.get("matkulId") ?? "";
    const topikId = searchParams.get("topikId") ?? "";

    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoData, setVideoData] = useState<SmartVideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeChapter, setActiveChapter] = useState<string>("c1");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(2700); // 45:00 default
    const [volume, setVolume] = useState(1);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showReport, setShowReport] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accessToken");

        const fetchVideo = async () => {
            try {
                const res = await fetch(
                    `http://localhost:8000/api/smart-video/${topikId}`,
                    { headers: { Authorization: `Bearer ${token ?? ""}` } }
                );
                const data = await res.json();
                if (data.success && data.data) {
                    setVideoData(data.data);
                } else {
                    setVideoData(STATIC_VIDEOS[topikId] ?? STATIC_VIDEOS["t3"]);
                }
            } catch {
                setVideoData(STATIC_VIDEOS[topikId] ?? STATIC_VIDEOS["t3"]);
            } finally {
                setLoading(false);
            }
        };

        if (topikId) {
            fetchVideo();
        } else {
            setVideoData(STATIC_VIDEOS["t3"]);
            setLoading(false);
        }
    }, [topikId]);

    // ── Helpers ──────────────────────────────────────────
    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const seekTo = (sec: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = sec;
            setCurrentTime(sec);
        } else {
            // Simulasi saat tidak ada video nyata
            setCurrentTime(sec);
        }
        // Tandai chapter aktif
        if (videoData) {
            const active = [...videoData.chapters]
                .reverse()
                .find(c => c.timestampSec <= sec);
            if (active) setActiveChapter(active.id);
        }
    };

    const togglePlay = () => setIsPlaying(p => !p);

    const toggleVolume = () => {
        const newVol = volume === 0 ? 1 : 0;
        setVolume(newVol);
        if (videoRef.current) videoRef.current.volume = newVol;
    };

    const cyclePlaybackRate = () => {
        const rates = [0.5, 1, 1.25, 1.5, 2];
        const next = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
        setPlaybackRate(next);
        if (videoRef.current) videoRef.current.playbackRate = next;
    };

    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (loading) {
        return (
            <div className="flex flex-col gap-6 mt-2">
                <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                <div className="aspect-video bg-gray-200 rounded-2xl animate-pulse" />
                <div className="h-6 w-64 bg-gray-200 rounded animate-pulse" />
                <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
            </div>
        );
    }

    if (!videoData) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-500 font-medium">Video tidak ditemukan.</p>
                <button onClick={() => router.back()} className="mt-4 px-5 py-2.5 bg-[#068DFF] text-white rounded-xl text-sm font-semibold">
                    Kembali
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 mt-2 pb-4">

            {/* ── Back button ── */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium transition-colors w-fit"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Kembali
            </button>

            {/* ── Main layout: video + sidebar ── */}
            <div className="flex gap-5 items-start">

                {/* ════ LEFT: Video Player ════ */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">

                    {/* Video container */}
                    <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl group" style={{ aspectRatio: "16/9" }}>

                        {videoData.videoUrl ? (
                            <video
                                ref={videoRef}
                                src={videoData.videoUrl}
                                className="w-full h-full object-cover"
                                onTimeUpdate={(e) => {
                                    const t = e.currentTarget.currentTime;
                                    setCurrentTime(t);
                                    if (videoData) {
                                        const active = [...videoData.chapters].reverse().find(c => c.timestampSec <= t);
                                        if (active) setActiveChapter(active.id);
                                    }
                                }}
                                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                            />
                        ) : (
                            /* Placeholder saat tidak ada video nyata */
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                <div className="flex flex-col items-center gap-3 text-white/40">
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                        <rect x="2" y="2" width="20" height="20" rx="4" />
                                        <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                                    </svg>
                                    <span className="text-sm">Tidak ada sumber video</span>
                                </div>
                            </div>
                        )}

                        {/* ── Custom Controls overlay ── */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">

                            {/* Progress bar */}
                            <div
                                className="w-full h-1.5 bg-white/30 rounded-full mb-3 cursor-pointer relative"
                                onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const pct = (e.clientX - rect.left) / rect.width;
                                    seekTo(pct * duration);
                                }}
                            >
                                <div
                                    className="h-full bg-[#068DFF] rounded-full relative"
                                    style={{ width: `${progressPct}%` }}
                                >
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                                </div>
                            </div>

                            {/* Controls row */}
                            <div className="flex items-center gap-3 text-white">
                                {/* Play/Pause */}
                                <button onClick={togglePlay} className="hover:text-[#068DFF] transition-colors">
                                    {isPlaying ? (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="6" y="4" width="4" height="16" rx="1" />
                                            <rect x="14" y="4" width="4" height="16" rx="1" />
                                        </svg>
                                    ) : (
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                    )}
                                </button>

                                {/* Skip forward */}
                                <button onClick={() => seekTo(Math.min(currentTime + 10, duration))} className="hover:text-[#068DFF] transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polygon points="5 4 15 12 5 20 5 4" />
                                        <line x1="19" y1="5" x2="19" y2="19" />
                                    </svg>
                                </button>

                                {/* Volume */}
                                <button onClick={toggleVolume} className="hover:text-[#068DFF] transition-colors">
                                    {volume === 0 ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <line x1="23" y1="9" x2="17" y2="15" />
                                            <line x1="17" y1="9" x2="23" y2="15" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                        </svg>
                                    )}
                                </button>

                                {/* Time display */}
                                <span className="text-xs font-mono ml-1">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>

                                <div className="flex-1" />

                                {/* Playback rate */}
                                <button
                                    onClick={cyclePlaybackRate}
                                    className="text-xs font-bold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded transition-colors"
                                >
                                    {playbackRate}x
                                </button>

                                {/* Subtitles */}
                                <button className="hover:text-[#068DFF] transition-colors">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" />
                                        <path d="M7 12h10M7 16h6" />
                                    </svg>
                                </button>

                                {/* Fullscreen */}
                                <button
                                    onClick={() => videoRef.current?.requestFullscreen?.()}
                                    className="hover:text-[#068DFF] transition-colors"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Video title & meta ── */}
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-snug">{videoData.title}</h1>
                        <div className="flex items-center gap-3 mt-2">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#068DFF] to-[#0055FF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {videoData.instructorInitials}
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{videoData.instructor}</span>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-400">Diupload {videoData.uploadedAt}</span>
                        </div>
                    </div>

                    {/* ── Deskripsi Materi ── */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                        <h2 className="text-sm font-bold text-gray-700 mb-3">Deskripsi Materi</h2>
                        <p className="text-sm text-gray-600 leading-relaxed">{videoData.description}</p>
                    </div>

                    {/* ── Lapor tombol ── */}
                    <div
                        className="flex items-center justify-between px-5 py-4 rounded-2xl cursor-pointer hover:shadow-md transition-all duration-200"
                        style={{ background: "linear-gradient(90deg, #FFF8E1 0%, #FFF3CD 100%)", border: "1.5px solid #FFD600" }}
                        onClick={() => setShowReport(true)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <span className="text-sm font-semibold text-yellow-800">Materi kurang jelas atau error?</span>
                        </div>
                        <span className="px-4 py-1.5 bg-[#068DFF] text-white text-xs font-bold rounded-lg">LAPOR</span>
                    </div>

                    {/* ── Report modal ── */}
                    {showReport && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowReport(false)}>
                            <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                                <h3 className="font-bold text-gray-900 mb-2">Laporkan Masalah</h3>
                                <p className="text-sm text-gray-500 mb-4">Ceritakan masalah yang kamu temukan pada materi ini.</p>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#068DFF]/40"
                                    rows={4}
                                    placeholder="Tuliskan detail masalahnya..."
                                />
                                <div className="flex gap-3 mt-4">
                                    <button onClick={() => setShowReport(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                        Batal
                                    </button>
                                    <button onClick={() => setShowReport(false)} className="flex-1 py-2.5 bg-[#068DFF] text-white rounded-xl text-sm font-semibold hover:bg-[#0055FF]">
                                        Kirim Laporan
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ════ RIGHT: Chapter Navigation ════ */}
                <div className="w-64 flex-shrink-0 flex flex-col gap-3">
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        {/* Header */}
                        <div className="px-5 pt-5 pb-3 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900 text-sm">Navigasi Video (Chapter)</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Klik timestamp untuk berpindah menit</p>
                        </div>

                        {/* Chapter list */}
                        <div className="flex flex-col">
                            {videoData.chapters.map((ch) => {
                                const isActive = activeChapter === ch.id;
                                return (
                                    <button
                                        key={ch.id}
                                        onClick={() => {
                                            setActiveChapter(ch.id);
                                            seekTo(ch.timestampSec);
                                        }}
                                        className={`flex flex-col gap-0.5 px-5 py-4 text-left transition-colors border-l-4 ${isActive
                                                ? "bg-[#EFF6FF] border-l-[#068DFF]"
                                                : "border-l-transparent hover:bg-gray-50"
                                            }`}
                                    >
                                        <span className={`text-xs font-bold ${isActive ? "text-[#068DFF]" : "text-gray-400"}`}>
                                            {ch.timestamp}
                                        </span>
                                        <span className={`text-sm font-semibold leading-snug ${isActive ? "text-[#1565C0]" : "text-gray-700"}`}>
                                            {ch.title}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            <FooterDashboard />
        </div>
    );
}