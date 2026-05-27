import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://basepre.xyz';

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
        'Mint your prediction for the Base token TGE date. ERC-1155 on Base. Max 10 per date.',
      primaryCategory: 'finance',
      tags: ['base', 'prediction', 'nft', 'tge'],
      heroImageUrl: `${SITE_URL}/og-image.png`,
      ogTitle: 'When Base Token?',
      ogDescription:
        'Mint your prediction for the Base token TGE date.',
      ogImageUrl: `${SITE_URL}/og-image.png`,
      requiredChains: ['eip155:8453'],
      requiredCapabilities: ['actions.signIn', 'actions.openUrl'],
    },
    // Account association — signed for basepre.xyz
    // Re-generate at https://farcaster.xyz/~/developers/mini-apps/manifest
    // if the domain ever changes again.
    accountAssociation: {
      header:
        'eyJmaWQiOjQ1NzQxNiwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGM5YzI5NjY0NWU3ODQ4MDhBOTNiZDVkNzlBMDRkQjgwOEM0NTlmRmEifQ',
      payload: 'eyJkb21haW4iOiJiYXNlcHJlLnh5eiJ9',
      signature:
        'oVcyHAAfZo7eoVcb1NcbuppQG44atg+797RrhzepO10ItmEn+UbckRxysmDXKZTV8fcQK6axL1CGyy7BVQPkSBs=',
    },
  });
}
