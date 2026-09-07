'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  Search,
  X,
  Headphones,
  ShoppingBag,
  MessageCircle,
  RotateCcw,
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'Ordering & Delivery' | 'Fragrance & Longevity' | 'Payment & Security' | 'Authenticity & Care';
  question: string;
  answer: string;
}

const CATEGORIES = [
  'All Questions',
  'Ordering & Delivery',
  'Fragrance & Longevity',
  'Payment & Security',
  'Authenticity & Care',
] as const;

const FAQ_DATA: FaqItem[] = [
  {
    id: 'dispatch-process',
    category: 'Ordering & Delivery',
    question: 'Where do you source your fragrances and how does ordering & dispatch work?',
    answer:
      'All our perfumes are 100% genuine, authentic luxury and niche fragrances imported directly from reputable perfume houses, certified distributors, and perfumeries across France, the UAE / Middle East, Italy, the UK, and beyond. Once you place an order via Paystack, our boutique team inspects the manufacturer seals and packaging, prepares your order with bespoke protective care, and dispatches it via express tracked courier directly to your doorstep across Nigeria.',
  },
  {
    id: 'delivery-timeline',
    category: 'Ordering & Delivery',
    question: 'How long does delivery take across Lagos and other Nigerian states?',
    answer:
      'Deliveries within Lagos are typically completed within 24 to 48 hours. Deliveries to Abuja, Port Harcourt, and other states across Nigeria typically take 2 to 4 business days via tracked nationwide courier service. You receive immediate updates on every phase.',
  },
  {
    id: 'order-tracking',
    category: 'Ordering & Delivery',
    question: 'How do I track the live status of my perfume order?',
    answer:
      'After completing checkout, your live Order Tracker is available instantly in your My Account page (/account). The tracker displays four real-time stages: Order Placed → Preparing Scent → Dispatched → Delivered.',
  },
  {
    id: 'address-change',
    category: 'Ordering & Delivery',
    question: 'Can I change my delivery address or contact number after ordering?',
    answer:
      'If you need to update your address or phone number, please contact our concierge desk immediately via WhatsApp at +234 911 474 3607 or email concierge@bizzarefragrances.shop before your package leaves our boutique for courier dispatch.',
  },
  {
    id: 'concentration-longevity',
    category: 'Fragrance & Longevity',
    question: 'What concentration are the fragrances, and how long do they last?',
    answer:
      'We curate premium high-concentration Extrait de Parfum and Eau de Parfum editions from prestigious international perfume houses. Known for their rich accords (pure oud, Damask rose, smoked amber, bourbon vanilla, rare woods), these authentic formulations typically project for 8 to 14+ hours with exceptional sillage on skin and fabrics.',
  },
  {
    id: 'application-storage',
    category: 'Fragrance & Longevity',
    question: 'How should I apply and store my imported perfume for best performance?',
    answer:
      'Apply to pulse points (wrists, neck, inner elbows, and collarbones) on moisturized skin for maximum longevity. Store your bottles upright in a cool, dry space away from direct sunlight and extreme heat to preserve the imported formulation and raw accords.',
  },
  {
    id: 'sold-out-editions',
    category: 'Fragrance & Longevity',
    question: 'Can I purchase or reserve a sold-out fragrance edition?',
    answer:
      'Sold-out editions remain visible for discovery in our collection while our procurement team coordinates international restocking and fresh shipments from our overseas partners. You can contact our concierge desk via WhatsApp (+234 911 474 3607) to request restock notification priority.',
  },
  {
    id: 'bespoke-consultation',
    category: 'Fragrance & Longevity',
    question: 'Do you offer personal scent guidance or custom recommendations?',
    answer:
      'Yes! Our fragrance concierge desk offers complimentary olfactory consultations. Simply visit our Customer Service page (/customer-service) or chat with us on WhatsApp to tell us your favorite notes, occasion, and scent mood.',
  },
  {
    id: 'payment-methods',
    category: 'Payment & Security',
    question: 'What payment methods are supported via Paystack?',
    answer:
      'Paystack is our official secure checkout gateway supporting all Nigerian debit/credit cards (Mastercard, Visa, Verve), Direct Bank Transfers, USSD, and Apple Pay. All transactions are securely encrypted and settled in Nigerian Naira (NGN).',
  },
  {
    id: 'payment-security',
    category: 'Payment & Security',
    question: 'Is my financial and payment information secure?',
    answer:
      'Yes, 100%. We utilize Paystack’s PCI-DSS Level 1 certified checkout infrastructure with end-to-end tokenization. Bizzare Fragrances never stores your card details, CVV, or banking PINs.',
  },
  {
    id: 'payment-unconfirmed',
    category: 'Payment & Security',
    question: 'What should I do if my bank account was debited but my order shows pending?',
    answer:
      'In rare cases of bank network delays, your order will automatically confirm as soon as the Paystack webhook completes. If you need immediate confirmation, simply send your Paystack reference or debit alert to concierge@bizzarefragrances.shop or WhatsApp +234 911 474 3607 for instant manual verification.',
  },
  {
    id: 'authenticity-returns',
    category: 'Authenticity & Care',
    question: 'Are all fragrances 100% authentic and what is your return policy?',
    answer:
      'Every single bottle in our boutique is guaranteed 100% genuine and authentic, directly imported in its original manufacturer packaging. We have zero tolerance for imitations or counterfeit products. Due to hygiene and luxury perfumery standards, opened bottles cannot be returned, but in the rare event of transit damage or delivery defects, our concierge team provides an immediate replacement or resolution.',
  },
];

