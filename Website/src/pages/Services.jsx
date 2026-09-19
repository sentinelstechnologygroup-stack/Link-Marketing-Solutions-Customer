import { Container, CTAButton, Reveal } from '@/components/site/ui';
import PageHero, { LINK_MEDIA } from '@/components/site/PageHero';
import { ArrowRight } from 'lucide-react';

const SERVICES = [
  { name: 'Lead Generation', desc: 'Targeted campaigns that fill your pipeline with inbound and outbound opportunities aligned to your ideal customer.' },
  { name: 'Lead Response', desc: 'Every inquiry is contacted fast — within minutes, not hours — so interest never goes cold.' },
  { name: 'Lead Qualification', desc: 'Each conversation is measured against your criteria so your team only spends time on real opportunities.' },
  { name: 'Appointment Setting', desc: 'Qualified prospects are booked directly onto your sales team calendar.' },
  { name: 'Live Call Transfers', desc: 'Hot, qualified prospects are transferred live to your team the moment they are ready to talk.' },
  { name: 'Lead Nurturing', desc: 'Not-ready-yet leads stay in a structured follow-up sequence until the timing aligns.' },
  { name: 'Database Reactivation', desc: 'Old, untouched leads are re-engaged and turned back into active opportunities.' },
  { name: 'Customer Re-Engagement', desc: 'Past customers are reactivated for repeat business, upsells, and referrals.' },
  { name: 'Lead Routing', desc: 'The right prospect is routed to the right person on your team based on your rules.' },
  { name: 'Reporting', desc: 'Clear, measurable performance so you always know what is working and what is not.' },
];

export default function Services() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Everything Between a Lead and a Closed Deal"
        subtitle="Link works the opportunity end-to-end—from the moment an inquiry arrives to the moment your sales team receives a qualified conversation."
        image={LINK_MEDIA.representative}
        imageAlt="Professional Link representative engaging a prospect"
        imagePosition="62% center"
      >
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e0bd55]">The engagement path</p>
        <div className="mt-5 grid grid-cols-4 gap-2">
          {['Respond', 'Qualify', 'Connect', 'Report'].map((label, i) => (
            <div key={label} className="text-center">
              <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/60 text-[10px] text-[#e0bd55]">{i + 1}</span>
              <p className="mt-2 text-[9px] uppercase tracking-[.08em] text-white/65">{label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="py-20">
        <Container>
          <div className="grid gap-5 md:grid-cols-2">
            {SERVICES.map((s, i) => (
              <Reveal key={s.name} delay={(i % 2) * 0.08}>
                <div className="card-light rounded-xl p-8 h-full group hover:border-[#d4af37]/40 transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[#00838f] text-sm font-mono">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <ArrowRight className="h-5 w-5 text-[#9aa8a9] group-hover:text-[#d4af37] transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#04181a] mb-3">{s.name}</h3>
                  <p className="text-[#4a5a5c] leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 bg-[#00282d] border-t border-[#d4af37]/10">
        <Container>
          <Reveal>
            <div className="card-surface rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px pulse-line" />
              <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto">
                Want a program built around your lead flow?
              </h2>
              <div className="mt-8 flex justify-center">
                <CTAButton to="/get-started">Build My Lead Program</CTAButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}