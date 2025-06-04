import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GlobalContextProvider } from "@/contexts/GlobalContext";
import DashboardShell from "@/components/DashboardShell";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';

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

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value || 'en';
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <GlobalContextProvider>
                        <DashboardShell>
                            {children}
                        </DashboardShell>
                    </GlobalContextProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
