"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder,
  disabled = false
}: { 
  options: {value: string, label: string}[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string,
  disabled?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find(o => o.value === value)?.label || "";

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        className={`w-full h-[45px] px-[12px] bg-white border ${isOpen ? 'border-[#068DFF] ring-2 ring-blue-100' : 'border-[#E6E6E6]'} rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] flex justify-between items-center transition-all ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-[#068DFF]'}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? "text-[#1D1D1D] font-medium truncate pr-2" : "text-gray-400"}>{selectedLabel || placeholder}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-blue-50 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {options.map((opt) => (
              <div 
                key={opt.value}
                className={`px-4 py-3 text-[14px] cursor-pointer transition-colors select-none ${value === opt.value ? 'bg-[#D6EFFF] text-[#068DFF] font-semibold' : 'text-gray-700 hover:bg-[#D6EFFF] hover:text-[#068DFF] font-medium'}`}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-4 py-3 text-[14px] text-gray-400 italic text-center">Data tidak tersedia</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function TambahMateri() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        prodiId: "",
        mataKuliahId: "",
        tahunAjaran: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const [dataProdi, setDataProdi] = useState<any[]>([]);
    const [dataMatkul, setDataMatkul] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Inisialisasi dari query params jika ada
    useEffect(() => {
        const queryProdiId = searchParams?.get("prodiId");
        const queryMataKuliahId = searchParams?.get("mataKuliahId");
        
        if (queryProdiId || queryMataKuliahId) {
            setFormData(prev => ({
                ...prev,
                ...(queryProdiId ? { prodiId: queryProdiId } : {}),
                ...(queryMataKuliahId ? { mataKuliahId: queryMataKuliahId } : {})
            }));
        }
    }, [searchParams]);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setIsSuperAdmin(user.permissions?.includes("*"));
            if (!user.permissions?.includes("*")) {
                setFormData(prev => ({ ...prev, prodiId: user.prodiId || "" }));
            }
        }
        fetchProdi();
    }, []);

    useEffect(() => {
        if (formData.prodiId) {
            fetchMatkul(formData.prodiId);
        } else {
            setDataMatkul([]);
        }
    }, [formData.prodiId]);

    const fetchProdi = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch("http://localhost:8000/api/prodi", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDataProdi(data.data);
        } catch (e) {
            console.error("Fetch prodi error", e);
        }
    };

    const fetchMatkul = async (prodiId: string) => {
        try {
            const token = localStorage.getItem("accessToken");
            const res = await fetch(`http://localhost:8000/api/mata-kuliah?prodiId=${prodiId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setDataMatkul(data.data);
        } catch (e) {
            console.error("Fetch matkul error", e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Pilih file materi terlebih dahulu.");
            return;
        }
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const fd = new FormData();
            fd.append("title", formData.title);
            fd.append("description", formData.description);
            fd.append("prodiId", formData.prodiId);
            fd.append("mataKuliahId", formData.mataKuliahId);
            fd.append("tahunAjaran", formData.tahunAjaran);
            fd.append("file", file);

            const res = await fetch("http://localhost:8000/api/materials", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: fd
            });
            const data = await res.json();
            if (data.success) {
                alert("Materi berhasil ditambahkan! 📄");
                router.back();
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (e) {
            console.error("Submit error", e);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center py-20 overflow-hidden"
            style={{
                backgroundImage: "url('/images/background.svg')",
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "115% 0%",
                backgroundColor: '#FCFDFF'
            }}>

            <div className="mb-10">
                <Image src="/Assets/Logo-helphin-biru.png" alt="Logo Helphin" width={150} height={50} priority />
            </div>

            <div className="mb-10 text-center">
                <h1 className="text-[32px] font-semibold leading-[32px] text-[#1D1D1D]">
                    Tambah Materi
                </h1>
                <p className="text-[#068DFF] text-sm mt-2">Upload materi pembelajaran baru ke dalam sistem</p>
            </div>

            <div className="w-full max-w-[1055px] min-h-[512px] p-[32px] rounded-[8px] flex flex-col items-center gap-[32px] shadow-xl"
                style={{ background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, #FFFFFF 100%)" }}>

                <div className="w-full flex items-center border-b border-gray-100 pb-2">
                    <button type="button" onClick={() => router.back()} className="text-gray-400 hover:text-[#068DFF] transition-colors text-sm font-semibold mr-4">
                        ← Kembali
                    </button>
                    <h3 className="text-[20px] font-semibold leading-[32px] text-black">
                        Informasi Materi
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[1019px] flex flex-col gap-[32px]">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6 w-full">
                        <div className="flex flex-col gap-1.5 z-10">
                            <label className="text-sm font-bold text-gray-900">Judul Materi</label>
                            <input
                                type="text"
                                required
                                placeholder="Contoh: Modul 1 - Pengenalan"
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 z-10">
                            <label className="text-sm font-bold text-gray-900">Tahun Ajaran</label>
                            <input
                                type="text"
                                placeholder="2023/2024"
                                className="w-full h-[45px] px-[12px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all"
                                value={formData.tahunAjaran}
                                onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 relative z-30">
                            <label className="text-sm font-bold text-gray-900">Program Studi</label>
                            {isSuperAdmin ? (
                                <CustomSelect 
                                    options={dataProdi.map(p => ({ value: p.id, label: p.name }))}
                                    value={formData.prodiId}
                                    onChange={(val) => setFormData({ ...formData, prodiId: val, mataKuliahId: "" })}
                                    placeholder="Pilih Program Studi"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={dataProdi.find(p => p.id === formData.prodiId)?.name || "Memuat..."}
                                    disabled
                                    className="w-full h-[45px] px-[12px] bg-gray-50 border border-[#E6E6E6] rounded-[4px] text-[14px] text-gray-500 font-medium"
                                />
                            )}
                        </div>
                        <div className="flex flex-col gap-1.5 relative z-20">
                            <label className="text-sm font-bold text-gray-900">Mata Kuliah</label>
                            <CustomSelect 
                                options={dataMatkul.map(m => ({ value: m.id, label: `(${m.code}) ${m.name}` }))}
                                value={formData.mataKuliahId}
                                onChange={(val) => setFormData({ ...formData, mataKuliahId: val })}
                                placeholder="Pilih Mata Kuliah"
                                disabled={!formData.prodiId}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2 z-10">
                            <label className="text-sm font-bold text-gray-900">Deskripsi (Opsional)</label>
                            <textarea
                                placeholder="Deskripsi singkat materi..."
                                className="w-full px-[12px] py-[10px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] outline-none focus:border-[#068DFF] transition-all h-24 resize-none"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5 col-span-2 z-10">
                            <label className="text-sm font-bold text-gray-900">File Materi</label>
                            <label className="border-2 border-dashed border-gray-300 rounded-2xl h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50/50 hover:border-[#068DFF] transition-colors cursor-pointer group relative overflow-hidden">
                                <input
                                    id="file-input"
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#068DFF] mb-3 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                </div>

                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <h3 className="text-sm font-bold text-[#068DFF] truncate max-w-[300px]">{file.name}</h3>
                                        <p className="text-xs text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-sm font-bold text-gray-700">Klik atau seret file ke sini</h3>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX (Maks. 50MB)</p>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="w-full flex justify-end mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-[264px] h-[54px] bg-[#068DFF] text-white rounded-[4px] font-bold text-[16px] hover:bg-blue-600 transition-all shadow-md disabled:opacity-50"
                        >
                            {loading ? "Menyimpan..." : "Simpan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
