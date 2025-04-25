"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                {children}
            </div>
        </ProtectedRoute>
    );
}