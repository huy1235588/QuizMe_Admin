import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalContextProvider } from "@/contexts/GlobalContext";
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
                <GlobalContextProvider>
                    <DashboardShell>
                        {children}
                    </DashboardShell>
                </GlobalContextProvider>
            </body>
        </html>
    );
}
