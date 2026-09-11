import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@prisma/client';
import { authConfigured, configurationError, getSessionUser, hasRole } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/audit';

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

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value.trim());
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseAdvertInput(body: Record<string, unknown>) {
  const title = typeof body.title === 'string' && body.title.trim() ? body.title.trim() : '';
  if (!title) throw new Error('Provide a title for the promotion banner.');

  const startsAt = parseDate(body.starts_at) ?? new Date();
  const endsAt = parseDate(body.ends_at);
  if (!endsAt) throw new Error('Provide a valid end date and time for the promotion.');
  if (endsAt.getTime() <= startsAt.getTime()) {
    throw new Error('The promotion end time must be after its start time.');
  }

  return {
    title,
    description: typeof body.description === 'string' ? body.description.trim() : '',
    linkUrl: typeof body.link_url === 'string' ? body.link_url.trim() : '',
    buttonText: typeof body.button_text === 'string' ? body.button_text.trim() : '',
    isActive: typeof body.is_active === 'boolean' ? body.is_active : true,
    startsAt,
    endsAt,
  };
}

export async function GET(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can manage promotions.' }, { status: 403 });
    }
    const adverts = await prisma.advert.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ adverts: adverts.map(advertDto) });
  } catch (error) {
    console.error('Error in /api/admin/adverts GET:', error);
    return NextResponse.json({ error: 'Unable to load promotions.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can create promotions.' }, { status: 403 });
    }

    const body = await request.json();
    let data: ReturnType<typeof parseAdvertInput>;
    try {
      data = parseAdvertInput(body);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid promotion details.' },
        { status: 400 }
      );
    }

    const advert = await prisma.advert.create({ data });
    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'CREATE_ADVERT',
      targetType: 'Advert',
      targetId: advert.id,
      details: { title: advert.title, startsAt: advert.startsAt, endsAt: advert.endsAt },
    });

    return NextResponse.json({ advert: advertDto(advert) }, { status: 201 });
  } catch (error) {
    console.error('Error in /api/admin/adverts POST:', error);
    return NextResponse.json({ error: 'Unable to create the promotion.' }, { status: 500 });
  }
}