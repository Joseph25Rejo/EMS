import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

// Load fonts with subsets for better performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-inter",
});

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Kala4Reason - Explore Indian Art & Culture",
  description: "Discover the rich heritage of Indian art and culture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
