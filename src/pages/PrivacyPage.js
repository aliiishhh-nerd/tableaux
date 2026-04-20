import React from 'react';

export default function PrivacyPage() {
  return (
    <main className="page-content" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 8 }}>Last updated: April 19, 2026</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7 }}>
          This Privacy Policy explains how TableFolk, operated by Alicia Juarez ("we," "us," or "our"), collects, uses, and protects information when you use tablefolk.club.
        </p>
        <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7, marginTop: 10 }}>
          Questions? Contact us at <a href="mailto:hello@tablefolk.club" style={{ color: 'var(--indigo)' }}>hello@tablefolk.club</a>.
        </p>
      </div>

      <Section title="1. Information We Collect">
        <SubHead>Information you provide directly</SubHead>
        <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 12 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Account information:</strong> name, email address, password (hashed, never stored in plain text)</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Profile information:</strong> handle, bio, profile photo, city, social account handles, dietary restrictions, food preferences</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Event content:</strong> event titles, descriptions, dates, locations, menus, guest lists, photos, and Moments you post</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>RSVP and dietary information:</strong> dietary notes you submit when requesting to join events</li>
        </ul>
        <SubHead>Information collected automatically</SubHead>
        <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 12 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Usage data:</strong> pages visited, features used, events viewed, actions taken in the app</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Device information:</strong> browser type, operating system, screen size</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Approximate location:</strong> city-level location used to show relevant events (derived from your profile city, not GPS tracking)</li>
        </ul>
        <SubHead>Information from third-party sign-in</SubHead>
        <P>If you sign in with Google, we receive your name and email address from Google. We do not receive your Google password or contacts. Facebook and other OAuth providers may be added in future and will be disclosed here when live.</P>
      </Section>

      <Section title="2. How We Use Your Information">
        <P>We use the information we collect to:</P>
        <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 12 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Create and manage your account</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Display your profile and events to other users</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Show you relevant events based on your city and preferences</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Facilitate connections between hosts and guests</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Send transactional emails (account confirmation, RSVP updates, event reminders)</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Improve the platform through analytics</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Respond to support inquiries</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Comply with legal obligations</li>
        </ul>
        <P>We do not sell your personal information. We do not use your data for advertising.</P>
      </Section>

      <Section title="3. What Other Users Can See">
        <P>TableFolk is a social platform. The following information is visible to other logged-in users:</P>
        <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 12 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Your display name, handle, and profile photo</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Your bio, food preferences, and dietary restrictions (as listed on your profile)</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Events you host (subject to their visibility settings)</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Moments and photos you post on events you attend</li>
        </ul>
        <P>The following information is <strong>never visible to other users:</strong></P>
        <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 12 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Your email address</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Your password</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Full event addresses (hidden until RSVP is confirmed by the host)</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Dietary notes submitted with RSVPs (visible to event hosts only)</li>
        </ul>
      </Section>

      <Section title="4. Data Storage and Security">
        <P>Your data is stored using Supabase, a secure cloud database platform. Authentication is handled by Supabase Auth, which stores passwords as bcrypt hashes — your password is never stored in plain text.</P>
        <P>We implement reasonable technical and organizational measures to protect your information. However, no system is completely secure, and we cannot guarantee absolute security.</P>
        <P>Some data (event state, preferences) may also be stored in your browser's local storage to improve performance. This data stays on your device and is not transmitted to third parties.</P>
      </Section>

      <Section title="5. Analytics">
        <P>We use PostHog to collect anonymized usage analytics. This helps us understand how the platform is used and where to improve it. PostHog collects page views, feature interactions, and conversion events. It does not collect personally identifiable information without your consent.</P>
        <P>You can opt out of analytics tracking by using a browser extension that blocks tracking scripts.</P>
      </Section>

      <Section title="6. Third-Party Services">
        <P>We use the following third-party services to operate TableFolk:</P>
        <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 12 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Supabase</strong> — database, authentication, and file storage</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Netlify</strong> — hosting and deployment</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>PostHog</strong> — usage analytics</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Google</strong> — optional sign-in via Google OAuth</li>
        </ul>
        <P>Each of these services has its own privacy policy governing their data practices.</P>
      </Section>

      <Section title="7. Illinois Residents — BIPA Notice">
        <P>TableFolk does not collect, store, or use biometric identifiers or biometric information as defined under the Illinois Biometric Information Privacy Act (BIPA). Profile photos are stored as standard image files and are not subject to facial recognition, facial geometry mapping, or any biometric analysis.</P>
      </Section>

      <Section title="8. Children's Privacy">
        <P>TableFolk is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If you believe a minor has created an account, please contact us at <a href="mailto:hello@tablefolk.club" style={{ color: 'var(--indigo)' }}>hello@tablefolk.club</a> and we will promptly delete the account.</P>
      </Section>

      <Section title="9. Your Rights and Choices">
        <P>You have the following rights regarding your personal information:</P>
        <ul style={{ paddingLeft: 20, marginTop: 6, marginBottom: 12 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Access:</strong> You can view your profile information at any time from your account settings.</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Correction:</strong> You can update your name, handle, bio, photo, and preferences from your profile settings.</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Email update:</strong> You can update your email address from Profile → Settings → Email Address.</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Deletion:</strong> You can delete your account from Profile → Settings → Delete Account. This permanently removes your profile and associated data.</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}><strong>Data export:</strong> To request a copy of your data, contact us at hello@tablefolk.club.</li>
        </ul>
      </Section>

      <Section title="10. Data Retention">
        <P>We retain your personal information for as long as your account is active. When you delete your account, we remove your profile, events you hosted, and associated content within 30 days. Some information may be retained longer where required by law or for legitimate business purposes (such as resolving disputes).</P>
      </Section>

      <Section title="11. Changes to This Policy">
        <P>We may update this Privacy Policy from time to time. When we do, we will update the date at the top of this page. Significant changes will be communicated via email or an in-app notice. Continued use of TableFolk after changes constitutes acceptance of the updated policy.</P>
      </Section>

      <Section title="12. Contact">
        <P>For privacy questions, data requests, or concerns, contact us at <a href="mailto:hello@tablefolk.club" style={{ color: 'var(--indigo)' }}>hello@tablefolk.club</a>.</P>
      </Section>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 10 }}>{title}</h2>
      {children}
    </div>
  );
}

function SubHead({ children }) {
  return <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, marginTop: 10 }}>{children}</div>;
}

function P({ children }) {
  return <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.75, marginBottom: 10 }}>{children}</p>;
}
