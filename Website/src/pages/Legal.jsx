import { Container, Reveal } from '@/components/site/ui';

const DOCS = {
  privacy: {
    title: 'Privacy Policy',
    updated: 'Last updated: September 2026',
    sections: [
      {
        h: 'Who we are',
        p: 'Link Marketing Services is a trade name of Link Business Alliance LLC ("Link," "we," "us"). We provide lead response, qualification, appointment setting, and related marketing services to businesses.',
      },
      {
        h: 'Information we collect',
        p: 'We collect information you submit through our forms — including your name, company, website, email, phone, industry, market, lead volume, lead sources, and any notes you provide. When you arrive from a campaign, we may also collect first- and last-touch attribution details such as UTM parameters, referring page, landing page, and advertising click identifiers.',
      },
      {
        h: 'How we use your information',
        p: 'We use your information to respond to your inquiry, evaluate a potential engagement, communicate with you about our services, attribute inquiries to campaigns, measure advertising performance, prevent abuse, and improve our website. We do not sell your personal information.',
      },
      {
        h: 'Cookies and measurement',
        p: 'Optional analytics and advertising technologies are disabled until you accept them through the privacy choices banner. If accepted, measurement providers may receive page, campaign, device, and conversion-event information under their own privacy terms. You may change your choice at any time using the Privacy choices link in the footer.',
      },
      {
        h: 'Retention and security',
        p: 'We retain inquiry and campaign information only as long as reasonably necessary for the purposes described above, contractual requirements, security, and applicable law. We use reasonable administrative and technical safeguards, but no internet transmission or storage system can be guaranteed completely secure.',
      },
      {
        h: 'Sharing',
        p: 'We may share your information with service providers who help us operate our business under contract and confidentiality. We may disclose information when required by law.',
      },
      {
        h: 'Your rights',
        p: 'You may request access to, correction of, or deletion of your personal information by contacting us.',
      },
      {
        h: 'Contact',
        p: 'For privacy questions, contact privacy@linkmarketingservices.com.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    updated: 'Last updated: September 2026',
    sections: [
      {
        h: 'Our services',
        p: 'Link Marketing Services provides lead response, qualification, appointment setting, live transfers, nurturing, reactivation, and reporting services. Specific deliverables are defined in a separate agreement with each client.',
      },
      {
        h: 'No guarantee of sales',
        p: 'We deliver qualified opportunities based on agreed criteria. We do not guarantee closed sales, revenue, or specific conversion outcomes. Closing remains the responsibility of the client sales team.',
      },
      {
        h: 'Acceptable use',
        p: 'You agree to use this website lawfully and not to misuse, disrupt, or attempt to gain unauthorized access to any part of it.',
      },
      {
        h: 'Intellectual property',
        p: 'All content on this website is the property of Link Business Alliance LLC and may not be reproduced without permission.',
      },
      {
        h: 'Limitation of liability',
        p: 'To the fullest extent permitted by law, Link is not liable for indirect, incidental, or consequential damages arising from use of this website or our services.',
      },
      {
        h: 'Entity',
        p: 'These terms are governed by Link Business Alliance LLC d/b/a Link Marketing Services.',
      },
    ],
  },
  communications: {
    title: 'Communications Policy',
    updated: 'Last updated: September 2026',
    sections: [
      {
        h: 'Consent to contact',
        p: 'By submitting your information through our forms, you consent to be contacted by Link Marketing Services by phone, email, and SMS regarding your inquiry and our services.',
      },
      {
        h: 'Frequency',
        p: 'We aim to communicate relevantly and respectfully. Initial outreach typically occurs within one business day of your request.',
      },
      {
        h: 'Opt-out',
        p: 'You may opt out of communications at any time by replying STOP to text messages, clicking unsubscribe in emails, or requesting removal by phone or email.',
      },
      {
        h: 'No spam',
        p: 'We do not send unsolicited marketing to people who have not requested information about our services.',
      },
      {
        h: 'Contact',
        p: 'For communications questions, contact support@linkmarketingservices.com.',
      },
    ],
  },
  accessibility: {
    title: 'Accessibility Statement',
    updated: 'Last updated: September 2026',
    sections: [
      {
        h: 'Our commitment',
        p: 'Link Marketing Services is committed to making our website accessible to everyone, including people with disabilities. We aim to conform to WCAG 2.1 AA standards.',
      },
      {
        h: 'What we do',
        p: 'We design with sufficient color contrast, keyboard navigation, clear headings, and descriptive labels. We continue to audit and improve accessibility over time.',
      },
      {
        h: 'Feedback',
        p: 'If you experience difficulty accessing any part of our website, please contact us and we will work to provide the information you need.',
      },
      {
        h: 'Contact',
        p: 'For accessibility questions, contact support@linkmarketingservices.com.',
      },
    ],
  },
};

export default function Legal({ doc }) {
  const data = DOCS[doc];
  if (!data) return null;
  return (
    <section className="pt-36 pb-24 relative">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <Container className="relative max-w-3xl">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 mb-5">
            <span className="h-px w-8 bg-[#d4af37]" />
            <span className="text-xs uppercase tracking-[0.25em] text-[#00838f] font-semibold">Legal</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#04181a]">{data.title}</h1>
          <p className="mt-3 text-sm text-[#4a5a5c]">{data.updated}</p>
          <div className="mt-10 space-y-8">
            {data.sections.map((s) => (
              <div key={s.h}>
                <h2 className="text-lg font-semibold text-[#04181a] mb-2">{s.h}</h2>
                <p className="text-[#4a5a5c] leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}