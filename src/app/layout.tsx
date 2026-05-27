import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/Web3Provider';

const inter = Inter({ subsets: ['latin'] });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://basepre.xyz';
const OG_IMAGE = `${SITE_URL}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Base Predict — Free Mint, When Base Token?',
  description: 'Free mint — predict the Base token TGE date. ERC-1155 on Base. Max 10 NFTs per date. Pay only gas. Winners earn 70% in $BASEPRE.',
  openGraph: {
    title: 'When Base Token? — Free Mint on Base',
    description: 'Free mint your prediction for the Base token TGE date. Pay only gas (~$0.01). ERC-1155 on Base.',
    url: SITE_URL,
    siteName: 'Base Predict',
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'Base Predict — Free Mint' }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'When Base Token? — Free Mint',
    description: 'Free mint your prediction for the Base token TGE date. Pay only gas.',
    images: [OG_IMAGE],
  },
  other: {
    // Farcaster Frame v2 / Mini-app metadata
    'fc:frame': JSON.stringify({
      version: 'next',
      imageUrl: OG_IMAGE,
      button: {
        title: 'Free Mint — Predict Base Launch',
        action: {
          type: 'launch_frame',
          name: 'Base Predict',
          url: SITE_URL,
          splashImageUrl: `${SITE_URL}/icon.png`,
          splashBackgroundColor: '#0052FF',
        },
      },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} bg-[#0A0A0A] text-white antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
