"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] })

// ── Inline base64 untuk SVG kecil ────────────────────────────────────────────
// Group_2.svg — lingkaran blur biru, pojok kanan-atas hero
const GROUP2_B64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjI3IiBoZWlnaHQ9IjY4NyIgdmlld0JveD0iMCAwIDYyNyA2ODciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYzMS40IiBjeT0iMjQ4IiByPSIyNDMuNSIgc3Ryb2tlPSIjMDY4REZGIiBzdHJva2Utb3BhY2l0eT0iMC4xNSIvPgo8Y2lyY2xlIGN4PSI1NjIuNCIgY3k9IjE4MyIgcj0iMjQzLjUiIHN0cm9rZT0iIzA2OERGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuNCIvPgo8Y2lyY2xlIGN4PSI1ODMuNCIgY3k9IjIxNSIgcj0iMjQzLjUiIHN0cm9rZT0iIzA2OERGRiIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPgo8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMF9mXzU5XzQ4OSkiPgo8Y2lyY2xlIGN4PSI0ODcuNCIgY3k9IjE5OSIgcj0iMjI4IiBmaWxsPSIjMDY4REZGIiBmaWxsLW9wYWNpdHk9IjAuMjUiLz4KPC9nPgo8ZGVmcz4KPGZpbHRlciBpZD0iZmlsdGVyMF9mXzU5XzQ4OSIgeD0iLTkuMTU1MjdlLTA1IiB5PSItMjg4LjQiIHdpZHRoPSI5NzQuOCIgaGVpZ2h0PSI5NzQuOCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgo8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgo8ZmVCbGVuZCBtb2RlPSJub3JtYWwiIGluPSJTb3VyY2VHcmFwaGljIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJzaGFwZSIvPgo8ZmVHYXVzc2lhbkJsdXIgc3RkRGV2aWF0aW9uPSIxMjkuNyIgcmVzdWx0PSJlZmZlY3QxX2ZvcmVncm91bmRCbHVyXzU5XzQ4OSIvPgo8L2ZpbHRlcj4KPC9kZWZzPgo8L3N2Zz4K`;

// Vector_21.svg — blob gradien biru, dekorasi pojok kiri-bawah panel topik
const VECTOR21_B64 = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTM1IiBoZWlnaHQ9IjEwNyIgdmlld0JveD0iMCAwIDEzNSAxMDciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xMTYuNjAzIDQ2LjI1NTJMMTM1IC00Mi41NDIxTDAgLTYxVjEwNi4xMTlDOS42NDkzIDEwNi43ODQgMzUuNzExNCAxMDcuNzE1IDYyLjc2NTUgMTA2LjExOUM4OS44MTk2IDEwNC41MjIgMTAwLjEgMTEzLjYwMSAxMTYuNjAzIDQ2LjI1NTJaIiBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMTI0N18xMDk5NikiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl8xMjQ3XzEwOTk2IiB4MT0iMTAxLjcyMyIgeTE9Ii01NS4wMTM3IiB4Mj0iLTQ3LjU1NiIgeTI9IjE4LjQwNzMiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzMwQjVGRiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwNjhERkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K`;

interface TopikItem {
    id: string;
    title: string;
    subtitle?: string;
    type: "bank-soal" | "e-materi" | "smart-video";
    href: string;
}

