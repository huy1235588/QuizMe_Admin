import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quizzes - QuizMe Admin',
  description: 'Manage and view quizzes in the QuizMe admin panel',
};

export default function QuizzesLayout({
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