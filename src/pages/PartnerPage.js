import React, { useState } from 'react';

const TIERS = [
  {
    badge: 'STARTER',
    badgeClass: '',
    name: 'Pantry',
    price: 299,
    desc: 'Perfect for local food brands and small businesses looking to reach engaged diners.',
    features: [
      'Listed in partner directory',
      'Brand mention in 5 events/mo',
      'Monthly reach report',
      'Host gift inclusion (1 product)',
      'Email support',
    ],
    cta: 'Get started',
    featured: false,
  },
  {
    badge: 'MOST POPULAR',
    badgeClass: '',
    name: 'Table',
    price: 799,
    desc: 'For growing brands ready to build meaningful presence in the dining community.',
    features: [
      'Everything in Pantry',
      'Branded event sponsorship (2/mo)',
      'Co-branded host kits',
      'Guest sampling opportunities',
      'Dedicated account manager',
      'Bi-weekly performance calls',
    ],
    cta: 'Get started',
    featured: true,
  },
  {
    badge: 'PREMIUM',
    badgeClass: 'gold-badge',
    name: "Chef's Table",
    price: 1999,
    desc: 'Full-service partnership for established brands seeking deep community integration.',
    features: [
      'Everything in Table',
      'Exclusive event category ownership',
      'Custom branded event series',
      'First-party guest data insights',
      'Product launch activations',
      'Priority placement in Discover',
      'Quarterly strategy sessions',
    ],
    cta: 'Contact us',
    featured: false,
  },
];

const BENEFITS = [
  {
    icon: '🎯',
    title: 'Hyper-targeted reach',
    desc: 'Connect with food-passionate consumers in intimate, high-trust settings — not banner ads.',
  },
  {
    icon: '🤝',
    title: 'Authentic integration',
    desc: 'Your brand appears naturally in the context of real meals, real conversations, real moments.',
  },
  {
    icon: '📊',
    title: 'Measurable impact',
    desc: 'Track event mentions, guest impressions, and product interactions with clear reporting.',
  },
];

export default function PartnerPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', tier: 'Table', message: '' });

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="page-content">
      {/* Hero */}
      <div className="partner-hero" style={{ marginBottom: 28 }}>
        <div className="partner-orb" style={{ width: 400, height: 400, top: -100, right: -100 }} />
        <div className="partner-orb" style={{ width: 300, height: 300, bottom: -80, left: -60 }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,.12)', color: 'rgba(255,255,255,.9)', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid rgba(255,255,255,.2)' }}>
            🤝 Partner Program
          </div>
          <h1 className="partner-hero-title">Reach diners who actually care about food</h1>
          <p className="partner-hero-sub">
            TableFolk connects brands with Chicago's most engaged culinary community — at the table, not on a screen.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={() => setContactOpen(true)}>
              Get in touch →
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,.12)', color: 'white', border: '1px solid rgba(255,255,255,.25)' }}
              onClick={() => document.getElementById('partner-tiers')?.scrollIntoView({ behavior: 'smooth' })}>
              View pricing
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="partner-benefits" style={{ marginBottom: 28 }}>
        {BENEFITS.map((b, i) => (
          <div key={i} className="partner-benefit-card">
            <div className="partner-benefit-icon">{b.icon}</div>
            <div className="partner-benefit-title">{b.title}</div>
            <div className="partner-benefit-desc">{b.desc}</div>
          </div>
        ))}
      </div>

      {/* Tiers */}
      <div id="partner-tiers">
        <div className="sec-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="sec-title">Partnership Tiers</div>
            <div className="sec-sub">Monthly pricing — cancel anytime</div>
          </div>
        </div>
        <div className="partner-tiers" style={{ marginBottom: 28 }}>
          {TIERS.map((tier, i) => (
            <div key={i} className={`partner-tier-card ${tier.featured ? 'featured' : ''}`}>
              {tier.featured && (
                <div style={{ background: 'var(--indigo)', color: 'white', fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '4px', margin: '-20px -20px 16px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  ✦ Most Popular
                </div>
              )}
              <div className={`partner-tier-badge ${tier.badgeClass}`}>{tier.badge}</div>
              <div className="partner-tier-name">{tier.name}</div>
              <div className="partner-tier-price">${tier.price}<span>/mo</span></div>
              <div className="partner-tier-desc">{tier.desc}</div>
              <ul className="partner-tier-features">
                {tier.features.map((f, j) => <li key={j}>{f}</li>)}
              </ul>
              <button
                className={`btn btn-full ${tier.featured ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setForm(x => ({ ...x, tier: tier.name })); setContactOpen(true); }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact form */}
      <div className="partner-contact" id="partner-contact">
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', marginBottom: 6 }}>Ready to get started?</div>
        <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 20 }}>Tell us about your brand and we'll find the right fit.</div>
        <button className="btn btn-primary" onClick={() => setContactOpen(true)}>Contact the partnerships team →</button>
      </div>

      {/* Contact Modal */}
      {contactOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setContactOpen(false)}>
          <div className="modal" style={{ maxWidth: 520 }}>
            <div className="modal-head">
              <h2>🤝 Partner Inquiry</h2>
              <button className="modal-x" onClick={() => setContactOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '28px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 14 }}>🎉</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginBottom: 8 }}>Thanks! We'll be in touch.</div>
                  <div style={{ fontSize: 14, color: 'var(--ink2)' }}>Our partnerships team typically responds within 1 business day.</div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input className="form-input" required value={form.name} onChange={e => setForm(x => ({ ...x, name: e.target.value }))} placeholder="Alex Chen" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input className="form-input" required value={form.company} onChange={e => setForm(x => ({ ...x, company: e.target.value }))} placeholder="Acme Foods" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" required value={form.email} onChange={e => setForm(x => ({ ...x, email: e.target.value }))} placeholder="alex@acmefoods.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Interested Tier</label>
                    <select className="form-select" value={form.tier} onChange={e => setForm(x => ({ ...x, tier: e.target.value }))}>
                      <option>Pantry</option>
                      <option>Table</option>
                      <option>Chef's Table</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tell us about your brand</label>
                    <textarea className="form-textarea" rows={4} value={form.message} onChange={e => setForm(x => ({ ...x, message: e.target.value }))} placeholder="What products do you make, who's your audience, what are your goals..." />
                  </div>
                  <button className="btn btn-primary btn-full" type="submit">Send inquiry →</button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
