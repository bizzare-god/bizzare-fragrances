'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, Headphones, Mail, MessageSquare, Send, Sparkles, Truck } from 'lucide-react';

export default function CustomerServicePage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Bespoke Olfactory Consultation');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/customer-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to submit inquiry');

      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-12 px-4 sm:px-6 lg:py-16 text-brown-deep">
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-brown-warm font-mono font-bold">Concierge Service</p>
        <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-bold">Bespoke guidance for orders and fragrance choices.</h1>
        <p className="mt-5 text-base leading-8 text-brown-deep/70">
          Connect directly with our concierge team for olfactory consultations, bespoke curation, checkout assistance, and direct delivery updates.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { icon: Mail, title: 'Email Concierge', text: 'concierge@bizzarefragrances.shop' },
          { icon: MessageSquare, title: 'WhatsApp Direct', text: '+234 809 777 8899' },
          { icon: Truck, title: 'Order Tracking', text: 'Live fulfillment in account' },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.title} className="rounded-2xl border border-cream-border bg-white p-6 shadow-sm">
              <Icon className="h-6 w-6 text-brown" />
              <h2 className="mt-4 font-serif text-xl font-bold text-brown-deep">{item.title}</h2>
              <p className="mt-2 text-sm leading-7 text-brown-deep/70">{item.text}</p>
            </div>
          );
        })}
      </div>

      {/* Interactive Concierge Inquiry Form */}
      <div className="mt-12 rounded-3xl border border-cream-border bg-white p-6 sm:p-10 shadow-card-soft">
        <div className="flex items-center gap-2 text-brown font-mono text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>Direct Concierge Desk</span>
        </div>
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-brown-deep">
          Request a Consultation or Order Inquiries
        </h2>
        <p className="mt-2 text-sm text-brown-deep/70 max-w-2xl">
          Submit your notes or inquiry below. Our fragrance specialists review and reply directly to your email inbox.
        </p>

        {submitted ? (
          <div className="mt-8 rounded-2xl border border-green-200 bg-green-50/60 p-8 text-center animate-in fade-in zoom-in-95">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 font-serif text-2xl font-bold text-green-900">Inquiry Dispatched</h3>
            <p className="mt-2 text-sm text-green-800 max-w-md mx-auto">
              Thank you, <strong>{name}</strong>. Your message has been forwarded to <strong>concierge@bizzarefragrances.shop</strong>. A concierge specialist will contact you shortly.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setMessage('');
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brown px-6 py-3 text-xs font-bold uppercase tracking-wider text-white hover:bg-brown-hover"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                  Your Full Name *
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Adebayo Adeleke"
                  className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft px-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft px-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                  Phone Number <span className="font-normal text-brown-deep/50">(optional)</span>
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234..."
                  className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft px-3.5 font-mono text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                />
              </div>

              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                  Inquiry Topic *
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-cream-border bg-cream-soft px-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
                >
                  <option value="Bespoke Olfactory Consultation">Bespoke Olfactory Consultation</option>
                  <option value="Order Tracking & Delivery">Order Tracking & Delivery</option>
                  <option value="Bottle Customization & Corporate Gifting">Bottle Customization & Corporate Gifting</option>
                  <option value="Product Availability & Pre-Orders">Product Availability & Pre-Orders</option>
                  <option value="General Concierge Assistance">General Concierge Assistance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs font-bold uppercase tracking-wider text-brown-deep">
                Your Message / Olfactory Preferences *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                placeholder="Describe your favorite notes (woody, amber, floral, gourmand), occasion, or order reference..."
                className="mt-1.5 w-full rounded-xl border border-cream-border bg-cream-soft p-3.5 text-sm font-medium text-brown-deep focus:border-brown focus:bg-white focus:outline-none focus:ring-1 focus:ring-brown"
              />
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-800">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brown px-8 text-xs font-bold uppercase tracking-[0.16em] text-white shadow-md transition-all hover:bg-brown-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <span>Dispatch to Concierge Desk</span>
                  <Send className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-cream-border bg-cream-light p-6">
        <Headphones className="mt-1 h-5 w-5 shrink-0 text-brown" />
        <p className="text-sm leading-7 text-brown-deep/70">
          For olfactory matching, describe your signature notes, occasion, and whether you seek a daytime sillage, evening extrait, or bespoke gift.
        </p>
      </div>
    </div>
  );
}
