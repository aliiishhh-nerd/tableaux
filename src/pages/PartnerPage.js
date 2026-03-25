import React, { useState } from 'react';

const TIERS = [
  {
    key: 'starter',
    badge: 'Starter',
    name: 'Pantry',
    price: 99,
    desc: 'Perfect for local specialty shops and boutique producers wanting to reach food-lovers in their city.',
    features: [
      'Verified brand profile',
      'Listed in event creation suggestions',
      'Up to 3 sponsored event associations/mo',
      '1 blog feature per quarter',
      'Basic reach analytics',
    ],
  },
  {
    key: 'featured',
    badge: 'Most Popular',
    name: 'Table',
    price: 199,
    featured: true,
    desc: 'For established food & beverage brands ready to build deep community presence.',
    features: [
      'Everything in Pantry',
      'Priority placement in event creation',
      'Up to 10 sponsored event associations/mo',
      '1 blog feature per month',
      'Full analytics dashboard',
      'Co-branded event templates',
      'Instagram story asset kit',
    ],
  },
  {
    key: 'premium',
    badge: 'Premium',
    name: 'Chef\'s Table',
    price: 399,
    desc: 'For national brands and importers who want to own the category on Tableaux.',
    features: [
      'Everything in Table',
      'Unlimited event associations',
      'Exclusive category sponsorship',
      'Featured in The Table blog homepage',
      'Custom landing page on Tableaux',
      'Quarterly strategy call',
      'Early access to new features',
    ],
  },
];

const BENEFITS = [
  {
    icon: '🎯',
    title: 'Hyper-Targeted Audience',
    desc: 'Reach hosts and guests who are actively planning and attending curated dining experiences — already primed to discover and buy.',
  },
  {
    icon: '🤝',
    title: 'Community-First, Not Ads',
    desc: 'Your brand shows up as a trusted recommendation, not a banner ad. Hosts choose to associate your products with their events.',
  },
  {
    icon: '📸',
    title: 'Organic Content Creation',
    desc: 'When hosts feature your wine, olive oil, or cookware at their dinner, guests photograph it. You get authentic UGC at zero extra cost.',
  },
  {
    icon: '📝',
    title: 'Editorial in The Table',
    desc: 'Get featured in our foodie content hub — recipes, pairing guides, and host stories that your audience is already reading.',
  },
  {
    icon: '📊',
    title: 'Real Reach Data',
    desc: 'See how many events featured your brand, how many guests were reached, and what content drove the most engagement.',
  },
  {
    icon: '✨',
    title: 'Curated, Not Crowded',
    desc: 'We cap brand partners per category. If you\'re the wine importer on Tableaux, you\'re the wine importer — not one of fifty.',
  },
];

