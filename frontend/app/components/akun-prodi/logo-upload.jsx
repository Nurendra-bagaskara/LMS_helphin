'use client';
import React, { useState } from "react";
import FilePreview from "../file-preview/page"; 

export default function LogoUpload({ label, onLogoChange }) {
    const [filePreview, setFilePreview] = useState(null);
    const [fileInfo, setFileInfo] = useState({ name: "", size: "" });

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
        <div className="w-[1019px] flex flex-col gap-[12px]">
            <h4 className="text-[14px] font-semibold text-black leading-[20px]">
                {label}
            </h4>

            <div className="w-[1019px] h-[124px] bg-white border border-[#E6E6E6] rounded-[4px] flex items-center justify-center relative shadow-sm overflow-hidden transition-all hover:bg-gray-50">
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
                            <span className="font-bold text-[#0455BF]">Klik disini</span>{" "}
                            <span className="text-[#3A4340]">untuk unggah file atau drag</span>
                            <br/>
                            <span className="text-[10px] text-[#636363] mt-1 inline-block">
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