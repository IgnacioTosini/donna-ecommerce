import Footer from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/Navbar/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer/CartDrawer";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Tienda online",
  description:
    "Comprá indumentaria seleccionada en una tienda demo. Encontrá novedades, bestsellers y colecciones para mujer y hombre.",

  openGraph: {
    title: "Tienda Demo | Tienda online",
    description:
      "Comprá indumentaria seleccionada en una tienda demo. Encontrá novedades, bestsellers y colecciones para mujer y hombre.",
    url: "/",
    siteName: "Tienda Demo",
    images: [
      {
        url: "/heroImage.jpg",
        width: 1200,
        height: 630,
        alt: "Tienda Demo",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Tienda Demo | Tienda online",
    description:
      "Comprá indumentaria seleccionada en una tienda demo. Encontrá novedades, bestsellers y colecciones para mujer y hombre.",
    images: ["/heroImage.jpg"],
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CartDrawer />
      <Analytics />
    </>
  );
}
