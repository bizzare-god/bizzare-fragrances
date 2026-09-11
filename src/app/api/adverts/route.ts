import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, configurationError } from '@/lib/auth';
import { prisma } from '@/lib/db';

type AdvertRecord = {
  id: string;
  title: string;
  description: string | null;
  linkUrl: string | null;
  buttonText: string | null;
  isActive: boolean;
  startsAt: Date;
  endsAt: Date;
};

function advertDto(advert: AdvertRecord) {
  return {
    id: advert.id,
    title: advert.title,
    description: advert.description ?? undefined,
    link_url: advert.linkUrl ?? undefined,
    button_text: advert.buttonText ?? undefined,
    is_active: advert.isActive,
    starts_at: advert.startsAt.toISOString(),
    ends_at: advert.endsAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const now = new Date();
    const adverts = await prisma.advert.findMany({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gt: now } },
      orderBy: { startsAt: 'desc' },
    });
    return NextResponse.json({ adverts: adverts.map(advertDto) });
  } catch (error) {
    console.error('Error in /api/adverts GET:', error);
    return NextResponse.json({ error: 'Unable to load active promotions.' }, { status: 500 });
  }
}