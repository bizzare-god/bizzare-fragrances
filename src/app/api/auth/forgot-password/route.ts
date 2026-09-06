import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { authConfigured, configurationError } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { sendPasswordResetOtpEmail } from '@/lib/email';
import { rateLimit, requestIdentifier } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    if (!authConfigured()) return configurationError();

    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const limit = rateLimit(`forgot-password:${requestIdentifier(request, email)}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please wait a few minutes before trying again.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    // If user does not exist, return a generic message to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a verification code has been sent.',
      });
    }

    // Generate secure 6-digit numeric OTP and crypto token
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete existing tokens for this email to prevent clutter
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Save token & OTP in DB
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        otp,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://bizzarefragrances.shop'}/login?action=reset&email=${encodeURIComponent(email)}&otp=${otp}&token=${token}`;

    // Send email via Resend
    await sendPasswordResetOtpEmail({
      email,
      name: user.name,
      otp,
      resetUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email.',
      email,
      token,
    });
  } catch (error) {
    console.error('Error in /api/auth/forgot-password:', error);
    return NextResponse.json({ error: 'Unable to process reset request. Please try again.' }, { status: 500 });
  }
}
