import React from 'react';

export default function TermsPage() {
  return (
    <main className="page-content" style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, color: 'var(--ink3)', marginBottom: 8 }}>Last updated: April 19, 2026</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7 }}>
          These Terms of Service govern your use of TableFolk, operated by Alicia Juarez ("we," "us," or "our"), accessible at tablefolk.club. By creating an account or using the platform, you agree to these terms.
        </p>
        <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7, marginTop: 10 }}>
          Questions? Contact us at <a href="mailto:hello@tablefolk.club" style={{ color: 'var(--indigo)' }}>hello@tablefolk.club</a>.
        </p>
      </div>

      <Section title="1. What TableFolk Is">
        <P>TableFolk is a social dining platform that connects people through intimate food experiences — dinner parties, supper clubs, potlucks, restaurant outings, and tastings. We provide tools for hosts to create and manage events, and for guests to discover and attend them.</P>
        <P>TableFolk is a platform, not a party to any event. We do not organize, host, or attend events. We do not employ hosts or guests. All events are independently organized by their hosts.</P>
      </Section>

      <Section title="2. Eligibility">
        <P>You must be at least 18 years old to create an account or attend events on TableFolk. By using the platform, you represent that you meet this requirement.</P>
        <P>If you are creating an account on behalf of an organization, you represent that you have authority to bind that organization to these terms.</P>
      </Section>

      <Section title="3. Your Account">
        <P>You are responsible for maintaining the security of your account credentials. Do not share your password. You are responsible for all activity that occurs under your account.</P>
        <P>You agree to provide accurate information when creating your account and to keep it up to date. You may not impersonate another person or create a misleading profile.</P>
        <P>We reserve the right to suspend or terminate accounts that violate these terms, engage in harmful behavior, or are inactive for extended periods.</P>
      </Section>

      <Section title="4. Events and In-Person Meetups">
        <P><strong>TableFolk is not responsible for what happens at events.</strong> All in-person gatherings are organized independently by hosts. By attending an event you agree that:</P>
        <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 8 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>You attend at your own risk.</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>TableFolk is not a party to any agreement between hosts and guests.</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>TableFolk does not screen, verify, or background-check hosts or guests.</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>TableFolk does not guarantee the accuracy of event listings, menus, locations, or host descriptions.</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>You are responsible for exercising your own judgment about attending any event.</li>
        </ul>
        <P>Hosts agree that they are solely responsible for planning, organizing, and conducting their events in a safe and lawful manner, including compliance with applicable food safety laws, permitting requirements, and local regulations.</P>
      </Section>

      <Section title="5. Food Allergies and Dietary Requirements">
        <P>TableFolk provides fields for guests to communicate dietary restrictions and for hosts to describe menu items. However, <strong>TableFolk cannot guarantee the accuracy of any dietary or allergen information provided by hosts.</strong></P>
        <P>If you have a severe food allergy or dietary requirement, you must independently verify menu details with your host before attending. TableFolk is not responsible for any adverse reactions or health outcomes arising from food consumed at events.</P>
      </Section>

      <Section title="6. User Content">
        <P>You retain ownership of content you post on TableFolk — including event descriptions, photos, Moments, and profile information. By posting content, you grant TableFolk a non-exclusive, royalty-free, worldwide license to display and distribute that content on the platform.</P>
        <P>You are solely responsible for your content. You agree not to post content that is unlawful, harmful, harassing, defamatory, obscene, or that violates the rights of others.</P>
        <P>We reserve the right to remove content that violates these terms or that we determine, at our sole discretion, is harmful to the community.</P>
      </Section>

      <Section title="7. Prohibited Conduct">
        <P>You agree not to use TableFolk to:</P>
        <ul style={{ paddingLeft: 20, marginTop: 8, marginBottom: 8 }}>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Harass, threaten, or harm other users</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Post false or misleading information about events</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Collect personal information from other users without their consent</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Use the platform for commercial solicitation unrelated to dining events</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Attempt to gain unauthorized access to accounts or systems</li>
          <li style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.8 }}>Violate any applicable law or regulation</li>
        </ul>
      </Section>

      <Section title="8. Payments">
        <P>Some events on TableFolk may involve payment between hosts and guests. TableFolk does not currently process payments and is not a party to any financial transactions between users.</P>
        <P>When payment processing is introduced, additional terms will apply. Any disputes about payments are between hosts and guests directly.</P>
      </Section>

      <Section title="9. Privacy">
        <P>Your use of TableFolk is also governed by our <a href="/privacy" style={{ color: 'var(--indigo)' }}>Privacy Policy</a>, which is incorporated into these terms by reference.</P>
      </Section>

      <Section title="10. Disclaimer of Warranties">
        <P>TableFolk is provided "as is" and "as available" without warranties of any kind, express or implied. We do not warrant that the platform will be uninterrupted, error-free, or free of harmful components.</P>
        <P>We make no representations about the suitability, reliability, availability, or accuracy of the content, services, or events on TableFolk.</P>
      </Section>

      <Section title="11. Limitation of Liability">
        <P><strong>To the maximum extent permitted by law, TableFolk and its operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages</strong> — including but not limited to personal injury, property damage, loss of data, or loss of revenue — arising from your use of the platform or attendance at any event.</P>
        <P>Our total liability to you for any claim arising from use of TableFolk shall not exceed the amount you have paid to us in the twelve months preceding the claim, or $100, whichever is greater.</P>
        <P>Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above may not apply to you.</P>
      </Section>

      <Section title="12. Indemnification">
        <P>You agree to indemnify and hold harmless TableFolk and its operator from any claims, losses, damages, liabilities, and expenses (including legal fees) arising from your use of the platform, your content, your events, or your violation of these terms.</P>
      </Section>

      <Section title="13. Governing Law">
        <P>These terms are governed by the laws of the State of Illinois, without regard to conflict of law principles. Any disputes shall be resolved in the state or federal courts located in Cook County, Illinois.</P>
      </Section>

      <Section title="14. Changes to These Terms">
        <P>We may update these terms from time to time. When we do, we will update the date at the top of this page. Continued use of TableFolk after changes constitutes acceptance of the updated terms.</P>
      </Section>

      <Section title="15. Contact">
        <P>For questions about these terms, contact us at <a href="mailto:hello@tablefolk.club" style={{ color: 'var(--indigo)' }}>hello@tablefolk.club</a>.</P>
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

function P({ children }) {
  return <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.75, marginBottom: 10 }}>{children}</p>;
}
