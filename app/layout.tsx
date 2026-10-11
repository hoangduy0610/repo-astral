import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
export const metadata: Metadata = { title: "RepoAstral — Your code. Your universe.", description: "Turn your GitHub repositories into an interactive planetary universe." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body className={`${inter.variable} ${space.variable} ${mono.variable}`}>{children}</body></html>; }
