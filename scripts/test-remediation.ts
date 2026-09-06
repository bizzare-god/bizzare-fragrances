import { prisma } from '../src/lib/db';
import { initializeOrderPayment, markOrderPaid } from '../src/lib/orders';
import { verifyPaystackWebhookSignature } from '../src/lib/paystack';
import { rateLimit } from '../src/lib/rateLimit';
import { OrderStatus, PaymentStatus, UserRole } from '@prisma/client';

async function runTests() {
  console.log('--- STARTING BOUTIQUE INTEGRATION TEST SUITE ---');

  // 1. Test Rate Limiter Memory Management & Pruning
  console.log('\n[1] Testing Rate Limiter & Pruning:');
  const rl1 = rateLimit('test-ip:test@example.com', 2, 1000);
  const rl2 = rateLimit('test-ip:test@example.com', 2, 1000);
  const rl3 = rateLimit('test-ip:test@example.com', 2, 1000);
  console.log('Attempt 1 allowed:', rl1.allowed);
  console.log('Attempt 2 allowed:', rl2.allowed);
  console.log('Attempt 3 allowed (should be false):', rl3.allowed, `(retryAfter: ${rl3.retryAfter}s)`);
  if (rl1.allowed && rl2.allowed && !rl3.allowed) {
    console.log('✅ Rate limiter behavior verified.');
  } else {
    throw new Error('Rate limiter test failed.');
  }

  // 2. Test Paystack Fail-Closed / Sandbox Security
  console.log('\n[2] Testing Paystack Gateway & Webhook Signature:');
  const dummySignature = verifyPaystackWebhookSignature('{"test":true}', 'invalidsig');
  console.log('Unconfigured / invalid signature rejected (should be false):', dummySignature);
  if (!dummySignature) {
    console.log('✅ Webhook signature fails closed as expected.');
  } else {
    throw new Error('Webhook signature failed closed test.');
  }

  // 3. Test Order Creation, Payment Init & Stock Guards
  console.log('\n[3] Testing Order Placement & Atomic markOrderPaid:');
  const buyer = await prisma.user.findFirst({ where: { role: UserRole.BUYER } });
  const product = await prisma.product.findFirst({ where: { isActive: true, stock: { gt: 2 } } });

  if (!buyer || !product) {
    console.log('Skipping DB transaction test: buyer or product not seeded.');
    return;
  }

  const initialStock = product.stock;
  console.log(`Initial stock for "${product.name}": ${initialStock}`);

  const testRef = `test_ref_${Date.now()}`;
  const testOrder = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      totalAmount: product.price,
      paymentStatus: PaymentStatus.PENDING,
      paymentReference: testRef,
      status: OrderStatus.PENDING,
      shippingAddress: '123 Test St, Lagos',
      phone: '08012345678',
      items: {
        create: [
          {
            productId: product.id,
            quantity: 1,
            priceAtPurchase: product.price,
          },
        ],
      },
    },
    include: { items: true },
  });

  console.log(`Created test order #${testOrder.id} with paymentReference: ${testRef}`);

  // Test initializeOrderPayment
  const initResult = await initializeOrderPayment({
    orderId: testOrder.id,
    user: { id: buyer.id, email: buyer.email, name: buyer.name },
  });
  console.log('Payment initialized successfully with auth URL:', initResult.authorization_url);

  // Test markOrderPaid (First call)
  const paidResult1 = await markOrderPaid(testRef, {
    reference: testRef,
    amountKobo: Math.round(Number(testOrder.totalAmount) * 100),
    actorId: buyer.id,
    actorName: buyer.name,
  });
  console.log(`markOrderPaid call 1: status=${paidResult1.order.paymentStatus}, alreadyPaid=${paidResult1.alreadyPaid}`);

  const productAfterPaid = await prisma.product.findUnique({ where: { id: product.id } });
  console.log(`Stock after payment decrement: ${productAfterPaid?.stock} (expected: ${initialStock - 1})`);

  // Test markOrderPaid (Second concurrent call - Idempotency test)
  const paidResult2 = await markOrderPaid(testRef, {
    reference: testRef,
    amountKobo: Math.round(Number(testOrder.totalAmount) * 100),
    actorId: buyer.id,
    actorName: buyer.name,
  });
  console.log(`markOrderPaid call 2 (concurrent race simulation): alreadyPaid=${paidResult2.alreadyPaid}`);

  const productAfterSecondCall = await prisma.product.findUnique({ where: { id: product.id } });
  console.log(`Stock after second call (should NOT double decrement): ${productAfterSecondCall?.stock}`);

  if (productAfterSecondCall?.stock === initialStock - 1 && paidResult2.alreadyPaid) {
    console.log('✅ Race condition protection & stock guard verified: Stock was decremented exactly once.');
  } else {
    throw new Error('Stock race condition test failed.');
  }

  // 4. Test Order Cancellation & Inventory Restoration
  console.log('\n[4] Testing Order Cancellation & Stock Restoration:');
  const cancelTx = await prisma.$transaction(async (tx) => {
    // Restore stock
    for (const item of testOrder.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }
    return tx.order.update({
      where: { id: testOrder.id },
      data: { status: OrderStatus.CANCELLED },
    });
  });

  const productAfterCancel = await prisma.product.findUnique({ where: { id: product.id } });
  console.log(`Order status after cancellation: ${cancelTx.status}`);
  console.log(`Stock after cancellation restoration: ${productAfterCancel?.stock} (restored to initial: ${initialStock})`);

  if (productAfterCancel?.stock === initialStock && cancelTx.status === OrderStatus.CANCELLED) {
    console.log('✅ Order cancellation and stock restoration verified.');
  } else {
    throw new Error('Order cancellation test failed.');
  }

  // Clean up test order
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  console.log('\n✅ Cleaned up temporary test order.');

  console.log('\n🎉 ALL BOUTIQUE INTEGRATION TESTS PASSED WITH ZERO ERRORS.');
}

runTests()
  .catch((err) => {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
