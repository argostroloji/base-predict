import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://basepredict.xyz';

export function GET() {
  return NextResponse.json({
    // Frame v2 / Mini App manifest
    // https://miniapps.farcaster.xyz/docs/specification
    frame: {
      version: '1',
      name: 'Base Predict',
      iconUrl: `${SITE_URL}/icon.png`,
      homeUrl: SITE_URL,
      splashImageUrl: `${SITE_URL}/icon.png`,
      splashBackgroundColor: '#0052FF',
      subtitle: 'When Base Token?',
      description:
        'Mint your prediction for the Base token TGE date. ERC-1155 on Base. Max 10 per date, 1 per wallet.',
      primaryCategory: 'social',
      tags: ['base', 'prediction', 'nft', 'erc1155'],
      heroImageUrl: `${SITE_URL}/og-image.png`,
      ogTitle: 'When Base Token?',
      ogDescription:
        'Mint your prediction for the Base token TGE date.',
      ogImageUrl: `${SITE_URL}/og-image.png`,
    },
    // Account association — fill these in once your domain + Farcaster account are linked.
    // Generate at https://farcaster.xyz/~/developers/mini-apps/manifest
    accountAssociation: {
      header: '',
      payload: '',
      signature: '',
    },
  });
}
