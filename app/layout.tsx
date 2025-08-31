import type React from "react";
import type { Metadata } from "next";
import { DM_Sans, Montserrat, Poppins } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Navbar from "@/components/navbar";

export const metadata: Metadata = {
  title: "Kabootar",
  description: "",
};

const dmSans = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${dmSans.variable} ${GeistMono.variable} antialiased`}
      >
        <body className="font-sans">
          <Suspense fallback={null}>
            <Navbar />
            {children}
          </Suspense>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
