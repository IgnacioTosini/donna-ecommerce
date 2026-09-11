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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://donna-ecommerce.vercel.app"),
  title: {
    default: "Donna | Calzado y ropa en Río Segundo",
    template: "%s | Donna",
  },
  description:
    "Calzado y ropa en Río Segundo, Córdoba. Descubrí la selección Donna, con envíos a todo el país y 3 y 6 cuotas sin interés.",
  applicationName: "Donna",
  keywords: [
    "Donna",
    "indumentaria",
    "moda online",
    "ropa de mujer",
    "ropa de hombre",
    "ecommerce de moda",
  ],
  authors: [{ name: "Donna" }],
  creator: "Donna",
  publisher: "Donna",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Donna",
    title: "Donna | Calzado y ropa en Río Segundo",
    description:
      "Descubrí calzado y ropa en Donna, Río Segundo, Córdoba. Envíos a todo el país y 3 y 6 cuotas sin interés.",
    url: "/",
    images: [
      {
        url: "/heroImage.jpg",
        width: 1200,
        height: 630,
        alt: "Donna",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Donna | Calzado y ropa en Río Segundo",
    description:
      "Descubrí calzado y ropa en Donna, Río Segundo, Córdoba. Envíos a todo el país y 3 y 6 cuotas sin interés.",
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
