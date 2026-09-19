import { Container, CTAButton, SectionHeading, Reveal } from '@/components/site/ui';
import PageHero, { LINK_MEDIA } from '@/components/site/PageHero';
import { Image } from '@/components/ui/image';
import { ArrowRight, Zap, Users, GitBranch } from 'lucide-react';

const ABOUT_IMG = '/media/link-business-bridge.jpg';

const PILLARS = [
  { icon: Zap, title: 'Marketing creates demand', desc: 'Ads, content, and campaigns fill the top of the funnel with inquiries.' },
  { icon: GitBranch, title: 'Link works the opportunity', desc: 'We respond, qualify, follow up, and route the right conversations to your team.' },
  { icon: Users, title: 'Sales closes the deal', desc: 'Your team spends time talking to qualified prospects — not chasing forms.' },
];

const VALUES = [
  { title: 'Conversations over contacts', desc: 'A name on a list is not an opportunity. A real conversation is.' },
  { title: 'Speed is a strategy', desc: 'The first business to respond usually wins. We make sure it is you.' },
  { title: 'Measured by your definition', desc: 'Qualified means what you say it means — not a generic score.' },
  { title: 'Follow-up is a system', desc: 'No lead is contacted once and forgotten. Follow-up is engineered, not hoped for.' },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Link"
        title="We Close the Gap Between Marketing and Sales"
        subtitle="Marketing creates demand. Link works the opportunity. Your sales team takes the qualified conversation forward."
        image={LINK_MEDIA.bridge}
        imageAlt="A modern illuminated bridge symbolizing the connection between marketing and sales"
      >
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e0bd55]">Our role in the revenue journey</p>
        <div className="mt-5 flex items-center gap-3">
          {['Demand', 'Engagement', 'Sales'].map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div>
                <span className="block text-lg font-serif text-white">0{i + 1}</span>
                <span className="text-[9px] uppercase tracking-[.1em] text-white/55">{label}</span>
              </div>
              {i < 2 && <span className="h-px flex-1 bg-[#d4af37]/50" />}
            </div>
          ))}
        </div>
      </PageHero>

      <section className="py-16">
        <Container>
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <Reveal>
              <div className="relative rounded-2xl overflow-hidden border border-[#00282d]/10 shadow-xl aspect-[4/3] bg-white">
                <Image
                  src={ABOUT_IMG}
                  alt="A sleek dark glass bridge structure connecting two points at dusk"
                  fittingType="fill"
                  className="h-full w-full"
                />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="space-y-6">
                <p className="text-lg text-[#3a4a4c] leading-relaxed">
                  Most businesses do not have a lead problem. They have a lead response problem. Inquiries
                  come in, but nobody answers fast, nobody qualifies them, and nobody follows up
                  consistently.
                </p>
                <p className="text-lg text-[#3a4a4c] leading-relaxed">
                  Link Marketing Services was built to fix that. We sit between your marketing and your
                  sales team — responding to every inquiry, qualifying the opportunity, and delivering real
                  conversations to the people who close them.
                </p>
                <p className="text-lg text-[#3a4a4c] leading-relaxed">
                  The result: your sales team spends more time talking to qualified prospects and less time
                  chasing forms, missed calls, and unanswered inquiries.
                </p>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="py-20 border-t border-[#d4af37]/10 bg-[#00282d]">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="The Flow" onDark title="How the three pieces fit together" />
          </Reveal>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 0.08}>
                  <div className="card-surface rounded-xl p-8 h-full relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 mb-5">
                      <Icon className="h-6 w-6 text-[#d4af37]" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
                    <p className="text-sm text-[#9fb3b3] leading-relaxed">{p.desc}</p>
                    {i < PILLARS.length - 1 && (
                      <ArrowRight className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-[#d4af37]/50" />
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-20 border-t border-[#00282d]/8">
        <Container>
          <Reveal>
            <SectionHeading eyebrow="What drives us" title="Principles we build every program around" />
          </Reveal>
          <div className="mt-12 grid sm:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={(i % 2) * 0.08}>
                <div className="card-light rounded-xl p-8 h-full">
                  <h3 className="text-lg font-semibold text-[#04181a] mb-2">{v.title}</h3>
                  <p className="text-[#4a5a5c] leading-relaxed">{v.desc}</p>
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
                Ready to stop chasing and start talking?
              </h2>
              <div className="mt-8 flex justify-center">
                <CTAButton to="/get-started" size="lg">
                  Build My Lead Program
                </CTAButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}