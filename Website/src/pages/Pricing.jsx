import { Container, CTAButton, SectionHeading, Reveal } from '@/components/site/ui';
import PageHero, { LINK_MEDIA } from '@/components/site/PageHero';
import { Check } from 'lucide-react';

const FACTORS = [
  { label: 'Industry', desc: 'Different markets have different conversation complexity.' },
  { label: 'Qualification criteria', desc: 'The more detailed your definition of qualified, the more tailored the program.' },
  { label: 'Lead source', desc: 'Inbound forms, calls, ads, and outbound each flow differently.' },
  { label: 'Market', desc: 'Geography and competitive density shape the program.' },
  { label: 'Volume', desc: 'Scale affects how the program is staffed and routed.' },
  { label: 'Appointment vs. live transfer', desc: 'Booked meetings and real-time transfers are priced differently.' },
  { label: 'Program complexity', desc: 'Custom routing, scripting, and integrations adjust scope.' },
];

export default function Pricing() {
  return (
    <>
      <PageHero
        eyebrow="Performance-aligned pricing"
        title="Pay for Qualified Opportunities—not Promises"
        subtitle="No retainer. No setup fee. Your program is priced around the qualified opportunities delivered to your team."
        image={LINK_MEDIA.team}
        imageAlt="Professional engagement team handling business conversations"
        imagePosition="58% center"
      >
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e0bd55]">What your price reflects</p>
        <div className="mt-5 space-y-3">
          {['Conversation complexity', 'Qualification standard', 'Handoff method', 'Program volume'].map((label, i) => (
            <div key={label} className="flex items-center gap-3 text-sm text-white/75">
              <span className="text-xs font-bold text-[#e0bd55]">0{i + 1}</span>
              <div className="h-px flex-1 bg-white/15" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="py-16">
        <Container>
          <Reveal>
            <div className="card-surface rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px pulse-line" />
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[#d4af37] font-semibold mb-6">
                Performance-based
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-[1.05]">
                NO RETAINER.
                <br />
                NO SETUP FEE.
              </h2>
              <p className="mt-6 text-xl text-[#d4af37] font-medium">
                Pay for qualified opportunities delivered.
              </p>
              <p className="mt-4 text-[#9fb3b3] max-w-xl mx-auto">
                You only pay when we deliver a conversation that matches your definition of a qualified
                opportunity.
              </p>
              <div className="mt-8 flex justify-center">
                <CTAButton to="/get-started" size="lg">
                  Request Pricing
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="What shapes pricing" title="Every program is built around your business" />
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FACTORS.map((f, i) => (
              <Reveal key={f.label} delay={(i % 3) * 0.06}>
                <div className="card-light rounded-xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <Check className="h-5 w-5 text-[#d4af37]" />
                    <h3 className="font-semibold text-[#04181a]">{f.label}</h3>
                  </div>
                  <p className="text-sm text-[#4a5a5c] leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-[#00282d] border-t border-[#d4af37]/10">
        <Container className="max-w-3xl text-center">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Tell us about your lead flow.</h2>
            <p className="mt-4 text-[#9fb3b3]">
              We will build a program and send pricing aligned to your industry, volume, and qualification
              criteria.
            </p>
            <div className="mt-8 flex justify-center">
              <CTAButton to="/get-started">Request Pricing</CTAButton>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}