export default function PartnerPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', email: '', tier: 'Table', message: '' });
  const [sent, setSent] = useState(false);

  function handleSend(e) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setContactOpen(false); setSent(false); }, 2000);
  }

  return (
    <main className="page-content" style={{ maxWidth: 900, margin: '0 auto' }}>

      {/* Hero */}
      <div className="partner-hero">
        <div className="partner-orb" style={{ width: 300, height: 300, top: -100, right: -80 }} />
        <div className="partner-orb" style={{ width: 200, height: 200, bottom: -60, left: -40 }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.8)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
            🤝 Brand Partnerships
          </div>
          <div className="partner-hero-title">
            Put Your Brand at<br />the Dinner Table
          </div>
          <div className="partner-hero-sub">
            Tableaux connects specialty food & beverage brands with a community of passionate hosts and diners. Your products, featured where the real food conversations happen.
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-gold" onClick={() => setContactOpen(true)}>
              Get Partner Access
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,.12)', color: 'white', border: '1px solid rgba(255,255,255,.25)' }}
              onClick={() => document.getElementById('tiers')?.scrollIntoView({ behavior: 'smooth' })}>
              View Pricing ↓
            </button>
          </div>
        </div>
      </div>

      {/* Social proof bar */}
      <div style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', marginBottom: 28, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        {[
          { val: '2,400+', label: 'Active Hosts' },
          { val: '18K+', label: 'Diners' },
          { val: '$85', label: 'Avg spend/event' },
          { val: '94%', label: 'Repeat attendance' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, padding: '16px 12px', textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--indigo)', letterSpacing: -0.5 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: 'var(--ink2)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div style={{ marginBottom: 28 }}>
        <div className="sec-header">
          <div>
            <div className="sec-title" style={{ fontSize: 20 }}>Why Partner with Tableaux?</div>
            <div className="sec-sub">Built for food brands who care about community, not impressions.</div>
          </div>
        </div>
        <div className="partner-benefits">
          {BENEFITS.map((b, i) => (
            <div key={i} className="partner-benefit-card">
              <div className="partner-benefit-icon">{b.icon}</div>
              <div className="partner-benefit-title">{b.title}</div>
              <div className="partner-benefit-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers */}
      <div id="tiers" style={{ marginBottom: 28 }}>
        <div className="sec-header">
          <div>
            <div className="sec-title" style={{ fontSize: 20 }}>Partner Tiers</div>
            <div className="sec-sub">Monthly plans. Cancel anytime. Category exclusivity available.</div>
          </div>
        </div>
        <div className="partner-tiers">
          {TIERS.map(tier => (
            <div key={tier.key} className={`partner-tier-card ${tier.featured ? 'featured' : ''}`}>
              {tier.featured && (
                <div style={{ background: 'var(--indigo)', color: 'white', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px', borderRadius: 20, textAlign: 'center', marginBottom: 12 }}>
                  ⭐ Most Popular
                </div>
              )}
              <div className={`partner-tier-badge ${tier.key === 'premium' ? 'gold-badge' : ''}`}>{tier.badge}</div>
              <div className="partner-tier-name">{tier.name}</div>
              <div className="partner-tier-price">${tier.price}<span>/mo</span></div>
              <div className="partner-tier-desc">{tier.desc}</div>
              <ul className="partner-tier-features">
                {tier.features.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
              <button
                className={`btn btn-full ${tier.featured ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => { setForm(f => ({ ...f, tier: tier.name })); setContactOpen(true); }}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Brand categories */}
      <div style={{ background: 'white', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)', padding: 20, marginBottom: 28, boxShadow: 'var(--shadow)' }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Who Partners with Tableaux?</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {['🍷 Wine Importers', '🫒 Olive Oil & Pantry', '🧀 Artisan Cheese', '🥩 Specialty Butchers', '🍳 Cookware Brands', '🌿 Herb & Spice', '🍫 Chocolate & Confectionery', '🫙 Preserves & Condiments', '🥂 Craft Spirits', '🍵 Tea & Coffee', '🧑‍🍳 Culinary Schools', '📚 Food Publications'].map((c, i) => (
            <span key={i} className="chip chip-gray" style={{ fontSize: 12, padding: '5px 12px' }}>{c}</span>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="partner-contact">
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--indigo)', marginBottom: 8 }}>Ready to get at the table?</div>
        <div style={{ fontSize: 14, color: 'var(--ink2)', marginBottom: 18, maxWidth: 380, margin: '0 auto 18px' }}>
          Tell us about your brand and which tier interests you. We'll follow up within 24 hours.
        </div>
        <button className="btn btn-primary" onClick={() => setContactOpen(true)}>
          Apply to Partner →
        </button>
      </div>

      {/* Contact Modal */}
      {contactOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setContactOpen(false)}>
          <div className="modal modal-centered" style={{ maxWidth: 480 }}>
            <div className="modal-head">
              <h2>Partner Application</h2>
              <button className="modal-x" onClick={() => setContactOpen(false)}>✕</button>
            </div>
            {sent ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>Application received!</div>
                <div style={{ fontSize: 14, color: 'var(--ink2)', marginTop: 6 }}>We'll be in touch within 24 hours.</div>
              </div>
            ) : (
              <form onSubmit={handleSend}>
                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Smith" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company / Brand</label>
                      <input className="form-input" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Acme Wines" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@brand.com" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Interested Tier</label>
                    <select className="form-select" value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                      <option>Pantry ($99/mo)</option>
                      <option>Table ($199/mo)</option>
                      <option>Chef's Table ($399/mo)</option>
                      <option>Not sure yet</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tell us about your brand</label>
                    <textarea className="form-textarea" value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="What you make, who you sell to, what you're hoping to achieve with Tableaux..." />
                  </div>
                </div>
                <div className="modal-foot">
                  <button type="button" className="btn btn-ghost" onClick={() => setContactOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Send Application →</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
