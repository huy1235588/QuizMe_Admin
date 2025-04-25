import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Categories | QuizMe Admin',
    description: 'Manage quiz categories in the QuizMe application',
};

export default function CategoriesLayout({
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