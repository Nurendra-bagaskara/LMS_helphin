"use client";
import React from "react";

export default function FormInput({label, placeholder}) {
    return (
        <div className = "flex flex-col gap 1.5 w-full mb-4">
            <label className="text-sm font-bold text-gray-900">
                {label}
            </label>

            <input 
            type="text"
            placeholder={placeholder}
            // Ubah bagian tag <input> atau <select> menjadi:
            className="w-full h-[45px] px-[12px] py-[14px] bg-white border border-[#E6E6E6] rounded-[4px] shadow-[0px_2px_8px_rgba(6,141,255,0.08)] text-[14px] text-[#1D1D1D] placeholder:text-[#636363] outline-none focus:border-[#068DFF] transition-all font-normal"/>
        </div>
    );
}