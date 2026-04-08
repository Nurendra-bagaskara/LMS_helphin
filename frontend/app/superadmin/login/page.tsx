"use client";

import LoginView from "@/components/LoginView";

export default function SuperAdminLoginPage() {
  return <LoginView roleTitle="Superadmin" redirectPath="/superadmin/dashboard" />;
}
