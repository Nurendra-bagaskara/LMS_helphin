"use client";

import LoginView from "@/components/LoginView";

export default function AdminLoginPage() {
  return <LoginView roleTitle="Admin Prodi" redirectPath="/admin/dashboard" />;
}
