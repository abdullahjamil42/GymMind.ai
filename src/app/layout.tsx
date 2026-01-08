import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth/AuthProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: {
    default: 'GymMind.ai - AI-Powered Gym Coach',
    template: '%s | GymMind.ai',
  },
  description:
    'Your intelligent gym companion. Get personalized workout plans, nutrition tracking, and real-time form analysis powered by AI.',
  keywords: [
    'AI gym coach',
    'workout planner',
    'fitness AI',
    'exercise form checker',
    'nutrition tracker',
    'gym assistant',
  ],
  authors: [{ name: 'GymMind.ai Team' }],
  creator: 'GymMind.ai',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://gymmind.ai',
    title: 'GymMind.ai - AI-Powered Gym Coach',
    description:
      'Your intelligent gym companion. Get personalized workout plans, nutrition tracking, and real-time form analysis powered by AI.',
    siteName: 'GymMind.ai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GymMind.ai - AI-Powered Gym Coach',
    description:
      'Your intelligent gym companion. Get personalized workout plans, nutrition tracking, and real-time form analysis powered by AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
