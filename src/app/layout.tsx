import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotistackProvider } from "@/contexts/NotistackContext";
import DashboardShell from "@/components/DashboardShell";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "QuizMe Admin",
    description: "Admin panel for QuizMe application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider>
                    <AuthProvider>
                        <NotistackProvider>
                            <DashboardShell>
                                {children}
                            </DashboardShell>
                        </NotistackProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