export default function MataKuliahDetail() {
    const [activeFilter, setActiveFilter] = useState<"all" | "bank-soal" | "e-materi" | "smart-video">("all");
    const [userName, setUserName] = useState("Nexta");
    const [mataKuliah] = useState("Kalkulus");
    const [semester] = useState("I");

    const topikList: TopikItem[] = [
        { id: "1", title: "Latihan Soal Kalkulus", subtitle: "120 soal", type: "bank-soal", href: "/bank-soal/1" },
        { id: "2", title: "Materi Tentang Integral Ganda", subtitle: undefined, type: "e-materi", href: "/materi/2" },
        { id: "3", title: "Video Penjelasan Dasar Logaritma", subtitle: "bersama Hendra Akbar", type: "smart-video", href: "/smart-video/3" },
    ];

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.name) setUserName(user.name);
            } catch { }
        }
    }, []);

    const filtered = activeFilter === "all"
        ? topikList
        : topikList.filter((t) => t.type === activeFilter);

    const filters: { key: typeof activeFilter; label: string }[] = [
        { key: "all", label: "All" },
        { key: "bank-soal", label: "Bank Soal" },
        { key: "e-materi", label: "E-Materi" },
        { key: "smart-video", label: "Smart Video" },
    ];

    return (
        <div
            className={`min-h-screen flex flex-col ${inter.className}`}
            style={{ backgroundColor: "#EEF5FF" }}
        >
            {/* ══════════════════════════════════════════════════
                HERO SECTION
            ══════════════════════════════════════════════════ */}
            <section
                className={inter.className}
                style={{
                    position: "relative",
                    overflow: "hidden",
                    paddingTop: "56px",
                    paddingBottom: "56px",
                    background: "linear-gradient(180deg, #DAEEFF 0%, #EEF8FF 40%, #F5FBFF 70%, #FAFCFF 100%)",
                }}
            >

                {/* Layer 1 — Group_2.svg: lingkaran blur di pojok kanan (inline base64) */}
                <img
                    src={GROUP2_B64}
                    alt=""
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        top: "-80px",
                        right: "-100px",
                        width: "480px",
                        height: "480px",
                        pointerEvents: "none",
                        zIndex: 1,
                        opacity: 0.85,
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
                        opacity: 0.10,
                        pointerEvents: "none",
                        zIndex: 1,
                    }}
                    viewBox="0 0 300 260"
                    fill="none"
                >
                    <rect x="-80" y="-30" width="240" height="360" rx="4"
                        transform="rotate(-35 -80 -30)" fill="#2196F3" />
                </svg>

                {/* Konten hero */}
                <div style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
                    <h1
                        style={{
                            fontSize: "clamp(26px, 3.5vw, 40px)",
                            fontWeight: 800,
                            lineHeight: 1.3,
                            color: "#1565C0",
                            margin: 0,
                            letterSpacing: "-0.3px",
                        }}
                    >
                        Hallo, {userName}!<br />
                        Here is your {mataKuliah} material
                    </h1>

                    {/* Badge semester */}
                    <div style={{ marginTop: "18px" }}>
                        <span
                            style={{
                                display: "inline-block",
                                backgroundColor: "#FFFDE7",
                                border: "1.5px solid #FFD600",
                                color: "#7A5C00",
                                fontWeight: 700,
                                fontSize: "13px",
                                padding: "5px 22px",
                                borderRadius: "999px",
                            }}
                        >
                            Semester {semester}
                        </span>
                    </div>

                    {/* ── 3 Action Cards ── */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "flex-end",
                            gap: "20px",
                            marginTop: "40px",
                            flexWrap: "wrap",
                        }}
                    >
                        {/* Buat Materi — pastel orange/peach */}
                        <ActionCard
                            label="Buat Materi"
                            href="/materi/tambah"
                            gradient="linear-gradient(160deg, #FDDCB5 0%, #FDBA74 40%, #FB923C 100%)"
                            shadow="rgba(251,146,60,0.30)"
                            textColor="#431407"
                            height={148}
                        />

                        {/* Buat Bank Soal — pastel purple (taller) */}
                        <ActionCard
                            label="Buat Bank Soal"
                            href="/bank-soal/tambah"
                            gradient="linear-gradient(160deg, #E9D5FF 0%, #C084FC 40%, #A855F7 100%)"
                            shadow="rgba(168,85,247,0.32)"
                            textColor="#2E1065"
                            height={178}
                        />

                        {/* Buat Smart Video — pastel green */}
                        <ActionCard
                            label="Buat Smart Video"
                            href="/smart-video/tambah"
                            gradient="linear-gradient(160deg, #DCFCE7 0%, #86EFAC 40%, #4ADE80 100%)"
                            shadow="rgba(74,222,128,0.28)"
                            textColor="#052E16"
                            height={148}
                        />
                    </div>
                </div>

                {/* Fade bawah ke section background */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "48px",
                        background: "linear-gradient(to bottom, transparent, #EEF5FF)",
                        pointerEvents: "none",
                        zIndex: 3,
                    }}
                />
            </section>

            {/* ══════════════════════════════════════════════════
                TOPIK SECTION
            ══════════════════════════════════════════════════ */}
            <section
                className={inter.className}
                style={{
                    flex: 1,
                    backgroundColor: "#EEF5FF",
                    padding: "36px 48px 52px",
                    maxWidth: "1200px",
                    width: "100%",
                    margin: "0 auto",
                    boxSizing: "border-box" as const,
                }}
            >
                {/* Header: judul + filter */}
                <div
                    className={inter.className}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "24px",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                >
                    <h2 style={{ fontSize: "22px", fontWeight: 800, color: "#0F172A", margin: 0 }}>
                        Topik
                    </h2>

                    {/* Filter pill group */}
                    <div
                        style={{
                            display: "flex",
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #D1E3FF",
                            borderRadius: "10px",
                            overflow: "hidden",
                            boxShadow: "0 1px 4px rgba(26,115,232,0.08)",
                        }}
                    >
                        {filters.map((f, i) => (
                            <button
                                key={f.key}
                                onClick={() => setActiveFilter(f.key)}
                                style={{
                                    padding: "10px 24px",
                                    fontSize: "14px",
                                    fontWeight: activeFilter === f.key ? 700 : 500,
                                    cursor: "pointer",
                                    border: "none",
                                    borderLeft: i > 0 ? "1px solid #D1E3FF" : "none",
                                    backgroundColor: activeFilter === f.key ? "#2196F3" : "transparent",
                                    color: activeFilter === f.key ? "#FFFFFF" : "#4B5563",
                                    transition: "background-color 0.15s, color 0.15s",
                                    outline: "none",
                                    lineHeight: 1,
                                    fontFamily: "inherit",
                                    borderRadius: 0,
                                }}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List kartu topik */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {filtered.length === 0 ? (
                        <div style={{ textAlign: "center", color: "#9CA3AF", padding: "56px 0", fontSize: "14px" }}>
                            Tidak ada topik untuk kategori ini.
                        </div>
                    ) : (
                        filtered.map((item) => <TopikCard key={item.id} item={item} />)
                    )}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                FOOTER
            ══════════════════════════════════════════════════ */}
            <footer
                className={inter.className}
                style={{
                    backgroundColor: "#2196F3",
                    padding: "28px 48px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "16px",
                    borderRadius: "10px",
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

/* ══════════════════════════════════════════════════
   ActionCard — kartu shortcut hero, gradient pastel
══════════════════════════════════════════════════ */
function ActionCard({
    label, href, gradient, shadow, textColor, height,
}: {
    label: string;
    href: string;
    gradient: string;
    shadow: string;
    textColor: string;
    height: number;
}) {
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
                    boxShadow: hovered
                        ? `0 14px 36px ${shadow}`
                        : `0 4px 16px ${shadow}`,
                    transform: hovered ? "translateY(-6px) scale(1.02)" : "translateY(0) scale(1)",
                    transition: "transform 0.22s cubic-bezier(.34,1.56,.64,1), box-shadow 0.22s ease",
                }}
            >
                <span
                    style={{
                        color: textColor,
                        fontWeight: 700,
                        fontSize: "16px",
                        textAlign: "center",
                        lineHeight: 1.5,
                        fontFamily: "inherit",
                    }}
                >
                    {lines.map((line, i) => (
                        <React.Fragment key={i}>
                            {line}
                            {i < lines.length - 1 && <br />}
                        </React.Fragment>
                    ))}
                </span>
            </div>
        </Link>
    );
}

function TopikCard({ item }: { item: TopikItem }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className={inter.className}
            style={{
                position: "relative",
                borderRadius: "16px",
                transition: "transform 0.2s",
                transform: hovered ? "translateY(-2px)" : "translateY(0)",
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <img
                src={VECTOR21_B64}
                alt=""
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "150px",
                    height: "auto",
                    pointerEvents: "none",
                    zIndex: 4,          // di atas card tapi di bawah icon
                    borderBottomLeftRadius: "16px",
                    borderTopLeftRadius: "16px",
                }}
            />

            {/* ── Icon di LUAR card — mengambang bebas ── */}
            <img
                src="/iconquiz.svg"
                alt="Quiz icon"
                style={{
                    position: "absolute",
                    bottom: "-40px",
                    left: "2px",
                    width: "200px",
                    height: "200px",
                    objectFit: "contain",
                    pointerEvents: "none",
                    zIndex: 5,          // paling atas
                    filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.15))",
                }}
            />

            {/* ── Card sebenarnya — overflow hidden untuk konten dalam ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    borderRadius: "16px",
                    overflow: "hidden",
                    backgroundColor: "#DBEAFE",
                    boxShadow: hovered
                        ? "0 6px 24px rgba(33,150,243,0.20)"
                        : "0 1px 6px rgba(33,150,243,0.10)",
                    transition: "box-shadow 0.2s",
                    minHeight: "120px",
                    position: "relative",
                    zIndex: 1,
                }}
            >
                {/* ── Area biru kiri — spacer untuk icon yang mengambang di atas ── */}
                <div
                    style={{
                        width: "210px",
                        minWidth: "210px",
                        flexShrink: 0,
                        // background: "linear-gradient(135deg, #42B4FF 0%, #1E96E8 50%, #1565C0 100%)",
                        borderRadius: "0",  // rounded sudah dari parent
                    }}
                />

                {/* ── Panel tengah: konten ── */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        padding: "20px 32px",
                        position: "relative",
                        overflow: "hidden",
                        background: "linear-gradient(90deg, #DBEAFE 0%, #EFF6FF 100%)",
                    }}
                >

                    <div style={{ position: "relative", zIndex: 1 }}>
                        <h3
                            style={{
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: 800,
                                color: "#0F172A",
                                lineHeight: 1.3,
                            }}
                        >
                            {item.title}
                        </h3>
                        {item.subtitle && (
                            <p
                                style={{
                                    margin: "6px 0 0",
                                    fontSize: "14px",
                                    color: "#374151",
                                    fontWeight: 400,
                                }}
                            >
                                {item.subtitle.startsWith("bersama") ? (
                                    <>
                                        bersama{" "}
                                        <strong style={{ fontWeight: 700 }}>
                                            {item.subtitle.replace("bersama ", "")}
                                        </strong>
                                    </>
                                ) : (
                                    item.subtitle
                                )}
                            </p>
                        )}
                    </div>
                </div>

                {/* ── Panel kanan: tombol Buka ── */}
                <div
                    style={{
                        padding: "0 28px",
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                        background: "linear-gradient(90deg, #EFF6FF 0%, #DBEAFE 100%)",
                    }}
                >
                    <Link
                        href={item.href}
                        style={{
                            display: "inline-block",
                            padding: "10px 28px",
                            backgroundColor: "#2196F3",
                            color: "#FFFFFF",
                            borderRadius: "8px",
                            fontWeight: 700,
                            fontSize: "15px",
                            textDecoration: "none",
                            whiteSpace: "nowrap",
                            boxShadow: hovered
                                ? "0 4px 18px rgba(33,150,243,0.50)"
                                : "0 2px 10px rgba(33,150,243,0.30)",
                            transition: "background-color 0.18s, box-shadow 0.18s",
                            fontFamily: "inherit",
                        }}
                    >
                        Buka
                    </Link>
                </div>
            </div>
        </div>
    );
}