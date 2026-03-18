'use client';
import React from 'react';

export default function SetelanPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8 w-full">
      {/* Header & Judul */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Setelan</h1>

      {/* Menu Tabs */}
      <div className="flex gap-8 border-b border-gray-200 mb-8">
        <button className="text-blue-500 font-bold border-b-2 border-blue-500 pb-3 px-1">
          Data Akun
        </button>
        <button className="text-gray-500 hover:text-gray-700 font-medium pb-3 px-1 transition-colors">
          Pusat Kendali (Maintenance)
        </button>
      </div>

      {/* Grid Cards Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        
        {/* Card 1: Super Admin Master (You) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              {/* Icon User */}
              <div className="text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Super Admin Master</h2>
            </div>
            {/* Badge You */}
            <span className="bg-blue-50 text-blue-500 text-xs font-bold px-4 py-1.5 rounded-full">
              You
            </span>
          </div>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-blue-200">
            Ubah Password
          </button>
        </div>

        {/* Card 2: Bagas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Bagas</h2>
          </div>
          <div className="flex flex-col gap-3">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-blue-200">
              Ubah Password
            </button>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-red-200">
              Hapus Akun
            </button>
          </div>
        </div>

        {/* Card 3: Dinar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-800">Dinar</h2>
          </div>
          <div className="flex flex-col gap-3">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-blue-200">
              Ubah Password
            </button>
            <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md shadow-red-200">
              Hapus Akun
            </button>
          </div>
        </div>

        {/* Tombol Tambah Super Admin */}
        <div className="flex items-start">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 hover:-translate-y-1">
            Tambah Super Admin
          </button>
        </div>

      </div>
    </div>
  );
}
