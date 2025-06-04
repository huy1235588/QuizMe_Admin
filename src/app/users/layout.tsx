import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Users - QuizMe Admin',
    description: 'Manage and view users in the QuizMe admin panel',
};

export default function UsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="min-h-screen">
            {children}
        </section>
    );
}
