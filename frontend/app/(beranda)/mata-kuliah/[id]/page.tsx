"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import FooterDashboard from "../../dashboard/components/footer_dashboard";
import {
  ArrowLeft,
  BookOpen,
  Video,
  FileQuestion,
  LayoutGrid,
  Download,
  ExternalLink,
  PlusCircle,
  Edit,
  Trash2,
} from "lucide-react";

type FilterType = "all" | "e-materi" | "video" | "bank-soal" | "responsi";

interface MataKuliah {
  id: string;
  code: string;
  name: string;
  prodiName: string;
  prodiId: string;
}

interface MateriItem {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  tahunAjaran: string;
}

interface VideoItem {
  id: string;
  title: string;
  description?: string;
  embedUrl: string;
  type: string;
}

interface ExerciseItem {
  id: string;
  title: string;
  description?: string;
  googleFormUrl: string;
  tahunAjaran: string;
}

interface ResponsiItem {
  id: string;
  title: string;
  description?: string;
  googleFormUrl: string;
  tahunAjaran: string;
}

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "all", label: "All" },
  { key: "e-materi", label: "E-Materi" },
  { key: "bank-soal", label: "Kuis" },
  { key: "video", label: "Smart Video" },
  { key: "responsi", label: "Responsi" },
];

export default function MataKuliahDetailPage() {
  const router = useRouter();
  const params = useParams();
  const matkulId = params?.id as string;

  const [matkul, setMatkul] = useState<MataKuliah | null>(null);
  const [materi, setMateri] = useState<MateriItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [responsies, setResponsies] = useState<ResponsiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [userName, setUserName] = useState("Admin");
  const [userPermissions, setUserPermissions] = useState<string[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name || "Admin");
        setUserPermissions(user.permissions || []);
      } catch { /* ignore */ }
    }
    if (matkulId) fetchAll();
  }, [matkulId]);

  const canManage =
    userPermissions.includes("*") ||
    userPermissions.includes("matkul:manage");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) { router.push("/login"); return; }

      const headers = { Authorization: `Bearer ${token}` };

      const [mkRes, matRes, vidRes, exRes, resRes] = await Promise.all([
        fetch(`http://localhost:8000/api/mata-kuliah/${matkulId}`, { headers }),
        fetch(`http://localhost:8000/api/materials?mataKuliahId=${matkulId}`, { headers }),
        fetch(`http://localhost:8000/api/videos?mataKuliahId=${matkulId}`, { headers }),
        fetch(`http://localhost:8000/api/exercises?mataKuliahId=${matkulId}`, { headers }),
        fetch(`http://localhost:8000/api/responsi?mataKuliahId=${matkulId}`, { headers }),
      ]);

      const [mkData, matData, vidData, exData, resData] = await Promise.all([
        mkRes.json(), matRes.json(), vidRes.json(), exRes.json(), resRes.json(),
      ]);

      if (mkData.success) setMatkul(mkData.data);
      if (matData.success) setMateri(matData.data);
      if (vidData.success) setVideos(vidData.data);
      if (exData.success) setExercises(exData.data);
      if (resData.success) setResponsies(resData.data);
    } catch (e) {
      console.error("Failed to fetch detail", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: "materials" | "videos" | "exercises" | "responsies", id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8000/api/${type}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Gagal menghapus");
      alert("Berhasil dihapus!");
      fetchAll();
    } catch {
      alert("Gagal menghapus item.");
    }
  };

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8000/api/materials/${id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.split("/").pop() || "materi";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Gagal mengunduh file.");
    }
  };

  const totalCount = materi.length + videos.length + exercises.length + responsies.length;
  const counts: Record<FilterType, number> = {
    all: totalCount,
    "e-materi": materi.length,
    video: videos.length,
    "bank-soal": exercises.length,
    responsi: responsies.length,
  };

  const showMateri = activeFilter === "all" || activeFilter === "e-materi";
  const showVideos = activeFilter === "all" || activeFilter === "video";
  const showExercises = activeFilter === "all" || activeFilter === "bank-soal";
  const showResponsies = activeFilter === "all" || activeFilter === "responsi";

  const firstName = userName.split(" ")[0];

  // Action cards config
  const actionCards = [
    {
      label: "Buat\nMateri",
      color: "from-orange-300 to-orange-400",
      icon: <BookOpen size={22} className="text-white" />,
      path: matkul ? `/manajemen/materi/tambah?prodiId=${matkul.prodiId}&mataKuliahId=${matkul.id}` : "/manajemen/materi/tambah",
    },
    {
      label: "Buat\nKuis",
      color: "from-purple-400 to-purple-500",
      icon: <FileQuestion size={22} className="text-white" />,
      path: matkul ? `/manajemen/latihan-soal/tambah?prodiId=${matkul.prodiId}&mataKuliahId=${matkul.id}` : "/manajemen/latihan-soal/tambah",
    },
    {
      label: "Buat\nSmart Video",
      color: "from-green-300 to-green-400",
      icon: <Video size={22} className="text-white" />,
      path: matkul ? `/manajemen/video/tambah?prodiId=${matkul.prodiId}&mataKuliahId=${matkul.id}` : "/manajemen/video/tambah",
    },
    {
      label: "Buat\nResponsi",
      color: "from-blue-400 to-blue-500",
      icon: <FileQuestion size={22} className="text-white" />,
      path: matkul ? `/manajemen/responsi/tambah?prodiId=${matkul.prodiId}&mataKuliahId=${matkul.id}` : "/manajemen/responsi/tambah",
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <div className="flex-1 max-w-3xl mx-auto px-6 py-8">

        {/* ── Back Button ── */}
        <button
          onClick={() => router.push("/mata-kuliah")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Kembali ke Mata Kuliah
        </button>

        {/* ── Hero Banner ── */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-lg"
          style={{ background: "linear-gradient(135deg, #b3d4f5 0%, #d0e8fb 40%, #cde8fb 70%, #d8edfb 100%)" }}>
          {/* Decorative blobs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-blue-200/40" />
          <div className="absolute bottom-0 left-10 w-28 h-28 rounded-full bg-blue-300/20" />

          <div className="relative z-10 px-8 pt-8 pb-6 text-center">
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-7 bg-white/40 rounded w-64 mx-auto" />
                <div className="h-5 bg-white/30 rounded w-48 mx-auto" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-blue-700 mb-1">
                  Hallo, {firstName}!
                </h1>
                <p className="text-lg font-bold text-blue-600">
                  Here is your{" "}
                  <span className="underline decoration-2 underline-offset-4">
                    {matkul?.name || "Mata Kuliah"}
                  </span>{" "}
                  material
                </p>
                <div className="mt-3 inline-block px-4 py-1 rounded-full text-xs font-semibold text-yellow-800 bg-yellow-200 shadow-sm">
                  {matkul?.code && `${matkul.code} · `}{matkul?.prodiName}
                </div>
              </>
            )}

            {/* Action Cards — only for admin/manage */}
            {canManage && (
              <div className="flex gap-4 justify-center mt-6 mb-2 flex-wrap">
                {actionCards.map((card) => (
                  <button
                    key={card.label}
                    onClick={() => router.push(card.path)}
                    className={`flex flex-col items-center justify-center gap-2 w-28 h-24 rounded-2xl bg-gradient-to-br ${card.color} shadow-md hover:scale-105 hover:shadow-lg transition-all duration-200 text-center`}
                  >
                    {card.icon}
                    <span className="text-white text-xs font-semibold leading-tight whitespace-pre-line">
                      {card.label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Filter Tabs + Section Title ── */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-lg font-bold text-gray-800">Topik</h2>
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                  activeFilter === f.key
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-500"
                }`}
              >
                {f.label}
                {counts[f.key] > 0 && (
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    activeFilter === f.key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {counts[f.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-20 animate-pulse border border-gray-100 shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">

            {/* E-Materi */}
            {showMateri && materi.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-blue-100 flex items-center justify-center">
                  <BookOpen size={22} className="text-blue-500" />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{m.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.tahunAjaran}</p>
                </div>
                {/* Action */}
                <div className="flex-shrink-0 flex items-center gap-2">
                  {canManage && (
                    <>
                      <button
                        onClick={() => router.push(`/manajemen/materi/edit/${m.id}`)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-200 transition-colors shadow-sm"
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete("materials", m.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors shadow-sm"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDownload(m.id, m.fileUrl)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-xl text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    <Download size={13} />
                    Buka
                  </button>
                </div>
              </div>
            ))}

            {/* Video */}
            {showVideos && videos.map((v) => (
              <div
                key={v.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-violet-100 flex items-center justify-center">
                  <Video size={22} className="text-violet-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{v.title}</p>
                  {v.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{v.description}</p>
                  )}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    v.type === "live"
                      ? "bg-red-50 text-red-500 border border-red-100"
                      : "bg-blue-50 text-blue-500 border border-blue-100"
                  }`}>
                    {v.type}
                  </span>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {canManage && (
                    <>
                      <button
                        onClick={() => router.push(`/manajemen/video/edit/${v.id}`)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-200 transition-colors shadow-sm"
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete("videos", v.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors shadow-sm"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => window.open(v.embedUrl, "_blank")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-500 text-white rounded-xl text-xs font-semibold hover:bg-violet-600 transition-colors shadow-sm"
                  >
                    <ExternalLink size={13} />
                    Buka
                  </button>
                </div>
              </div>
            ))}

            {/* Bank Soal */}
            {showExercises && exercises.map((ex) => (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-emerald-100 flex items-center justify-center">
                  <FileQuestion size={22} className="text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{ex.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {exercises.indexOf(ex) > 0 ? `${exercises.indexOf(ex) * 40} soal` : ""}
                    {ex.tahunAjaran && ` · ${ex.tahunAjaran}`}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {canManage && (
                    <>
                      <button
                        onClick={() => router.push(`/manajemen/latihan-soal/edit/${ex.id}`)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-200 transition-colors shadow-sm"
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete("exercises", ex.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors shadow-sm"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </>
                  )}
                  <a
                    href={ex.googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    <ExternalLink size={13} />
                    Buka
                  </a>
                </div>
              </div>
            ))}

            {/* Responsi */}
            {showResponsies && responsies.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-sky-100 flex items-center justify-center">
                  <FileQuestion size={22} className="text-sky-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm truncate">{res.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {res.tahunAjaran}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {canManage && (
                    <>
                      <button
                        onClick={() => router.push(`/manajemen/responsi/edit/${res.id}`)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-amber-100 text-amber-700 rounded-xl text-xs font-semibold hover:bg-amber-200 transition-colors shadow-sm"
                      >
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete("responsies", res.id)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-200 transition-colors shadow-sm"
                      >
                        <Trash2 size={13} /> Hapus
                      </button>
                    </>
                  )}
                  <a
                    href={res.googleFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 text-white rounded-xl text-xs font-semibold hover:bg-sky-600 transition-colors shadow-sm"
                  >
                    <ExternalLink size={13} />
                    Buka
                  </a>
                </div>
              </div>
            ))}

            {/* Empty states per section */}
            {showMateri && materi.length === 0 && (activeFilter === "e-materi") && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                <BookOpen size={36} className="mx-auto mb-2 opacity-30" />
                Belum ada E-Materi untuk mata kuliah ini.
                {canManage && (
                  <button
                    onClick={() => router.push(matkul ? `/manajemen/materi/tambah?prodiId=${matkul.prodiId}&mataKuliahId=${matkul.id}` : "/manajemen/materi/tambah")}
                    className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition"
                  >
                    <PlusCircle size={14} /> Tambah Materi
                  </button>
                )}
              </div>
            )}

            {showVideos && videos.length === 0 && activeFilter === "video" && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                <Video size={36} className="mx-auto mb-2 opacity-30" />
                Belum ada Video untuk mata kuliah ini.
                {canManage && (
                  <button
                    onClick={() => router.push(matkul ? `/manajemen/video/tambah?prodiId=${matkul.prodiId}&mataKuliahId=${matkul.id}` : "/manajemen/video/tambah")}
                    className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 bg-violet-50 text-violet-600 rounded-xl text-xs font-semibold hover:bg-violet-100 transition"
                  >
                    <PlusCircle size={14} /> Tambah Video
                  </button>
                )}
              </div>
            )}

            {showExercises && exercises.length === 0 && activeFilter === "bank-soal" && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                <FileQuestion size={36} className="mx-auto mb-2 opacity-30" />
                Belum ada Kuis untuk mata kuliah ini.
                {canManage && (
                  <button
                    onClick={() => router.push(matkul ? `/manajemen/latihan-soal/tambah?prodiId=${matkul.prodiId}&mataKuliahId=${matkul.id}` : "/manajemen/latihan-soal/tambah")}
                    className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-semibold hover:bg-emerald-100 transition"
                  >
                    <PlusCircle size={14} /> Tambah Kuis
                  </button>
                )}
              </div>
            )}

            {showResponsies && responsies.length === 0 && activeFilter === "responsi" && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
                <FileQuestion size={36} className="mx-auto mb-2 opacity-30" />
                Belum ada Responsi untuk mata kuliah ini.
                {canManage && (
                  <button
                    onClick={() => router.push(matkul ? `/manajemen/responsi/tambah?prodiId=${matkul.prodiId}&mataKuliahId=${matkul.id}` : "/manajemen/responsi/tambah")}
                    className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 bg-sky-50 text-sky-600 rounded-xl text-xs font-semibold hover:bg-sky-100 transition"
                  >
                    <PlusCircle size={14} /> Tambah Responsi
                  </button>
                )}
              </div>
            )}

            {/* Global empty state (all filter, no content at all) */}
            {!loading && totalCount === 0 && activeFilter === "all" && (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <LayoutGrid size={48} className="mb-4 opacity-30" />
                <p className="text-base font-medium">Belum ada konten untuk mata kuliah ini.</p>
                {canManage && (
                  <p className="text-sm mt-1 text-gray-400">Gunakan tombol di atas untuk mulai menambahkan konten.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8">
          <FooterDashboard />
        </div>
      </div>
    </div>
  );
}