export default function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'dispatch-process': true,
    'concentration-longevity': true,
  });

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    FAQ_DATA.forEach((item) => {
      allOpen[item.id] = true;
    });
    setOpenItems(allOpen);
  };

  const collapseAll = () => {
    setOpenItems({});
  };

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FAQ_DATA.filter((item) => {
      const matchesCat =
        selectedCategory === 'All Questions' || item.category === selectedCategory;
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:py-16 text-brown-deep">
      {/* Header Banner */}
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-brown-warm font-mono font-bold">
          Frequently Asked Questions
        </p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-bold leading-tight">
          Answers & Guidance for Clients
        </h1>
        <p className="mt-4 text-base leading-8 text-brown-deep/75">
          Everything you need to know about our artisanal extraits, nationwide delivery, secure Paystack checkout, and boutique customer service.
        </p>
      </div>

      {/* Interactive Search Bar */}
      <div className="mt-8 relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brown-warm" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions by topic (e.g. delivery, Paystack, longevity, tracking)..."
          className="h-12 w-full rounded-2xl border border-cream-border bg-white pl-12 pr-10 text-sm font-medium text-brown-deep placeholder:text-brown-deep/40 shadow-sm focus:border-brown focus:outline-none focus:ring-1 focus:ring-brown"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-brown-deep/40 hover:text-brown-deep"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
              selectedCategory === cat
                ? 'bg-brown text-white shadow-sm'
                : 'border border-cream-border bg-white text-brown-deep/70 hover:border-brown hover:text-brown-deep'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expand / Collapse Controls */}
      <div className="mt-6 flex items-center justify-between text-xs text-brown-deep/60 font-mono">
        <span>
          Showing <strong className="text-brown-deep font-bold">{filteredFaqs.length}</strong> questions
        </span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={expandAll}
            className="font-bold uppercase tracking-wider text-brown hover:underline"
          >
            Expand All
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="font-bold uppercase tracking-wider text-brown-deep/60 hover:text-brown-deep hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Accordion List */}
      <div className="mt-4 space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="rounded-2xl border border-cream-border bg-white p-10 text-center">
            <Search className="mx-auto h-8 w-8 text-brown-warm" />
            <h3 className="mt-3 font-serif text-xl font-bold text-brown-deep">No matching questions found</h3>
            <p className="mt-1 text-xs text-brown-deep/60">
              Try searching with different keywords or contact our concierge desk directly.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Questions');
              }}
              className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-brown px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brown-hover"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isOpen = !!openItems[item.id];
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-cream-border bg-white transition-all duration-200 hover:border-brown/40 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors hover:bg-cream-soft/40"
                >
                  <div className="flex-1 pr-2">
                    <span className="inline-block rounded-md bg-cream-soft px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-brown-warm border border-cream-border mb-2">
                      {item.category}
                    </span>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-brown-deep">
                      {item.question}
                    </h2>
                  </div>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cream-border bg-cream-soft text-brown transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-brown text-white border-brown' : ''
                    }`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-cream-border/60 bg-cream-soft/20 px-5 pb-6 pt-4 sm:px-6 animate-in fade-in-50 duration-150">
                    <p className="text-sm leading-7 text-brown-deep/80">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Direct Action Hub & Concierge Connect */}
      <div className="mt-14 rounded-3xl border border-cream-border bg-cream-light p-6 sm:p-10 shadow-card-soft">
        <div className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-brown">
          <Headphones className="h-4 w-4" />
          <span>Still Have Questions?</span>
        </div>
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-brown-deep">
          Our Concierge Team is Here to Help
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brown-deep/70 max-w-2xl">
          Get personal fragrance recommendations, check custom delivery timelines, or inquire about bespoke orders directly with our specialists.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/customer-service"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brown px-5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-md"
          >
            <Headphones className="h-4 w-4" />
            <span>Customer Service Desk</span>
          </Link>
          <a
            href="https://wa.me/2349114743607?text=Hello%20Bizzare%20Fragrances%2C%20I%20have%20a%20question%20about%20an%20order%20or%20fragrance"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-600/30 bg-emerald-50 px-5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 hover:bg-emerald-100"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>Chat on WhatsApp</span>
          </a>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-cream-border bg-white px-5 text-xs font-bold uppercase tracking-[0.16em] text-brown-deep hover:border-brown"
          >
            <ShoppingBag className="h-4 w-4 text-brown" />
            <span>Explore Collection</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

