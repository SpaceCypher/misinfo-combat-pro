import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MisInfo Combat Pro - AI-Powered Misinformation Detection",
  description: "Combat misinformation with AI-powered detection, interactive training, and real-time claim verification. Empowering Indian citizens to fight fake news.",
  keywords: "misinformation, fact-checking, AI, fake news, verification, India, education",
  authors: [{ name: "MisInfo Combat Pro Team" }],
  creator: "MisInfo Combat Pro",
  publisher: "MisInfo Combat Pro",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://misinfocombatpro.com",
    title: "MisInfo Combat Pro - AI-Powered Misinformation Detection",
    description: "Combat misinformation with AI-powered detection, interactive training, and real-time claim verification.",
    siteName: "MisInfo Combat Pro",
  },
  twitter: {
    card: "summary_large_image",
    title: "MisInfo Combat Pro - AI-Powered Misinformation Detection",
    description: "Combat misinformation with AI-powered detection, interactive training, and real-time claim verification.",
  },

};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
};

import ClientLayout from './client-layout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white text-gray-900`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
