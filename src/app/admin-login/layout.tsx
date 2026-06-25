import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Acceso administrador",
    description: "Ingreso al panel de administración de Donna.",
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
