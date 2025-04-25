"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function CategoriesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="container mx-auto px-4 py-6">
                {children}
            </div>
        </ProtectedRoute>
    );
}