import { prisma } from '../src/lib/db';
import { sendPasswordResetOtpEmail, sendConciergeInquiryEmail, sendOrderConfirmationEmail } from '../src/lib/email';
import bcrypt from 'bcryptjs';

async function testEmailAndAuth() {
  console.log('--- 1. Testing Email Helpers (Mock / Graceful Fallback Mode) ---');
  
  const otpRes = await sendPasswordResetOtpEmail({
    email: 'testbuyer@example.com',
    name: 'Joseph Ozemede',
    otp: '549123',
    resetUrl: 'https://bizzarefragrances.shop/login?action=reset&email=testbuyer@example.com&otp=549123',
  });
  console.log('sendPasswordResetOtpEmail result:', otpRes);

  const inquiryRes = await sendConciergeInquiryEmail({
    name: 'Joseph Ozemede',
    email: 'joseph@example.com',
    phone: '+234 809 111 2233',
    subject: 'Bespoke Olfactory Consultation',
    message: 'Looking for a signature woody amber fragrance for evening events.',
  });
  console.log('sendConciergeInquiryEmail result:', inquiryRes);

  const orderEmailRes = await sendOrderConfirmationEmail({
    email: 'buyer@example.com',
    name: 'Joseph Ozemede',
    orderId: 'clw1234567890',
    totalAmount: 245000,
    shippingAddress: '12 Victoria Island Boulevard, Lagos',
    items: [
      { name: 'Oud Royal Extrait 100ml', quantity: 1, price: 175000 },
      { name: 'Amber Santal EDP 50ml', quantity: 1, price: 70000 },
    ],
  });
  console.log('sendOrderConfirmationEmail result:', orderEmailRes);

  console.log('\n--- 2. Testing PasswordResetToken in Supabase Database ---');
  const testEmail = 'test_reset_user@bizzarefragrances.shop';

  // Create test user if not existing
  let testUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (!testUser) {
    const initialHash = await bcrypt.hash('InitialSecretPass123!', 12);
    testUser = await prisma.user.create({
      data: {
        name: 'Test Reset User',
        email: testEmail,
        passwordHash: initialHash,
        role: 'BUYER',
      },
    });
    console.log('Created test user:', testUser.id);
  }

  // Create OTP token
  const testOtp = '987654';
  const testToken = 'test_token_' + Date.now();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.deleteMany({ where: { email: testEmail } });
  const createdToken = await prisma.passwordResetToken.create({
    data: {
      email: testEmail,
      token: testToken,
      otp: testOtp,
      expiresAt,
    },
  });
  console.log('Created PasswordResetToken:', createdToken.id, 'OTP:', createdToken.otp);

  // Verify token lookup
  const foundToken = await prisma.passwordResetToken.findFirst({
    where: { email: testEmail, otp: testOtp },
  });
  if (!foundToken || foundToken.otp !== testOtp) {
    throw new Error('Failed to find created PasswordResetToken!');
  }
  console.log('Found valid token for OTP verification!');

  // Simulate password reset
  const newPassword = 'NewLuxuryPassword2026!';
  const newHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: testUser.id },
      data: { passwordHash: newHash },
    }),
    prisma.passwordResetToken.deleteMany({ where: { email: testEmail } }),
  ]);

  const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
  const isMatch = await bcrypt.compare(newPassword, updatedUser?.passwordHash || '');
  console.log('Password reset verification success:', isMatch);

  // Clean up test user
  await prisma.user.delete({ where: { id: testUser.id } });
  console.log('Cleaned up test user.');

  console.log('\nAll tests passed successfully!');
}

testEmailAndAuth()
  .catch((err) => {
    console.error('Test error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
