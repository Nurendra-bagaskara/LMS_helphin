"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import FooterDashboard from "@/components/dashboard/footer_dashboard";

export default function ManajemenAkun() {
  const [dataAdmin, setDataAdmin] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const router = useRouter();

  // Data Select
  const [listProdi, setListProdi] = useState<any[]>([]);
  const [listRole, setListRole] = useState<any[]>([]);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserPermissions(user.permissions || []);
    }
    fetchAdmins();
    fetchProdiList();
    fetchRoleList();
  }, []);

  const fetchRoleList = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("http://localhost:8000/api/roles", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListRole(data.data);
      }
    } catch (e) {
      console.error("Gagal load roles", e);
    }
  };

  const fetchProdiList = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const res = await fetch("http://localhost:8000/api/prodi", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setListProdi(data.data);
      }
    } catch (e) {
      console.error("Gagal load prodi", e);
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login");
        return;
      }
      // Fetch all users and let frontend filter or rely on the fact that these are the "admin" types we care about
      const res = await fetch("http://localhost:8000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      if (data.success) {
        setDataAdmin(data.data);
      }
    } catch (e) {
      console.error("Failed to fetch admin users", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === dataAdmin.length && dataAdmin.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(dataAdmin.map((row) => row.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const hapusDataAdmin = async (id: string) => {
    const isConfirm = window.confirm("Yakin ingin menghapus admin ini?");
    if (!isConfirm) return;

    setOpenMenuId(null);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`http://localhost:8000/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (data.success) {
        alert("Data berhasil dihapus! 🗑️");
        setSelectedIds(selectedIds.filter((selId) => selId !== id));
        fetchAdmins();
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (e) {
      console.error("Gagal menghapus", e);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <div className="flex-1 p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Data Akun Admin Himpunan</h1>
          <p className="text-gray-400 text-sm italic">Kelola semua akses admin organisasi Anda dengan mudah.</p>
        </div>

        <div className="bg-white p-6 rounded-t-xl border-b flex justify-between items-center">
          <input type="text" placeholder="Cari Nama" className="border border-gray-200 p-2 rounded-lg w-72 text-sm focus:outline-blue-500" />
          <div className="space-x-2">
            {(userPermissions.includes("*") || userPermissions.includes("akun:manage")) && (
              <Link href="/superadmin/manajemen/akun/tambah">
                <button className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition">Tambah Akun +</button>
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-sm overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="p-4 border-b">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={dataAdmin.length > 0 && selectedIds.length === dataAdmin.length}
                  />
                </th>
                <th className="p-4 border-b">No</th>
                <th className="p-4 border-b">Nama Lengkap</th>
                <th className="p-4 border-b">Jabatan</th>
                <th className="p-4 border-b text-center">Role</th>
                <th className="p-4 border-b">Email</th>
                <th className="p-4 border-b">Password</th>
                <th className="p-4 border-b">Organisasi</th>
                <th className="p-4 border-b text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={9} className="p-10 text-center text-gray-400 italic">Memuat data...</td></tr>
              ) : dataAdmin.length > 0 ? (
                dataAdmin.map((row, index) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 border-b">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => handleSelectOne(row.id)}
                      />
                    </td>
                    <td className="p-4 border-b">{index + 1}</td>
                    <td className="p-4 border-b font-medium">{row.name}</td>
                    <td className="p-4 border-b">
                      {row.jabatan || "-"}
                    </td>
                    <td className="p-4 border-b text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                        {listRole.find(r => r.code === row.role || r.id === row.roleId)?.name || row.role}
                      </span>
                    </td>

                    <td className="p-4 border-b text-gray-500 lowercase">
                      {row.email}
                    </td>

                    <td className="p-4 border-b font-mono text-gray-400 text-xs">
                      ********
                    </td>

                    <td className="p-4 border-b font-semibold text-blue-600">
                      {listProdi.find(p => p.id === row.prodiId)?.name || "-"}
                    </td>
                    <td className="p-4 border-b text-center relative overflow-visible">
                      {selectedIds.includes(row.id) ? (
                        <button
                          onClick={() => hapusDataAdmin(row.id)}
                          className="bg-red-600 text-white px-4 py-1 rounded-md text-xs font-bold hover:bg-red-700 transition"
                        >
                          Hapus
                        </button>
                      ) : (
                        <div className="relative inline-block overflow-visible">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                            className="text-gray-400 hover:text-black font-bold p-1 text-xl leading-none"
                          >
                            ...
                          </button>

                          {openMenuId === row.id && (
                            <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-100 shadow-2xl rounded-lg z-[50] py-1 animate-in fade-in zoom-in duration-150">
                              {(userPermissions.includes("*") || userPermissions.includes("akun:manage")) && (
                                <>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 font-medium transition flex items-center gap-2"
                                    onClick={() => router.push(`/superadmin/manajemen/akun/edit/${row.id}`)}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 font-medium transition flex items-center gap-2"
                                    onClick={() => hapusDataAdmin(row.id)}
                                  >
                                    🗑️ Hapus
                                  </button>
                                </>
                              )}
                              {!userPermissions.includes("*") && !userPermissions.includes("akun:manage") && (
                                <div className="px-4 py-2 text-xs text-gray-400 italic">No Action</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={9} className="p-10 text-center text-gray-400 italic">Belum ada akun admin.</td></tr>
              )}
            </tbody>
          </table>

          <div className="p-4 bg-white flex justify-between items-center text-sm text-gray-500 border-t rounded-b-xl">
            <div className="flex items-center space-x-2">
              <span>10</span> <span className="text-xs">Rows per page</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs">Page 1 of 1</span>
              <div className="flex space-x-1">
                <button className="px-3 py-1 border rounded-md bg-black text-white text-xs">1</button>
                <button className="px-3 py-1 border rounded-md text-xs hover:bg-gray-50 disabled:opacity-50" disabled>2</button>
                <button className="px-3 py-1 border rounded-md text-xs hover:bg-gray-50 disabled:opacity-50" disabled>3</button>
              </div>
            </div>
          </div>
        </div>

        <FooterDashboard />
      </div>
    </div>
  );
}
