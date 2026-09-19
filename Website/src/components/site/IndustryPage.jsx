import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { Container, CTAButton, SectionHeading, Reveal } from './ui';
import PageHero, { LINK_MEDIA } from './PageHero';

export default function IndustryPage({ industry }) {
  const Icon = industry.icon;
  return (
    <>
      <PageHero
        eyebrow={industry.name}
        title={industry.headline}
        subtitle={industry.intro}
        image={LINK_MEDIA.team}
        imageAlt={`Professional Link representatives handling ${industry.name.toLowerCase()} inquiries`}
        imagePosition="56% center"
      >
        <Link to="/industries" className="inline-flex items-center gap-2 text-xs uppercase tracking-[.14em] text-white/60 hover:text-[#e0bd55]">
          <ArrowRight className="h-4 w-4 rotate-180" /> All Industries
        </Link>
        <div className="mt-6 flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/60 text-[#e0bd55]"><Icon className="h-6 w-6" /></span>
          <div>
            <p className="font-serif text-xl text-white">Built around your criteria</p>
            <p className="mt-1 text-xs text-white/55">Qualified, documented, and routed</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <CTAButton to="/get-started" size="sm">Build My Program</CTAButton>
          <CTAButton to="/how-it-works" variant="onDark" size="sm">See the Process</CTAButton>
        </div>
      </PageHero>

      <section className="py-20 border-t border-[#00282d]/8">
        <Container>
          <SectionHeading
            eyebrow="What We Handle"
            title={`Link responds, qualifies, and routes ${industry.name.toLowerCase()} inquiries`}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {industry.focusPoints.map((p, i) => (
              <Reveal key={p} delay={(i % 3) * 0.05}>
                <div className="card-light rounded-xl p-6 h-full hover:border-[#d4af37]/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#d4af37] mt-0.5 shrink-0" />
                    <span className="text-[#3a4a4c]">{p}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20 border-t border-[#d4af37]/10 bg-[#00282d]">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <Reveal>
              <SectionHeading
                eyebrow="How We Qualify"
                onDark
                title="Every conversation is measured against your definition of qualified"
                align="left"
              />
              <ul className="mt-8 space-y-3">
                {industry.qualifications.map((q) => (
                  <li key={q} className="flex items-center gap-3 text-[#cddede]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" />
                    {q}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <SectionHeading eyebrow="Outcomes" onDark title="What your sales team receives" align="left" />
              <ul className="mt-8 space-y-3">
                {industry.outcomes.map((o) => (
                  <li key={o} className="flex items-center gap-3 text-[#cddede]">
                    <ArrowRight className="h-4 w-4 text-[#d4af37]" />
                    {o}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          {industry.disclaimer && (
            <p className="mt-12 text-sm text-[#9fb3b3] border-l-2 border-[#d4af37]/40 pl-4 max-w-3xl leading-relaxed">
              {industry.disclaimer}
            </p>
          )}
        </Container>
      </section>

      <section className="py-24">
        <Container>
          <Reveal>
            <div className="card-surface rounded-2xl p-10 md:p-16 text-center relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-px pulse-line" />
              <h2 className="text-3xl md:text-4xl font-bold text-white max-w-2xl mx-auto">
                Ready to turn {industry.name.toLowerCase()} inquiries into conversations?
              </h2>
              <p className="mt-4 text-[#9fb3b3] max-w-xl mx-auto">
                Tell us about your lead flow and we will build a program around your definition of a qualified
                opportunity.
              </p>
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