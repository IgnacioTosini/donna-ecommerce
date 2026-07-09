import { Dashboard } from "@/components/admin/dashboard/Dashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Panel de administración",
    template: "%s | Admin Tienda Demo",
  },
  description: "Panel de administración de Tienda Demo",

  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="admin-layout">
      <Dashboard />
      {children}
    </main>
  );
}
