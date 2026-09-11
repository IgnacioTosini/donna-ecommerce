import { DashboardSection } from "@/components/admin/dashboard/dashboardSection/DashboardSection";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Resumen administrativo de Donna.",
};

export default async function AdminPage() {
  return (
    <>
      <DashboardSection />
    </>
  );
}
