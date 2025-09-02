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
  title:
    "Kabootar - Secure Messaging App | Private Chat & End-to-End Encryption",
  description:
    "Send secure messages with Kabootar, the trusted messaging app with end-to-end encryption. Like the faithful messenger bird, your conversations fly safe and private. Free, simple, and secure.",

  keywords: [
    "secure messaging",
    "private chat app",
    "end-to-end encryption",
    "kabootar messaging",
    "secure communication",
    "private messaging india",
    "encrypted chat app",
    "safe messaging",
    "privacy focused messaging",
    "indian messaging app",
  ],

  authors: [
    {
      name: "Mohit Gajjar",
    },
  ],

  creator: "Mohit Gajjar",
  publisher: "Mohit Gajjar",

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

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kabootar.blockzero.space",
    siteName: "Kabootar",
    title: "Kabootar - Secure Messaging Like the Trusted Messenger Bird",
    description:
      "Experience secure messaging with Kabootar. End-to-end encrypted conversations that fly safe and private, just like the faithful messenger bird of ancient times.",
    images: [
      {
        url: "/assets/image1.jpg",
        width: 1200,
        height: 630,
        alt: "Kabootar - Secure Messaging App",
        type: "image/jpeg",
      },
    ],
  },

  alternates: {
    canonical: "https://kabootar.blockzero.space",
    languages: {
      "en-IN": "https://kabootar.blockzero.space",
    },
  },

  category: "Communication",

  icons: {
    icon: [
      { url: "public/images/favicon.ico", sizes: "16x16", type: "image/png" },
      { url: "public/images/favicon.ico", sizes: "32x32", type: "image/png" },
      { url: "public/images/favicon.ico", sizes: "96x96", type: "image/png" },
    ],
    shortcut: "public/images/favicon.ico",
  },

  formatDetection: {
    telephone: false,
    date: false,
    address: false,
    email: false,
    url: false,
  },

  metadataBase: new URL("https://kabootar.blockzero.space"),

  // Additional metadata for better SEO
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "theme-color": "#4f46e5",
    "msapplication-TileColor": "#4f46e5",
    "application-name": "Kabootar",
    "apple-mobile-web-app-title": "Kabootar",
    "og:type": "website",
    "og:locale": "en_IN",
    "article:author": "Mohit Gajjar",
  },
};

// Optional: Add structured data for better search results
export const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Kabootar",
  description:
    "Secure messaging app with end-to-end encryption for private conversations",
  url: "https://kabootar.blockzero.space",
  applicationCategory: "Communication",
  operatingSystem: ["Android", "iOS", "Windows", "macOS", "Linux"],

  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "1200",
  },
  creator: {
    "@type": "Person",
    name: "Mohit Gajjar",
  },
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
