import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import RegisterServiceWorker from "./register-sw";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "UPSC Tracker Pro",
  description: "Progressive 75-day UPSC preparation tracker with AI-powered insights",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "UPSC Tracker Pro",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 overflow-x-hidden`}>
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
