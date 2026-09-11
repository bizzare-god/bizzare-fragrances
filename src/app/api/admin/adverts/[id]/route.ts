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

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can update promotions.' }, { status: 403 });
    }

    const existing = await prisma.advert.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Promotion not found.' }, { status: 404 });

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (typeof body.title === 'string' && body.title.trim()) updates.title = body.title.trim();
    if (typeof body.description === 'string') updates.description = body.description.trim();
    if (typeof body.link_url === 'string') updates.linkUrl = body.link_url.trim();
    if (typeof body.button_text === 'string') updates.buttonText = body.button_text.trim();
    if (typeof body.is_active === 'boolean') updates.isActive = body.is_active;

    if (body.starts_at !== undefined || body.ends_at !== undefined) {
      const startsAt = parseDate(body.starts_at) ?? existing.startsAt;
      const endsAt = parseDate(body.ends_at) ?? existing.endsAt;
      if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
        return NextResponse.json({ error: 'Provide valid start and end dates for the promotion.' }, { status: 400 });
      }
      if (endsAt.getTime() <= startsAt.getTime()) {
        return NextResponse.json({ error: 'The promotion end time must be after its start time.' }, { status: 400 });
      }
      updates.startsAt = startsAt;
      updates.endsAt = endsAt;
    }

    const advert = await prisma.advert.update({ where: { id: existing.id }, data: updates });
    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'UPDATE_ADVERT',
      targetType: 'Advert',
      targetId: advert.id,
      details: updates,
    });

    return NextResponse.json({ advert: advertDto(advert) });
  } catch (error) {
    console.error('Error updating promotion:', error);
    return NextResponse.json({ error: 'Unable to update the promotion.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!authConfigured()) return configurationError();
  try {
    const user = await getSessionUser(request);
    if (!user || !hasRole(user.role, [UserRole.ADMIN])) {
      return NextResponse.json({ error: 'Only boutique administrators can remove promotions.' }, { status: 403 });
    }

    const existing = await prisma.advert.findUnique({ where: { id: params.id } });
    if (!existing) return NextResponse.json({ error: 'Promotion not found.' }, { status: 404 });

    await prisma.advert.delete({ where: { id: existing.id } });
    await recordAuditLog({
      actorId: user.id,
      actorName: user.name,
      action: 'DELETE_ADVERT',
      targetType: 'Advert',
      targetId: existing.id,
      details: { title: existing.title },
    });

    return NextResponse.json({ message: 'Promotion deleted.' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    return NextResponse.json({ error: 'Unable to delete the promotion.' }, { status: 500 });
  }
}