'use client';
import React, { useState } from "react";
import FilePreview from "../file-preview/page"; 

/**
 * @param {{ label: string, onLogoChange: (file: any) => void, initialPreview?: string | null }} props
 */
export default function LogoUpload({ label, onLogoChange, initialPreview = null }) {
    const [filePreview, setFilePreview] = useState(initialPreview || null);
    const [fileInfo, setFileInfo] = useState({ name: initialPreview ? "Logo Saat Ini" : "", size: "" });

    // Sync preview if initialPreview changes (for async loading in Edit page)
    React.useEffect(() => {
        if (initialPreview) {
            setFilePreview(initialPreview);
            setFileInfo({ name: "Logo Saat Ini", size: "" });
        }
    }, [initialPreview]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result;
                setFilePreview(base64);
                setFileInfo({ 
                    name: file.name, 
                    size: (file.size / (1024 * 1024)).toFixed(2) + " MB" 
                });
                
                // Mengirim data ke halaman utama (BuatAkunProdi)
                if (onLogoChange) onLogoChange(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemove = () => {
        setFilePreview(null);
        if (onLogoChange) onLogoChange(null);
    };

    return (
        <div className="w-full flex flex-col gap-[12px]">
            <h4 className="text-[14px] font-semibold text-black dark:text-slate-100 leading-[20px]">
                {label}
            </h4>

            <div className="w-full h-[124px] bg-white dark:bg-slate-800/40 border border-[#E6E6E6] dark:border-slate-700 rounded-[4px] flex items-center justify-center relative shadow-sm overflow-hidden transition-all hover:bg-gray-50 dark:hover:bg-slate-800/60">
                {!filePreview ? (
                    <div className="flex flex-col items-center">
                        {/* Ikon Dokumen Biru*/}
                        <div className="w-[65px] h-[63px] mb-1"
                             style={{
                                 backgroundImage: "url('/images/Group 197.svg')",
                                 backgroundSize: "contain",
                                 backgroundRepeat: "no-repeat",
                                 backgroundPosition: "center"
                             }}>
                        </div>

                        <p className="text-[14px] leading-[16px] text-center">
                            <span className="font-bold text-[#0455BF] dark:text-blue-400">Klik disini</span>{" "}
                            <span className="text-[#3A4340] dark:text-slate-300">untuk unggah file atau drag</span>
                            <br/>
                            <span className="text-[10px] text-[#636363] dark:text-slate-500 mt-1 inline-block">
                                Support Format: JPG, JPEG, SVG, PNG
                            </span>
                        </p>

                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                        />
                    </div>
                ) : (
                    /* Menampilkan Gambar Preview & Tombol Hapus (Tong Sampah) */
                    <FilePreview 
                        name={fileInfo.name} 
                        size={fileInfo.size} 
                        preview={filePreview} 
                        onRemove={handleRemove} 
                    />
                )}
            </div>
        </div>
    );
}