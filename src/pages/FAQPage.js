import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ_SECTIONS = [
  {
    section: 'Getting Started',
    emoji: '🍽️',
    items: [
      {
        q: 'What is TableFolk?',
        a: 'TableFolk is a social dining platform that connects food lovers through intimate, hosted dining experiences — supper clubs, potlucks, dinner parties, restaurant outings, tastings, and more. It\'s a place to host, discover, and attend meals with friends and community members you haven\'t met yet.',
      },
      {
        q: 'Is TableFolk free?',
        a: 'Creating an account, browsing events, and RSVPing is completely free. Hosts can optionally set a contribution or ticket price for their events, paid directly between host and guest. We plan to offer premium hosting features in the future.',
      },
      {
        q: 'What cities is TableFolk available in?',
        a: 'TableFolk works anywhere. Events are community-created, so it\'s available wherever people want to host and attend. We\'re currently most active in Chicago, with communities growing in Austin, Los Angeles, Seattle, and New York.',
      },
      {
        q: 'Do I need an account to browse events?',
        a: 'You need an account to view event details, RSVP, and connect with hosts. Public event previews are available without an account via shared links.',
      },
      {
        q: 'What are the example events I see in Explore?',
        a: 'When you first join, the Explore feed shows a few example events to give you a sense of what TableFolk dinners look like — the types of events, how menus are displayed, and what the guest experience feels like. They\'re clearly marked "Example" and are read-only. You can hide them using the "Hide examples" button, and restore them anytime with "Show example events."',
      },
    ],
  },
  {
    section: 'Hosting Events',
    emoji: '👨‍🍳',
    items: [
      {
        q: 'How do I host an event?',
        a: 'Go to My Events and tap "+ New Event." Fill in the event type, date, location, capacity, cover art, and any additional details (menu for supper clubs, dish list for potlucks). Set visibility — Public, Friends Only, or Invite Only — then publish.',
      },
      {
        q: 'What event types can I create?',
        a: 'TableFolk supports Dinner Party, Supper Club, Potluck, Restaurant, Tasting, and Other. Each type has tailored features — supper clubs get a full menu builder with course and wine pairing fields, potlucks get a dish claim list, restaurant events share the venue address upfront.',
      },
      {
        q: 'How do I approve or decline RSVPs?',
        a: 'When a guest requests to join your event, you\'ll see a badge on the bell icon. Tap it to open your notifications, then go to the event\'s Host Tools tab. New requests appear at the top — you can approve or decline each one individually.',
      },
      {
        q: 'Can I set a date poll instead of a fixed date?',
        a: 'Yes. When creating an event, enable the Crowd-check date poll and add multiple date options. Guests vote on what works for them and you confirm the final date once you\'ve collected enough responses.',
      },
      {
        q: 'How does the cover builder work?',
        a: 'You can choose between two cover paths: Color + Icon (pick a gradient color and an animated emoji), or Add Photo (choose from 12 curated food photos). A live preview updates as you make changes. The cover appears on your event card in the feed.',
      },
      {
        q: 'Can I edit an event after publishing?',
        a: 'Yes. Open the event from My Events and tap Edit. Changes to date, time, or location will trigger an optional notification to confirmed guests. You can also save changes quietly without notifying anyone.',
      },
    ],
  },
  {
    section: 'Attending Events',
    emoji: '🥂',
    items: [
      {
        q: 'How do I find events near me?',
        a: 'The Explore feed shows events in your area. Filter by city, event type, or search by title. When you find something you\'d like to attend, tap "Request to join" — the host reviews your profile and confirms your spot.',
      },
      {
        q: 'Is my home address visible to everyone?',
        a: 'No. For private venues, the full address is only revealed to confirmed guests. Pending requests and non-guests see the neighborhood only. Restaurant events share the full address upfront since it\'s a public venue.',
      },
      {
        q: 'How do I let the host know about dietary restrictions?',
        a: 'When requesting to join an event, there\'s a dietary notes field. You can also add restrictions to your profile — hosts can see these when reviewing your RSVP.',
      },
      {
        q: 'What is the Dining Passport?',
        a: 'Your Dining Passport is a collection of stamps — one for each event you\'ve attended or hosted. To earn a stamp, post a Moment after the event ends. Your first Moment unlocks the photo gallery and stamps your passport. Stamps are displayed on your profile.',
      },
      {
        q: 'What are Moments?',
        a: 'Moments are short posts you write after attending an event — your reflection, a favorite dish, a funny story. Posting a Moment earns you a Dining Passport stamp and unlocks the event\'s photo gallery. You can also add up to 5 photos with your Moment.',
      },
    ],
  },
  {
    section: 'Your Profile',
    emoji: '👤',
    items: [
      {
        q: 'How do I add a profile photo?',
        a: 'Go to your Profile and tap the camera icon on your avatar, or go to Profile → Settings → Profile Photo → Upload photo. JPEG, PNG, HEIC, and WebP files are supported up to 10MB. You can remove your photo at any time.',
      },
      {
        q: 'How do I update my email address?',
        a: 'Go to Profile → Settings → Email Address. Enter your new email and tap "Update email." A confirmation link will be sent to your new address — click it to confirm the change.',
      },
      {
        q: 'Can I sign in with Google?',
        a: 'Yes. You can sign in with Google on the login screen. You can also connect Google to an existing account from Profile → Settings → Connected Accounts.',
      },
      {
        q: 'How do I link my Instagram or other social accounts?',
        a: 'Go to Edit Profile and add your handles under Social Accounts. These display on your profile as clickable links. Note: Instagram does not support direct sign-in via OAuth — linking your handle is how other members find you there.',
      },
      {
        q: 'How do I delete my account?',
        a: 'Go to Profile → Settings → scroll to the bottom → Delete Account. You\'ll be asked to type DELETE to confirm. This permanently removes your profile, hosted events, and all associated data. This action cannot be undone.',
      },
    ],
  },
  {
    section: 'Safety & Trust',
    emoji: '🔒',
    items: [
      {
        q: 'How does TableFolk keep events safe?',
        a: 'Hosts control who attends their events through the RSVP approval system — no one joins without the host\'s explicit confirmation. Addresses are hidden until approval. We encourage hosts to review guest profiles before confirming.',
      },
      {
        q: 'What should I do if something goes wrong at an event?',
        a: 'Your safety comes first. If something happens at an event, prioritize your wellbeing and contact emergency services if needed. Then contact us at hello@tablefolk.club — we take all safety reports seriously.',
      },
      {
        q: 'Are hosts verified?',
        a: 'TableFolk does not currently verify host identities or credentials. We encourage guests to review host profiles, read past Moments and guest quotes, and use their own judgment. We are working on a verified host badge program for the future.',
      },
      {
        q: 'What is TableFolk\'s policy on food allergies?',
        a: 'Always communicate allergies directly with your host before attending. While TableFolk provides fields for dietary notes, we cannot guarantee the accuracy of menu or allergen information. If you have a severe allergy, independently verify details with the host.',
      },
      {
        q: 'What are TableFolk\'s terms and privacy policy?',
        a: 'You can read our full Terms of Service and Privacy Policy using the links below. They cover how we handle your data, what we\'re responsible for, and your rights as a user.',
      },
    ],
  },
  {
    section: 'Account & Billing',
    emoji: '💳',
    items: [
      {
        q: 'How does pricing work?',
        a: 'TableFolk is free during the beta period. When paid tiers launch: the first 200 accounts per city stay free with up to 10 event invites per month. Pay-as-you-go is $5/month for unlimited invites. Annual is $50/year. We\'ll notify you before any charges begin.',
      },
      {
        q: 'How do I contact TableFolk support?',
        a: 'Email us at hello@tablefolk.club — we read everything and respond as quickly as we can. We\'d love to hear your feedback, ideas, or questions.',
      },
    ],
  },
];

