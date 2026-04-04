import React, { useState } from 'react';

const FAQ_ITEMS = [
  {
    q: 'What is Tableaux?',
    a: 'Tableaux is a social dining platform that connects food lovers through intimate, hosted dining experiences — supper clubs, potlucks, dinner parties, brunches, restaurant outings, and more. Think of it as a place to host, discover, and RSVP to meals with friends, loved ones, and community members you haven\'t met yet.',
  },
  {
    q: 'Is Tableaux free?',
    a: 'Yes! Creating an account, browsing events, and RSVPing is completely free. Hosts can optionally set a contribution or ticket price for their events, which guests pay directly. We plan to offer premium features for power hosts in the future.',
  },
  {
    q: 'How do I host an event?',
    a: 'Tap "Host" in the navigation, then fill in the details — event type, date, location, capacity, and cover art. You can set your event as public (anyone can discover it), request-only (guests ask to join and you approve), or friends-only. Publish and share the link!',
  },
  {
    q: 'How do I find events near me?',
    a: 'The Explore feed shows events happening in your area. You can filter by city, event type, and date. When you find something you like, request a seat — the host will review your profile and accept.',
  },
  {
    q: 'What\'s a supper club?',
    a: 'A supper club is a multi-course meal hosted by a passionate home chef, usually in their home or a private venue. They\'re typically ticketed, intimate (6–12 guests), and themed around a cuisine or concept. Tableaux makes it easy to discover and host them.',
  },
  {
    q: 'Can I use Tableaux for private events?',
    a: 'Absolutely. Set your event visibility to "Friends-only" and only people you\'ve connected with on Tableaux can see it. You can also use "Request-only" to let anyone discover the event but require your approval before they join.',
  },
  {
    q: 'How does the potluck feature work?',
    a: 'When you create a Potluck event, a dish list appears where guests can claim what they\'ll bring. Everyone can see who\'s bringing what, so you end up with a balanced spread instead of five pasta salads.',
  },
  {
    q: 'Is my home address visible to everyone?',
    a: 'No. For private venues, the full address is only revealed to confirmed guests. Pending and non-guests see the neighborhood only. You control what\'s shared.',
  },
  {
    q: 'What cities is Tableaux available in?',
    a: 'Tableaux works anywhere! Events are community-created, so it\'s available wherever people want to host and attend. We have growing communities in several cities and are expanding all the time.',
  },
  {
    q: 'How do I contact the Tableaux team?',
    a: 'Email us at hello@tableaux.app — we read everything and respond quickly. We\'d love to hear your ideas, feedback, or partnership inquiries.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>❓</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 8 }}>
          Frequently Asked Questions
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink2)' }}>
          Everything you need to know about Tableaux.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className="card"
              style={{
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
                boxShadow: isOpen ? '0 2px 12px rgba(0,0,0,0.06)' : 'none',
              }}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <div
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>
                  {item.q}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: 'var(--ink3)',
                    transition: 'transform 0.2s',
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                >
                  +
                </div>
              </div>
              {isOpen && (
                <div style={{ padding: '0 20px 16px', fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
