import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Acceso administrador",
    description: "Ingreso al panel de administración de Tienda Demo.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
