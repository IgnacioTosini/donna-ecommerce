import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.scss";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"),
  title: {
    default: "Tienda Demo | Indumentaria y moda online",
    template: "%s | Tienda Demo",
  },
  description:
    "Comprá indumentaria seleccionada en una tienda demo. Descubrí novedades, favoritos de temporada y productos destacados.",
  applicationName: "Tienda Demo",
  keywords: [
    "Tienda Demo",
    "indumentaria",
    "moda online",
    "ropa de mujer",
    "ropa de hombre",
    "ecommerce de moda",
  ],
  authors: [{ name: "Tienda Demo" }],
  creator: "Tienda Demo",
  publisher: "Tienda Demo",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Tienda Demo",
    title: "Tienda Demo | Indumentaria y moda online",
    description:
      "Descubrí novedades, favoritos de temporada y productos destacados en una tienda demo.",
    url: "/",
    images: [
      {
        url: "/heroImage.jpg",
        width: 1200,
        height: 630,
        alt: "Tienda Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tienda Demo | Indumentaria y moda online",
    description:
      "Descubrí novedades, favoritos de temporada y productos destacados en una tienda demo.",
    images: ["/heroImage.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: [
    {
      rel: "icon",
      url: "/logo.jpg",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfairDisplay.variable} ${inter.variable}`}>
      <body>
        {children}
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      </body>
    </html>
  );
}
