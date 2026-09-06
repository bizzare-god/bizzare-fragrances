import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, configurationError } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { rateLimit, requestIdentifier } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    if (!authConfigured()) return configurationError();

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
    const token = typeof body.token === 'string' ? body.token.trim() : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    const limit = rateLimit(`reset-password:${requestIdentifier(request, email)}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait a few minutes before trying again.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    if (!email || (!otp && !token)) {
      return NextResponse.json({ error: 'Please provide your email and 6-digit verification code.' }, { status: 400 });
    }

    if (!newPassword || newPassword.length < 12) {
      return NextResponse.json({ error: 'Your new password must contain at least 12 characters.' }, { status: 400 });
    }

    // Look for valid matching token
    const tokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        email,
        OR: [
          ...(otp ? [{ otp }] : []),
          ...(token ? [{ token }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!tokenRecord) {
      return NextResponse.json({ error: 'Invalid verification code or email address.' }, { status: 400 });
    }

    if (new Date() > tokenRecord.expiresAt) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } });
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User account not found.' }, { status: 404 });
    }

    // Hash new password and update user
    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { email },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Your password has been successfully reset. Please sign in with your new credentials.',
    });
  } catch (error) {
    console.error('Error in /api/auth/reset-password:', error);
    return NextResponse.json({ error: 'Unable to reset password. Please try again.' }, { status: 500 });
  }
}
