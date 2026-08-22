"use client";

import { useSession } from "@/components/providers/session-provider";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";

export default function DashboardPage() {
  const { session } = useSession();
  if (!session) return null;
  return session.user.role === "admin" ? <AdminDashboard /> : <EmployeeDashboard />;
}
