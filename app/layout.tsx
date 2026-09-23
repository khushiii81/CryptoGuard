import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnimatedBackground from '@/components/AnimatedBackground';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cryptoguard.luckyverse.tech'),
  title: {
    default: 'CryptoGuard — Firewall & Policy Engine Simulator',
    template: '%s | CryptoGuard',
  },
  description:
    'Stateful packet inspection, DMZ zone isolation, and sequential ACL evaluation — simulated in the browser. Build rule sets, inject packets, watch them get blocked.',
  keywords: [
    'firewall simulator',
    'network security',
    'packet filtering',
    'DMZ',
    'stateful inspection',
    'cyber defense',
    'SIEM',
    'syslog',
    'OWASP',
    'access control list',
    'intrusion detection',
  ],
  authors: [{ name: 'CryptoGuard' }],
  creator: 'CryptoGuard',
  publisher: 'CryptoGuard',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cryptoguard.luckyverse.tech',
    siteName: 'CryptoGuard',
    title: 'CryptoGuard — Firewall & Policy Engine Simulator',
    description:
      'Stateful packet inspection, DMZ isolation, sequential ACL evaluation. Inject packets. Watch them get blocked.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CryptoGuard Firewall Simulator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CryptoGuard — Firewall & Policy Engine Simulator',
    description:
      'Stateful packet inspection, DMZ isolation, sequential ACL. Inject packets. Watch them get blocked.',
    images: ['/og-image.png'],
    creator: '@cryptoguard',
  },
  alternates: {
    canonical: 'https://cryptoguard.luckyverse.tech',
  },
};
export const viewport: import('next').Viewport = {
  themeColor: '#0A0D14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-obsidian text-slate-200">
        <AnimatedBackground />
        <Header />
        <main className="flex-1 pt-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
