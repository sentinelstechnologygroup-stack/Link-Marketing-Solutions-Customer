import { Container, CTAButton, Reveal } from '@/components/site/ui';
import PageHero, { LINK_MEDIA } from '@/components/site/PageHero';

const STEPS = [
  { n: '01', title: 'Discovery', desc: 'We learn your business, market, lead sources, and current sales process.' },
  { n: '02', title: 'Qualification', desc: 'Together we define exactly what counts as a qualified opportunity.' },
  { n: '03', title: 'Program Setup', desc: 'We build the script, qualification flow, routing, and follow-up process.' },
  { n: '04', title: 'Launch', desc: 'We start handling your leads — responding, qualifying, and routing.' },
  { n: '05', title: 'Optimize', desc: 'We measure what is working and refine the process continuously.' },
  { n: '06', title: 'Scale', desc: 'We expand volume, markets, locations, or services as you grow.' },
];

export default function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How It Works"
        title="From Discovery to Scale in Six Steps"
        subtitle="A measured operating process that turns raw inquiries into qualified conversations your sales team can advance."
        image={LINK_MEDIA.bridge}
        imageAlt="Architectural bridge representing the connection between marketing and sales"
      >
        <p className="font-serif text-2xl leading-tight text-white">Marketing creates demand.</p>
        <div className="my-4 h-px bg-[#d4af37]/45" />
        <p className="font-serif text-2xl leading-tight text-[#e0bd55]">Link works the opportunity.</p>
        <div className="my-4 h-px bg-[#d4af37]/45" />
        <p className="font-serif text-2xl leading-tight text-white">Sales closes the deal.</p>
      </PageHero>

      <section className="py-24">
        <Container>
          <div className="relative">
            <div className="absolute left-[27px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#d4af37]/40 to-transparent md:-translate-x-1/2" />
            <div className="space-y-12">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={(i % 2) * 0.05}>
                  <div className={`flex items-center gap-6 md:gap-10 ${i % 2 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="hidden md:block flex-1" />
                    <div className="relative shrink-0">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white border-2 border-[#d4af37]/50 text-[#00838f] font-bold glow-cyan">
                        {s.n}
                      </div>
                    </div>
                    <div className="flex-1 card-light rounded-xl p-6 md:p-8">
                      <h3 className="text-xl font-semibold text-[#04181a] mb-2">{s.title}</h3>
                      <p className="text-[#4a5a5c] leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 bg-[#00282d] border-t border-[#d4af37]/10">
        <Container>
          <Reveal>
            <div className="card-surface rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px pulse-line" />
              <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto">
                Ready to define your qualified opportunity?
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