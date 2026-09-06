import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl py-16 text-brown-deep">
      <p className="text-[11px] uppercase tracking-[0.28em] text-brown-warm font-mono font-bold">About The House</p>
      <h1 className="mt-3 font-serif text-5xl font-bold">A quieter way to experience luxury perfume.</h1>
      <div className="mt-8 space-y-5 text-base leading-8 text-brown-deep/72">
        <p>
          Bizzare Fragrances (by Bizzare) is an artisanal luxury perfumery built around a curated collection of memorable, concentrated scents: raw oud, velvet rose, smoked amber, radiant citrus, rich bourbon vanilla, sacred woods, and clean skin musks.
        </p>
        <p>
          We believe in direct simplicity for our clients: an unhurried browsing experience, complete transparency of olfactory notes, secure Paystack checkout, and boutique-direct fulfillment with real-time tracking.
        </p>
      </div>
      <Link href="/shop" className="mt-8 inline-flex h-12 items-center rounded-xl bg-brown px-6 text-sm font-bold uppercase tracking-[0.16em] text-white hover:bg-brown-hover shadow-md">
        Explore Collection
      </Link>
    </div>
  );
}
