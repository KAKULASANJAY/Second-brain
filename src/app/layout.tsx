import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { Header, Footer } from '@/components/layout';
import './globals.css';

// =============================================================================
// METADATA
// =============================================================================

export const metadata: Metadata = {
  title: 'Second Brain | AI-Powered Knowledge System',
  description:
    'Capture, organize, and query your knowledge with AI-powered summarization, auto-tagging, and semantic search.',
  keywords: ['knowledge management', 'AI', 'notes', 'second brain', 'productivity'],
  authors: [{ name: 'Altibbe Internship Candidate' }],
  openGraph: {
    title: 'Second Brain | AI-Powered Knowledge System',
    description: 'Your personal AI-powered knowledge management system',
    type: 'website',
  },
};

// =============================================================================
// ROOT LAYOUT
// =============================================================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#fafafa',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fafafa',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fafafa',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
