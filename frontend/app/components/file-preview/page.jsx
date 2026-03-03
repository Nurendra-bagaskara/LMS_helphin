'use client';
import React from "react";
import Image from "next/image";

export default function FilePreview({ name, size, preview, onRemove }) {
    return (
        <div className="w-full flex flex-col px-6 py-2">
            
            {/* 1. Bagian Gambar*/}
            <div className="w-full h-[80px] relative overflow-hidden mb-2">
                {preview ? (
                    <Image 
                        src={preview} 
                        alt="Preview Logo" 
                        fill 
                        className="object-contain object-left"
                        unoptimized 
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 rounded" />
                )}
            </div>

            {/* Container Teks & Icon */}
            <div className="w-full max-w-[300px]">
                {/* 2. Nama File dan Icon Sampah*/}
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-bold text-[#1D1D1D] truncate">
                        {name}
                    </span>

                    <button 
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove();
                        }}
                        className="flex-shrink-0 hover:opacity-70 transition-all p-1"
                        type="button"
                    >
                        <Image
                            src="/images/ion_trash.svg"
                            alt="Hapus"
                            width={12}
                            height={12}
                            unoptimized
                        />
                    </button>
                </div>

                {/* 3. Ukuran File*/}
                <div className="text-[10px] text-[#636363] leading-tight">
                    {size}
                </div>
            </div>
        </div>
    );
}