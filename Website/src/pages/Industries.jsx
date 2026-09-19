import { Link } from 'react-router-dom';
import { Container, CTAButton, Reveal } from '@/components/site/ui';
import PageHero, { LINK_MEDIA } from '@/components/site/PageHero';
import { INDUSTRIES } from '@/components/site/industries';
import { ArrowRight } from 'lucide-react';

export default function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="Qualification Built Around Your Market"
        subtitle="Every industry has its own language, urgency, buying signals, and sales process. We build the conversation around yours."
        image={LINK_MEDIA.team}
        imageAlt="A professional team handling industry-specific prospect conversations"
        imagePosition="54% center"
      >
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e0bd55]">One operating standard</p>
        <div className="mt-4 grid grid-cols-2 gap-px bg-white/15">
          {['Your script', 'Your criteria', 'Your routing', 'Clear outcomes'].map(label => (
            <div key={label} className="bg-[#071b1e]/80 px-3 py-4 text-center text-[10px] uppercase tracking-[.1em] text-white/70">{label}</div>
          ))}
        </div>
      </PageHero>

      <section className="py-20">
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((ind, i) => {
              const Icon = ind.icon;
              return (
                <Reveal key={ind.slug} delay={(i % 3) * 0.06}>
                  <Link to={`/industries/${ind.slug}`} className="group block h-full">
                    <div className="relative overflow-hidden rounded-xl card-surface h-80 p-8 flex flex-col justify-between hover:border-[#d4af37]/40 transition-all">
                      <div
                        className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${ind.gradient} blur-2xl opacity-60 group-hover:opacity-90 transition-opacity`}
                      />
                      <div className="relative">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d4af37]/10 border border-[#d4af37]/25 mb-5">
                          <Icon className="h-6 w-6 text-[#d4af37]" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">{ind.name}</h3>
                        <p className="mt-2 text-sm text-[#9fb3b3] leading-relaxed">{ind.tagline}</p>
                      </div>
                      <div className="relative flex items-center gap-2 text-sm font-medium text-[#d4af37]">
                        Explore
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-24 bg-[#00282d] border-t border-[#d4af37]/10">
        <Container>
          <Reveal>
            <div className="card-surface rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px pulse-line" />
              <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto">
                Do not see your industry?
              </h2>
              <p className="mt-4 text-[#9fb3b3] max-w-xl mx-auto">
                We build custom programs for businesses with unique lead flows and qualification needs.
              </p>
              <div className="mt-8 flex justify-center">
                <CTAButton to="/get-started">Request a Custom Program</CTAButton>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}