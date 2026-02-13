import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WORD SQUARES - Daily Word Puzzle Game",
  description: "Challenge yourself with a new word puzzle every day. Play WORD SQUARES now!",
  keywords: ["puzzle", "word game", "daily puzzle", "brain teaser"],
  authors: [{ name: "WORD SQUARES" }],
  openGraph: {
    title: "WORD SQUARES - Daily Word Puzzle Game",
    description: "Challenge yourself with a new word puzzle every day.",
    type: "website",
  },
  icons: {
    icon: '/logo2.png',
    shortcut: '/logo2.png',
    apple: '/logo2.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo2.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
