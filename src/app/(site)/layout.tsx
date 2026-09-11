import { getPublishedContent } from '@/lib/site-content';
import { BusinessProvider } from '@/components/layout/BusinessProvider';
import Footer from "@/components/layout/Footer/Footer";
import Navbar from "@/components/layout/Navbar/Navbar";
import { CartDrawer } from "@/components/cart/CartDrawer/CartDrawer";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Tienda online",
  description:
    "Explorá el calzado y la ropa de Donna en Río Segundo, Córdoba. Envíos a todo el país y 3 y 6 cuotas sin interés.",

  openGraph: {
    title: "Donna | Tienda online",
    description:
      "Explorá el calzado y la ropa de Donna en Río Segundo, Córdoba. Envíos a todo el país y 3 y 6 cuotas sin interés.",
    url: "/",
    siteName: "Donna",
    images: [
      {
        url: "/heroImage.jpg",
        width: 1200,
        height: 630,
        alt: "Donna",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Donna | Tienda online",
    description:
      "Explorá el calzado y la ropa de Donna en Río Segundo, Córdoba. Envíos a todo el país y 3 y 6 cuotas sin interés.",
    images: ["/heroImage.jpg"],
  },
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { business } = await getPublishedContent();
  return (
    <BusinessProvider business={business}>
      <Navbar />
      {children}
      <Footer />
      <CartDrawer />
      <Analytics />
    </BusinessProvider>
  );
}
