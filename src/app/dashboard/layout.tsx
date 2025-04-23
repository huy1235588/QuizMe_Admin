import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard | QuizMe Admin',
    description: 'Administrative dashboard for the QuizMe application',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            {children}
        </div>
    );
}