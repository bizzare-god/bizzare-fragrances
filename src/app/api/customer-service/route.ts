import { NextRequest, NextResponse } from 'next/server';
import { sendConciergeInquiryEmail } from '@/lib/email';
import { rateLimit, requestIdentifier } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
    const subject = typeof body.subject === 'string' ? body.subject.trim() : undefined;
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    if (!message || message.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a message of at least 10 characters describing your inquiry.' },
        { status: 400 }
      );
    }

    const limit = rateLimit(`concierge-inquiry:${requestIdentifier(request, email)}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: 'Too many inquiries sent. Please wait a few minutes before submitting again.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
      );
    }

    const emailResult = await sendConciergeInquiryEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    if (!emailResult.success) {
      console.error('[Concierge Form Forwarding Error]:', emailResult.error);
    }

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. Your message has been received by our concierge desk.',
    });
  } catch (error) {
    console.error('Error in /api/customer-service:', error);
    return NextResponse.json({ error: 'Unable to submit your inquiry. Please try again.' }, { status: 500 });
  }
}
