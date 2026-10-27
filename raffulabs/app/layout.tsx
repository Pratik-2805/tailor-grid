import type { Metadata } from "next";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "RaffuLabs — Parent Company of Raffu | Building the Future of Fashion Services",
  description:
    "RaffuLabs is the innovation studio and parent company behind Raffu — the certified studio allocation & tailoring platform. We connect customers with vetted neighborhood master ateliers for in-person fitting, fixed pricing, and a 100% fit guarantee. Explore our product ecosystem including Raffu Studio OS, Enterprise Fit, and the upcoming Raffu Mobile App.",
  keywords: [
    "RaffuLabs",
    "Raffu",
    "tailoring platform",
    "studio allocation",
    "clothing alterations",
    "fashion technology",
    "master tailors",
    "garment repair",
    "India tailoring",
    "in-person fitting",
    "fit guarantee",
    "invisible darning",
    "hemming service",
    "suit alterations",
    "dress alterations",
    "tailoring app",
    "neighborhood tailor",
  ],
  openGraph: {
    title: "RaffuLabs — Building the Future of Fashion Services",
    description:
      "Parent company of Raffu — the certified studio allocation & tailoring platform. In-person fitting, fixed pricing, 100% fit guarantee.",
    siteName: "RaffuLabs",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "RaffuLabs — Parent Company of Raffu",
    description:
      "Building digital infrastructure for fashion services. Our flagship product Raffu connects customers with certified neighborhood tailoring studios.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://raffulabs.in",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Outfit:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#FBF6EF" />
        <meta name="author" content="RaffuLabs Inc. (Delaware, USA)" />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
