import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/components/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ToastProvider from '@/components/Toast';
import GlobalBackground from '@/components/GlobalBackground';
import GlobalChatbot from '@/components/GlobalChatbot';
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'AI Career Mentor',
  description: 'An AI-powered internship and career advisor.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 font-sans antialiased relative min-h-screen">
        <GlobalBackground />
        
        <div className="relative z-10">
          <ErrorBoundary>
            <AuthProvider>
              <ToastProvider />
              {children}
              <GlobalChatbot />
            </AuthProvider>
          </ErrorBoundary>
        </div>
      </body>
    </html>
  );
}

