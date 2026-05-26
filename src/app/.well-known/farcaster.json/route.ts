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
    // Account association — signed for base-predict-delta.vercel.app
    accountAssociation: {
      header: 'eyJmaWQiOjQ1NzQxNiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweEIzZTM3YTZGOENDNzIyRjlCQzk2MDA0NUUyNTNkODkyODVEMjkzMDYifQ',
      payload: 'eyJkb21haW4iOiJiYXNlLXByZWRpY3QtZGVsdGEudmVyY2VsLmFwcCJ9',
      signature: '3THBxcyXV38JWAgMGa072Ik2mr5GJ1HUZSaGJHYnvhR8aEtkadlf0kP1ER943N37vKrzP/RAjfvnDbyRzitFnhs=',
    },
  });
}
