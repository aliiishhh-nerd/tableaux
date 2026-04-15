import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ_DATA = [
  {
    category: '🍽️ Dining & Events',
    questions: [
      {
        q: 'What kinds of dining events are on Tableaux?',
        a: 'Tableaux hosts Supper Clubs (curated multi-course meals), Potlucks (everyone brings a dish), Dinner Parties (private hosted meals), and Supper Club Series (recurring events from the same host). Each format has its own vibe — browse the feed to find what fits you.'
      },
      {
        q: 'How do I RSVP to an event?',
        a: "Find an event on the feed, open it, and tap \"Request to Join\" or \"RSVP.\" Some events are open to all, others are invite-only. For invite-only events, you'll receive an invitation directly from the host. Your RSVP is confirmed once the host approves it."
      },
      {
        q: 'Can I cancel my RSVP?',
        a: 'Yes — you can cancel from the event page or your My Events list. If the event has a waitlist enabled, canceling your spot may open it to the next person on the waitlist. Please cancel as early as possible out of respect for the host.'
      },
      {
        q: 'What is a waitlist?',
        a: "Hosts can enable a waitlist when their event is full. If you join the waitlist, you'll receive an email confirmation. You'll get another email if the host moves you from the waitlist into the confirmed guest list. Only the host can move guests off the waitlist — it's not automatic."
      },
      {
        q: 'How are guest counts enforced?',
        a: "Each event has a maximum capacity set by the host. Once that cap is reached, new RSVPs automatically go to the waitlist (if enabled) or the RSVP button becomes unavailable. Hosts can adjust capacity at any time up until 24 hours before the event."
      },
      {
        q: 'What does "Invite Only" mean?',
        a: "Invite Only events don't appear on the public feed. Only guests the host specifically invites will see them. You'll receive an invitation via email or in-app notification."
      },
    ]
  },
  {
    category: '🏠 Hosting',
    questions: [
      {
        q: 'How do I host my first event?',
        a: 'Tap the "+ New Event" button from the feed or your home screen. You\'ll go through three steps: (1) Event Details — set your event type, cover, date, location, capacity, dress code, menu, and playlist, (2) Invite — select friends or add guests by email with a personal message, (3) Publish — review and confirm. For Potlucks, Supper Clubs, and Tastings, additional fields appear for that format.'
      },
      {
        q: 'What is a Supper Club Series?',
        a: "A Supper Club Series lets you run recurring dinner events under the same banner (e.g., \"Terroir Vol. I, II, III...\"). Each event in the series requires individual RSVPs — guests don't auto-enroll across volumes. After each event, you can choose to re-invite select past attendees to future editions."
      },
      {
        q: 'What event types can I create?',
        a: 'Six types with tailored features: Dinner Party (hosted meal), Potluck (guests claim items to bring), Supper Club (multi-course menu with host note and wine pairings), Tasting (wine, whiskey, cognac, cocktails, and more), Restaurant (group dining out), and Other.'
      },
      {
        q: 'How does the Potluck item list work?',
        a: 'When creating a Potluck, build a list of items guests can claim — organized into Food, Drinks, and Other. Select from presets or add custom items. Guests see unclaimed items when they RSVP and can claim what they will bring.'
      },
      {
        q: 'How does the Supper Club course builder work?',
        a: 'When creating a Supper Club, build a course-by-course menu. Each course has a dish name, description, and optional wine pairing. Mark one as the signature dish and write a Host Note shown to guests above the menu.'
      },
      {
        q: 'Can I let guests vote on the date?',
        a: 'Yes — select "Let guests vote" under Date & Time when creating any event. Add two or more date and time options. Guests can vote on their preferred time after receiving their invitation.'
      },
      {
        q: 'Can I add a playlist to my event?',
        a: 'Yes — add a Spotify, Apple Music, or YouTube playlist link when creating your event. Guests will see a Listen button in the event detail view.'
      },
      {
        q: 'Can I add the event to my calendar?',
        a: 'Yes — open any event and tap "Add to Calendar" in the footer. This downloads an ICS file compatible with Apple Calendar, Google Calendar, Outlook, and any other calendar app.'
      },
      {
        q: 'How does the dress code work?',
        a: "When you set a dress code (e.g., Smart Casual, Black Tie Optional), guests are notified immediately in their RSVP confirmation email and text, and again in a reminder 24 hours before the event starts. It also appears prominently in the event detail view."
      },
      {
        q: 'Can I manage a waitlist?',
        a: 'Yes — when creating or editing your event, toggle "Enable Waitlist." You\'ll see waitlisted guests in your host dashboard. To move someone from the waitlist to confirmed, tap their name and select "Move to Confirmed." This sends them an automatic notification.'
      },
      {
        q: 'What happens after my event ends?',
        a: 'After your event, Tableaux opens a post-event window where guests can leave comments and upload photos to the Moments section. You choose how long this window stays open: 24, 48, or 72 hours. After 6 months, all content is archived and no longer publicly visible.'
      },
      {
        q: 'Can I re-invite guests from a past event?',
        a: 'Yes — for Supper Club Series, after each event you can selectively re-invite guests who attended previous volumes. Go to your past event, open the guest list, and tap "Invite to next event" for each person you want to include.'
      },
    ]
  },
  {
    category: '🛂 Dining Passport',
    questions: [
      {
        q: 'What is the Dining Passport?',
        a: "The Dining Passport is your personal record of every Tableaux experience you've attended. Each event you complete earns a stamp. Over time, your Passport becomes a beautiful log of your dining history and a trust signal to future hosts."
      },
      {
        q: 'How do I earn stamps?',
        a: "Stamps are awarded automatically once an event you attended is marked as ended. You don't need to do anything — your Passport updates on its own within a few hours of the event closing."
      },
      {
        q: 'Do stamps expire?',
        a: 'No. Once earned, a Passport stamp is yours permanently. Your Passport is a historical record, not a points system.'
      },
    ]
  },
  {
    category: '📝 Fork & Story (Blog)',
    questions: [
      {
        q: 'What is Fork & Story?',
        a: "Fork & Story is Tableaux's editorial space — essays, host guides, dining culture features, and community stories. It's written by the Tableaux team and occasionally by notable community hosts. Find it at the Blog link in the nav."
      },
      {
        q: 'Can I contribute to Fork & Story?',
        a: "Not yet, but it's coming. If you're an experienced host with a story to tell, reach out through the contact page. We're building a contributor program for community voices."
      },
    ]
  },
  {
    category: '⚙️ Account & Privacy',
    questions: [
      {
        q: 'Who can see my profile?',
        a: "Your profile (name, bio, Passport, and hosted events) is visible to other Tableaux members. Your contact details, address, and private events are never shared publicly. You can adjust your visibility settings in your profile."
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to your Profile → Settings → Account → Delete Account. This permanently removes your profile, hosted events, and Passport. This action cannot be undone.'
      },
      {
        q: 'Is Tableaux available outside Chicago?',
        a: "Currently Tableaux is live in Chicago. We're growing city by city — if you'd like to bring Tableaux to your city, check out the Chapter Leader interest form on our homepage."
      },
      {
        q: 'How do I get reminders about my upcoming events?',
        a: "Tableaux sends you an email and SMS confirmation the moment you RSVP, and a reminder 24 hours before your event starts. The reminder includes the address, time, dress code, and any host notes."
      },
    ]
  }
];

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', textAlign: 'left', background: 'none',
          border: 'none', cursor: 'pointer', padding: '18px 0',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', gap: 16, fontFamily: 'inherit',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>
          {question}
        </span>
        <span style={{
          fontSize: 22, color: 'var(--indigo)', flexShrink: 0, lineHeight: 1,
          transform: open ? 'rotate(45deg)' : 'none',
          transition: 'transform 0.2s ease',
          display: 'inline-block', marginTop: 1,
        }}>+</span>
      </button>
      <div style={{
        maxHeight: open ? 500 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <p style={{
          fontSize: 14, color: 'var(--ink2)', lineHeight: 1.75,
          paddingBottom: 18, margin: 0,
        }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? FAQ_DATA.map(cat => ({
        ...cat,
        questions: cat.questions.filter(
          q =>
            q.q.toLowerCase().includes(search.toLowerCase()) ||
            q.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.questions.length > 0)
    : FAQ_DATA;

  return (
    <main className="page-content" style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>

      {/* Back */}
      <Link to="/feed" style={{ fontSize: 13, color: 'var(--indigo)', textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
        ← Back to feed
      </Link>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: 'var(--ink)',
          marginBottom: 8, letterSpacing: '-0.5px', margin: '0 0 8px',
        }}>
          Help & FAQ
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink2)', lineHeight: 1.6, margin: 0 }}>
          Everything you need to know about dining, hosting, your Passport, and more.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 28 }}>
        <input
          className="form-input"
          type="search"
          placeholder="🔍  Search questions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: 16, width: '100%' }}
        />
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--ink3)' }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>No results for "{search}"</div>
          <div style={{ fontSize: 13, color: 'var(--ink2)', marginTop: 6 }}>
            Try different keywords or{' '}
            <button
              style={{ color: 'var(--indigo)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0, fontFamily: 'inherit' }}
              onClick={() => setSearch('')}
            >
              clear search
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      {filtered.map(cat => (
        <div key={cat.category} className="card" style={{ padding: '4px 24px 8px', marginBottom: 16 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--indigo)',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            paddingTop: 18, paddingBottom: 2,
          }}>
            {cat.category}
          </div>
          {cat.questions.map(item => (
            <FAQItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      ))}

      {/* Contact CTA */}
      <div className="card" style={{ padding: 24, textAlign: 'center', marginTop: 8 }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>💬</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>
          Still have questions?
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink2)', marginBottom: 16 }}>
          Reach out and we'll get back to you within one business day.
        </div>
        <a
          href="mailto:hello@tableaux.com"
          className="btn btn-primary"
          style={{ textDecoration: 'none', display: 'inline-block', fontSize: 14 }}
        >
          Contact us →
        </a>
      </div>

    </main>
  );
}