export default function FAQPage() {
  const [openKey, setOpenKey] = useState(null);
  const [activeSection, setActiveSection] = useState(null);

  const toggle = (key) => setOpenKey(openKey === key ? null : key);

  const displayed = activeSection
    ? FAQ_SECTIONS.filter(s => s.section === activeSection)
    : FAQ_SECTIONS;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>❓</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 8 }}>
          Help & FAQ
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink2)', marginBottom: 20 }}>
          Everything you need to know about TableFolk.
        </p>

        {/* Section filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <button
            onClick={() => setActiveSection(null)}
            style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
              border: `1.5px solid ${!activeSection ? 'var(--indigo)' : 'var(--border)'}`,
              background: !activeSection ? 'var(--indigo-light)' : 'var(--page)',
              color: !activeSection ? 'var(--indigo)' : 'var(--ink2)',
              fontWeight: !activeSection ? 600 : 400,
            }}
          >
            All
          </button>
          {FAQ_SECTIONS.map(s => (
            <button
              key={s.section}
              onClick={() => setActiveSection(activeSection === s.section ? null : s.section)}
              style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                border: `1.5px solid ${activeSection === s.section ? 'var(--indigo)' : 'var(--border)'}`,
                background: activeSection === s.section ? 'var(--indigo-light)' : 'var(--page)',
                color: activeSection === s.section ? 'var(--indigo)' : 'var(--ink2)',
                fontWeight: activeSection === s.section ? 600 : 400,
              }}
            >
              {s.emoji} {s.section}
            </button>
          ))}
        </div>
      </div>

      {displayed.map(section => (
        <div key={section.section} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{section.emoji}</span> {section.section}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {section.items.map((item, i) => {
              const key = section.section + i;
              const isOpen = openKey === key;
              return (
                <div
                  key={key}
                  className="card"
                  style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s', boxShadow: isOpen ? '0 2px 12px rgba(0,0,0,0.06)' : 'none' }}
                  onClick={() => toggle(key)}
                >
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{item.q}</div>
                    <div style={{ fontSize: 18, color: 'var(--ink3)', transition: 'transform 0.2s', transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)', flexShrink: 0 }}>+</div>
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
      ))}

      {/* Footer links */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24, marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, color: 'var(--ink2)' }}>
          Still have questions? <a href="mailto:hello@tablefolk.club" style={{ color: 'var(--indigo)', fontWeight: 600 }}>hello@tablefolk.club</a>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/terms" style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Terms of Service</Link>
          <Link to="/privacy" style={{ fontSize: 12, color: 'var(--ink3)', textDecoration: 'none' }}>Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
