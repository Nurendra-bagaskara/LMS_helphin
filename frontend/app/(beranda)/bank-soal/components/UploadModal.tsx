import React, { useState, useRef, useEffect } from "react";

interface UploadSoalProps {
  onClose: () => void;
}

// Komponen Custom Select untuk mendukung styling hover khusus yang tidak bisa dilakukan select bawaan browser
const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder 
}: { 
  options: string[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Menutup dropdown jika user klik di luarnya
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className={`w-full p-3 bg-gray-50 border ${isOpen ? 'border-[#068DFF] ring-2 ring-blue-100' : 'border-gray-200'} rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#068DFF] cursor-pointer flex justify-between items-center transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-800 font-medium" : "text-gray-400"}>{value || placeholder}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-blue-50 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {options.map((opt) => (
              <div 
                key={opt}
                className={`px-4 py-3 text-sm cursor-pointer transition-colors select-none ${value === opt ? 'bg-[#D6EFFF] text-[#068DFF] font-semibold' : 'text-gray-700 hover:bg-[#D6EFFF] hover:text-[#068DFF] font-medium'}`}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function UploadSoal({ onClose }: UploadSoalProps) {
  const [useSpoiler, setUseSpoiler] = useState(false);
  const [filePdf, setFilePdf] = useState<File | null>(null);
  
  // State untuk dropdown kustom
  const [tahunAjaran, setTahunAjaran] = useState("");
  const [jenisUjian, setJenisUjian] = useState("");

  const tahunAjaranOptions = ["2025/2026", "2024/2025", "2023/2024", "2022/2023"];
  const jenisUjianOptions = ["UTS", "UAS", "Kuis/ Latihan"];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center font-jakarta bg-blue-50/80 backdrop-blur-sm">
      {/* Container Modal */}
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-blue-100 flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="z-10">
            <h2 className="text-2xl font-bold text-[#068DFF] mb-1">Upload Bank Soal Baru</h2>
            <p className="text-gray-500 text-sm">Pastikan file PDF dan tagging mata kuliah sudah sesuai standar HelPhin</p>
          </div>
          <div className="flex items-center gap-3 z-10">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-[#068DFF] text-[#068DFF] text-sm font-semibold hover:bg-blue-50 transition active:scale-95"
            >
              Batal
            </button>
            <button className="px-6 py-2 rounded-lg bg-[#068DFF] text-white text-sm font-semibold hover:bg-blue-600 shadow-md shadow-blue-200 transition active:scale-95">
              Upload Soal
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-8 flex gap-8">
          
          {/* Left Column - File Upload & Spoiler */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Drag & Drop Upload Zone */}
            <label className="border-2 border-dashed border-gray-300 rounded-2xl h-48 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50/50 hover:border-[#068DFF] transition-colors cursor-pointer group relative overflow-hidden">
              <input 
                type="file" 
                accept="application/pdf"
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFilePdf(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-[#068DFF] mb-3 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              
              {filePdf ? (
                <div className="flex flex-col items-center">
                  <h3 className="text-sm font-bold text-[#068DFF] truncate max-w-[200px]">{filePdf.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{(filePdf.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-bold text-gray-700">Klik untuk pilih file PDF</h3>
                  <p className="text-xs text-gray-400 mt-1">Format PDF (Maksimum 10MB)</p>
                </>
              )}
            </label>

            {/* Spoiler Box */}
            <div className="bg-[#F0F8FF] rounded-2xl p-5 border border-blue-50 flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Pengaturan Kunci Jawaban (Spoiler)</h3>
              
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input 
                  type="checkbox" 
                  checked={useSpoiler}
                  onChange={(e) => setUseSpoiler(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#068DFF] focus:ring-[#068DFF]" 
                />
                <span className="text-sm font-medium text-gray-700">Aktifkan fitur "Lihat Jawaban"</span>
              </label>

              {useSpoiler && (
                <textarea 
                  className="w-full flex-1 p-4 rounded-xl border border-blue-100 bg-white text-sm outline-none focus:ring-2 focus:ring-[#068DFF] resize-none min-h-[120px]"
                  placeholder="Tuliskan ringkasan kunci jawaban atau langkah penyelesaian di sini..."
                ></textarea>
              )}
            </div>

          </div>

          {/* Right Column - Form Inputs */}
          <div className="flex-1 flex flex-col gap-5">
            
            {/* Judul Materi */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Judul Materi</label>
              <input 
                type="text" 
                placeholder="Contoh: UTS Kalkulus 1 2023"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#068DFF] placeholder-gray-400"
              />
            </div>

            {/* Tahun Ajaran and Jenis Ujian */}
            <div className="flex gap-4 relative z-20">
              <div className="flex flex-col gap-1.5 flex-1">
                 <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Tahun Ajaran</label>
                 <CustomSelect 
                   options={tahunAjaranOptions} 
                   value={tahunAjaran} 
                   onChange={setTahunAjaran} 
                   placeholder="Pilih Tahun Ajaran" 
                 />
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                 <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Jenis Ujian</label>
                 <CustomSelect 
                   options={jenisUjianOptions} 
                   value={jenisUjian} 
                   onChange={setJenisUjian} 
                   placeholder="Pilih Jenis Ujian" 
                 />
              </div>
            </div>

            {/* Dosen Pengampu */}
            <div className="flex flex-col gap-1.5 relative z-10">
              <label className="text-xs font-extrabold text-gray-500 uppercase tracking-wider">Dosen Pengampu</label>
              <input 
                type="text" 
                placeholder="Contoh: Hendra Akbar, S.T., M.T."
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#068DFF] placeholder-gray-400"
              />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
