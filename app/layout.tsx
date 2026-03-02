import type { Metadata } from "next";
import { Figtree, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/src/components/NavBar";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Yunie Joo — Product Designer",
  description: "Portfolio of Yunie Joo, a systems-first product designer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${figtree.variable} ${ibmPlexMono.variable} antialiased pt-16`}
      >
        <NavBar />
        {children}
      </body>
    </html>
  );
}
