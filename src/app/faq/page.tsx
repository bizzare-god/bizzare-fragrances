const faqs = [
  {
    question: 'How does boutique ordering and dispatch work?',
    answer: 'Every fragrance is crafted and bottled by Bizzare. Once your order is placed and confirmed via Paystack, it is carefully prepared and dispatched directly to your shipping address.',
  },
  {
    question: 'How do I track my order?',
    answer: 'After checkout, your live order tracker appears in your account page with real-time fulfillment updates: Order Placed → Preparing Scent → Dispatched → Delivered.',
  },
  {
    question: 'Can I purchase a sold-out fragrance edition?',
    answer: 'Sold-out editions remain visible for discovery in our collection, but checkout is disabled until a fresh batch is bottled and restocked in the boutique studio.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'Paystack is our secure checkout gateway supporting debit/credit cards, bank transfers, Apple Pay, and USSD in Nigerian Naira (NGN).',
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-4xl py-16 text-brown-deep">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brown-warm font-mono font-bold">Frequently Asked Questions</p>
      <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-bold">Questions clients ask first.</h1>
      <div className="mt-10 divide-y divide-cream-border border-y border-cream-border bg-white rounded-2xl overflow-hidden shadow-sm">
        {faqs.map((item) => (
          <div key={item.question} className="p-6">
            <h2 className="font-serif text-xl font-bold text-brown-deep">{item.question}</h2>
            <p className="mt-3 text-sm leading-7 text-brown-deep/70">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
