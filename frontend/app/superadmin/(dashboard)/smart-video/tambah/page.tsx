"use client";
import React, { useState, useRef } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

// ── Inline base64 untuk SVG dekorasi (sama dengan referensi) ──────────────────
const GROUP2_B64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjI3IiBoZWlnaHQ9IjY4NyIgdmlld0JveD0iMCAwIDYyNyA2ODciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYzMS40IiBjeT0iMjQ4IiByPSIyNDMuNSIgc3Ryb2tlPSIjMDY4REZGIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIvPgo8Y2lyY2xlIGN4PSI1NjIuNCIgY3k9IjE4MyIgcj0iMjQzLjUiIHN0cm9rZT0iIzA2OERGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuNCIvPgo8Y2lyY2xlIGN4PSI1ODMuNCIgY3k9IjIxNSIgcj0iMjQzLjUiIHN0cm9rZT0iIzA2OERGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMF9mXzU5XzQ4OSkiPgo8Y2lyY2xlIGN4PSI0ODcuNCIgY3k9IjE5OSIgcj0iMjI4IiBmaWxsPSIjMDY4REZGIiBmaWxsLW9wYWNpdHk9IjAuMjUiLz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9mXzU5XzQ4OSIgeD0iLTkuMTU1MjdlLTA1IiB5PSItMjg4LjQiIHdpZHRoPSI5NzQuOCIgaGVpZ2h0PSI5NzQuOCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJzaGFwZSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxMjkuNyIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzU5XzQ4OSIvPgo8L2ZpbHRlcj4KPC9kZWZzPgo8L3N2Zz4K`;

interface Chapter {
    id: string;
    time: string;
    name: string;
}

interface DropdownOption {
    value: string;
    label: string;
}

const mataKuliahOptions: DropdownOption[] = [
    { value: "kalkulus", label: "Kalkulus" },
    { value: "aljabar", label: "Aljabar Linear" },
    { value: "statistika", label: "Statistika" },
    { value: "pemrograman", label: "Pemrograman Dasar" },
];

const semesterOptions: DropdownOption[] = [
    { value: "1", label: "Semester I" },
    { value: "2", label: "Semester II" },
    { value: "3", label: "Semester III" },
    { value: "4", label: "Semester IV" },
    { value: "5", label: "Semester V" },
    { value: "6", label: "Semester VI" },
];

export default function UploadSmartVideo() {
    const [judulVideo, setJudulVideo] = useState("");
    const [mataKuliah, setMataKuliah] = useState("");
    const [semester, setSemester] = useState("");
    const [videoLink, setVideoLink] = useState("");
    const [thumbnail, setThumbnail] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [chapters, setChapters] = useState<Chapter[]>([
        { id: "1", time: "00:00", name: "Pendahuluan" },
        { id: "2", time: "", name: "" },
    ]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── Thumbnail handlers ──────────────────────────────────────────────────────
    const handleFileChange = (file: File) => {
        if (file && file.size <= 2 * 1024 * 1024) {
            setThumbnail(file);
            const reader = new FileReader();
            reader.onload = (e) => setThumbnailPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    // ── Chapter handlers ────────────────────────────────────────────────────────
    const addChapter = () => {
        setChapters((prev) => [
            ...prev,
            { id: Date.now().toString(), time: "", name: "" },
        ]);
    };

    const removeChapter = (id: string) => {
        setChapters((prev) => prev.filter((c) => c.id !== id));
    };

    const updateChapter = (id: string, field: "time" | "name", value: string) => {
        setChapters((prev) =>
            prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
        );
    };

    return (
        <div
            className={inter.className}
            style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#F0F7FF" }}
        >
            {/* ══════════════════════════════════════════════════
          HERO / HEADER SECTION
      ══════════════════════════════════════════════════ */}
            <section
                style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "48px 64px 56px",
                    background: "linear-gradient(180deg, #DAEEFF 0%, #EEF8FF 50%, #F5FBFF 80%, #F0F7FF 100%)",
                }}
            >
                {/* Dekorasi lingkaran blur kanan atas */}
                <img
                    src={GROUP2_B64}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: "-80px",
                        right: "-100px",
                        width: "500px",
                        height: "500px",
                        pointerEvents: "none",
                        zIndex: 1,
                        opacity: 0.9,
                    }}
                />

                {/* Diagonal band kiri */}
                <svg
                    style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "300px",
                        height: "260px",
                        opacity: 0.08,
                        pointerEvents: "none",
                        zIndex: 1,
                    }}
                    viewBox="0 0 300 260"
                    fill="none"
                >
                    <rect x="-80" y="-30" width="240" height="360" rx="4"
                        transform="rotate(-35 -80 -30)" fill="#2196F3" />
                </svg>

                {/* Konten header */}
                <div style={{ position: "relative", zIndex: 2 }}>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "clamp(28px, 3vw, 38px)",
                            fontWeight: 600,
                            color: "#2196F3",
                            lineHeight: 1.2,
                            letterSpacing: "-0.3px",
                        }}
                    >
                        Upload Smart Video
                    </h1>
                    <p
                        style={{
                            margin: "10px 0 0",
                            fontSize: "15px",
                            color: "#4B7BAE",
                            fontWeight: 400,
                        }}
                    >
                        Pastikan tagging mata kuliah sudah sesuai standar Helphin
                    </p>
                </div>

                {/* Tombol Batal & Upload Materi — pojok kanan atas */}
                <div
                    style={{
                        position: "absolute",
                        top: "48px",
                        right: "64px",
                        display: "flex",
                        gap: "14px",
                        alignItems: "center",
                        zIndex: 3,
                    }}
                >
                    <Link href="/mata-kuliah" style={{ textDecoration: "none" }}>
                        <button
                            style={{
                                padding: "12px 28px",
                                borderRadius: "10px",
                                border: "2px solid #2196F3",
                                backgroundColor: "transparent",
                                color: "#2196F3",
                                fontWeight: 700,
                                fontSize: "15px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "background-color 0.15s",
                            }}
                        >
                            Batal
                        </button>
                    </Link>
                    <button
                        style={{
                            padding: "12px 28px",
                            borderRadius: "10px",
                            border: "none",
                            backgroundColor: "#2196F3",
                            color: "#FFFFFF",
                            fontWeight: 700,
                            fontSize: "15px",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            boxShadow: "0 4px 16px rgba(33,150,243,0.35)",
                            transition: "background-color 0.15s, box-shadow 0.15s",
                        }}
                    >
                        Upload Materi
                    </button>
                </div>

                {/* Fade bawah */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "40px",
                        background: "linear-gradient(to bottom, transparent, #F0F7FF)",
                        pointerEvents: "none",
                        zIndex: 3,
                    }}
                />
            </section>

            {/* ══════════════════════════════════════════════════
          MAIN CONTENT — dua kolom
      ══════════════════════════════════════════════════ */}
            <main
                style={{
                    flex: 1,
                    display: "grid",
                    gridTemplateColumns: "1fr 480px",
                    gap: "32px",
                    padding: "40px 64px 56px",
                    maxWidth: "1400px",
                    width: "100%",
                    margin: "0 auto",
                    boxSizing: "border-box",
                }}
            >
                {/* ── Kolom Kiri ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                    {/* JUDUL VIDEO PEMBELAJARAN */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: 800,
                                color: "#0F172A",
                                letterSpacing: "0.5px",
                                marginBottom: "10px",
                                textTransform: "uppercase",
                            }}
                        >
                            Judul Video Pembelajaran
                        </label>
                        <input
                            type="text"
                            placeholder="Contoh: Dasar-Dasar Algoritma"
                            value={judulVideo}
                            onChange={(e) => setJudulVideo(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "14px 18px",
                                borderRadius: "10px",
                                border: "1.5px solid #D1E3FF",
                                backgroundColor: "#FFFFFF",
                                fontSize: "15px",
                                color: "#0F172A",
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                                boxShadow: "0 1px 4px rgba(33,150,243,0.06)",
                                transition: "border-color 0.15s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#2196F3")}
                            onBlur={(e) => (e.target.style.borderColor = "#D1E3FF")}
                        />
                    </div>

                    {/* MATA KULIAH + SEMESTER */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        {/* Mata Kuliah */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: 800,
                                    color: "#0F172A",
                                    letterSpacing: "0.5px",
                                    marginBottom: "10px",
                                    textTransform: "uppercase",
                                }}
                            >
                                Mata Kuliah
                            </label>
                            <div style={{ position: "relative" }}>
                                <select
                                    value={mataKuliah}
                                    onChange={(e) => setMataKuliah(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "14px 42px 14px 18px",
                                        borderRadius: "10px",
                                        border: "1.5px solid #D1E3FF",
                                        backgroundColor: "#FFFFFF",
                                        fontSize: "15px",
                                        color: mataKuliah ? "#0F172A" : "#9CA3AF",
                                        fontFamily: "inherit",
                                        outline: "none",
                                        appearance: "none",
                                        cursor: "pointer",
                                        boxSizing: "border-box",
                                        boxShadow: "0 1px 4px rgba(33,150,243,0.06)",
                                    }}
                                >
                                    <option value="" disabled hidden>Pilih Mata Kuliah</option>
                                    {mataKuliahOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                {/* Arrow icon */}
                                <svg
                                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                                >
                                    <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>

                        {/* Semester */}
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "13px",
                                    fontWeight: 800,
                                    color: "#0F172A",
                                    letterSpacing: "0.5px",
                                    marginBottom: "10px",
                                    textTransform: "uppercase",
                                }}
                            >
                                Semester
                            </label>
                            <div style={{ position: "relative" }}>
                                <select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    style={{
                                        width: "100%",
                                        padding: "14px 42px 14px 18px",
                                        borderRadius: "10px",
                                        border: "1.5px solid #D1E3FF",
                                        backgroundColor: "#FFFFFF",
                                        fontSize: "15px",
                                        color: semester ? "#0F172A" : "#9CA3AF",
                                        fontFamily: "inherit",
                                        outline: "none",
                                        appearance: "none",
                                        cursor: "pointer",
                                        boxSizing: "border-box",
                                        boxShadow: "0 1px 4px rgba(33,150,243,0.06)",
                                    }}
                                >
                                    <option value="" disabled hidden>Pilih Semester</option>
                                    {semesterOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <svg
                                    style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                                    width="16" height="16" viewBox="0 0 16 16" fill="none"
                                >
                                    <path d="M4 6L8 10L12 6" stroke="#6B7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* VIDEO SOURCE */}
                    <div>
                        <label
                            style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: 800,
                                color: "#0F172A",
                                letterSpacing: "0.5px",
                                marginBottom: "10px",
                                textTransform: "uppercase",
                            }}
                        >
                            Video Source (Link YouTube/Google Drive)
                        </label>
                        <input
                            type="url"
                            placeholder="https://youtube.com/watch?v=..."
                            value={videoLink}
                            onChange={(e) => setVideoLink(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "14px 18px",
                                borderRadius: "10px",
                                border: "1.5px solid #D1E3FF",
                                backgroundColor: "#FFFFFF",
                                fontSize: "15px",
                                color: "#0F172A",
                                fontFamily: "inherit",
                                outline: "none",
                                boxSizing: "border-box",
                                boxShadow: "0 1px 4px rgba(33,150,243,0.06)",
                                transition: "border-color 0.15s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#2196F3")}
                            onBlur={(e) => (e.target.style.borderColor = "#D1E3FF")}
                        />
                    </div>

                    {/* THUMBNAIL DROP ZONE */}
                    <div>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${isDragging ? "#2196F3" : "#BFDBFE"}`,
                                borderRadius: "12px",
                                padding: "40px 24px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                backgroundColor: isDragging ? "#EFF6FF" : "#FFFFFF",
                                transition: "border-color 0.15s, background-color 0.15s",
                                minHeight: "160px",
                            }}
                        >
                            {thumbnailPreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    style={{ maxHeight: "120px", borderRadius: "8px", objectFit: "cover" }}
                                />
                            ) : (
                                <>
                                    {/* Upload cloud icon */}
                                    <div
                                        style={{
                                            width: "56px",
                                            height: "56px",
                                            borderRadius: "50%",
                                            backgroundColor: "#BFDBFE",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "14px",
                                        }}
                                    >
                                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" stroke="#2196F3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "#0F172A" }}>
                                        Pilih file thumbnail
                                    </p>
                                    <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#6B7280" }}>
                                        Atau drag &amp; drop gambar ke sini (Maks 2MB)
                                    </p>
                                </>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileChange(file);
                            }}
                        />
                    </div>
                </div>

                {/* ── Kolom Kanan: Atur Timeline ── */}
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div
                        style={{
                            backgroundColor: "rgba(219, 234, 254, 0.45)",
                            borderRadius: "16px",
                            border: "1.5px solid rgba(147, 197, 253, 0.6)",
                            padding: "28px 24px",
                            boxShadow: "0 2px 12px rgba(33,150,243,0.08)",
                            flex: 1,
                        }}
                    >
                        {/* Header panel */}
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                            {/* Icon numbered list */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <rect x="1" y="4" width="3" height="2" rx="0.5" fill="#2196F3" />
                                <rect x="6" y="5" width="14" height="1.5" rx="0.75" fill="#2196F3" fillOpacity="0.5" />
                                <text x="1.5" y="5.8" fontSize="2.5" fill="#2196F3" fontWeight="bold">1</text>
                                <rect x="1" y="11" width="3" height="2" rx="0.5" fill="#2196F3" />
                                <rect x="6" y="12" width="14" height="1.5" rx="0.75" fill="#2196F3" fillOpacity="0.5" />
                                <text x="1.2" y="12.8" fontSize="2.5" fill="#2196F3" fontWeight="bold">2</text>
                            </svg>

                            {/* Custom numbered-list icon */}
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <text x="2" y="11" fontSize="7" fill="#2196F3" fontWeight="900" fontFamily="Arial">1</text>
                                <text x="2" y="21" fontSize="7" fill="#2196F3" fontWeight="900" fontFamily="Arial">2</text>
                                <rect x="12" y="6" width="14" height="2.5" rx="1.25" fill="#2196F3" fillOpacity="0.4" />
                                <rect x="12" y="16" width="14" height="2.5" rx="1.25" fill="#2196F3" fillOpacity="0.4" />
                            </svg>

                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: "18px",
                                    fontWeight: 800,
                                    color: "#0F172A",
                                }}
                            >
                                Atur Timeline (Smart Chapters)
                            </h2>
                        </div>
                        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#2196F3", fontWeight: 500 }}>
                            Buat titik navigasi agar mahasiswa lebih mudah belajar.
                        </p>

                        {/* Chapter list */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {chapters.map((chapter) => (
                                <div key={chapter.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    {/* Time input */}
                                    <input
                                        type="text"
                                        placeholder="MM:SS"
                                        value={chapter.time}
                                        onChange={(e) => updateChapter(chapter.id, "time", e.target.value)}
                                        maxLength={5}
                                        style={{
                                            width: "78px",
                                            minWidth: "78px",
                                            padding: "12px 12px",
                                            borderRadius: "8px",
                                            border: "1.5px solid #D1E3FF",
                                            fontSize: "14px",
                                            color: "#0F172A",
                                            fontFamily: "inherit",
                                            outline: "none",
                                            textAlign: "center",
                                            boxSizing: "border-box",
                                            backgroundColor: "rgba(255,255,255,0.8)",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "#2196F3")}
                                        onBlur={(e) => (e.target.style.borderColor = "#D1E3FF")}
                                    />

                                    {/* Chapter name input */}
                                    <input
                                        type="text"
                                        placeholder="Nama Chapter"
                                        value={chapter.name}
                                        onChange={(e) => updateChapter(chapter.id, "name", e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: "12px 14px",
                                            borderRadius: "8px",
                                            border: "1.5px solid #D1E3FF",
                                            fontSize: "14px",
                                            color: "#0F172A",
                                            fontFamily: "inherit",
                                            outline: "none",
                                            boxSizing: "border-box",
                                            backgroundColor: "rgba(255,255,255,0.8)",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "#2196F3")}
                                        onBlur={(e) => (e.target.style.borderColor = "#D1E3FF")}
                                    />

                                    {/* Delete button */}
                                    <button
                                        onClick={() => removeChapter(chapter.id)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            padding: "4px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M3 6H21M8 6V4H16V6M19 6L18.1 20.1C18 20.6 17.6 21 17.1 21H6.9C6.4 21 6 20.6 5.9 20.1L5 6" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Tambah Chapter */}
                        <button
                            onClick={addChapter}
                            style={{
                                width: "100%",
                                marginTop: "16px",
                                padding: "13px",
                                borderRadius: "8px",
                                border: "1.5px solid rgba(147, 197, 253, 0.8)",
                                backgroundColor: "rgba(255,255,255,0.7)",
                                color: "#2196F3",
                                fontWeight: 700,
                                fontSize: "14px",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                transition: "background-color 0.15s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "6px",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(239,246,255,0.9)")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.7)")}
                        >
                            + Tambah Chapter
                        </button>
                    </div>
                </div>
            </main>

            {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
            <footer
                style={{
                    backgroundColor: "#2196F3",
                    padding: "28px 48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    borderRadius: "10px",
                    margin: "0 16px 16px",
                }}
            >
                <span
                    style={{
                        color: "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "22px",
                        letterSpacing: "-0.3px",
                        fontFamily: "inherit",
                    }}
                >
                    <img src="/helPhin.svg" alt="" />
                </span>
                <div style={{ display: "flex", gap: "36px" }}>
                    {["About", "Policy", "Terms"].map((link) => (
                        <a
                            key={link}
                            href="#"
                            style={{
                                color: "#FFFFFF",
                                fontWeight: 500,
                                fontSize: "15px",
                                textDecoration: "none",
                                opacity: 0.92,
                            }}
                        >
                            {link}
                        </a>
                    ))}
                </div>
            </footer>
        </div>
    );
}