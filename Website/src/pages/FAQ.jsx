import { useState } from 'react';
import { Container, CTAButton, Reveal } from '@/components/site/ui';
import PageHero, { LINK_MEDIA } from '@/components/site/PageHero';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FAQS } from '@/content/faqs';



export default function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <>
      <PageHero
        eyebrow="Frequently Asked Questions"
        title="Straight Answers About How Link Works"
        subtitle="Understand the service, qualification process, handoff options, program structure, and what your team can expect."
        image={LINK_MEDIA.representative}
        imageAlt="Link representative answering a business inquiry"
        imagePosition="65% center"
      >
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e0bd55]">The short version</p>
        <p className="mt-4 font-serif text-2xl leading-snug text-white">Your leads. Your criteria. Our trained engagement team.</p>
      </PageHero>

      <section className="py-20">
        <Container className="max-w-3xl">
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <Reveal key={i} delay={(i % 4) * 0.03}>
                <div className="card-light rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpen(open === i ? -1 : i)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="text-lg font-semibold text-[#04181a] pr-4">{f.q}</span>
                    {open === i ? (
                      <Minus className="h-5 w-5 text-[#d4af37] shrink-0" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#9aa8a9] shrink-0" />
                    )}
                  </button>
                  <div
                    className={cn(
                      'grid transition-all duration-300',
                      open === i ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 text-[#4a5a5c] leading-relaxed">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-12 text-center">
              <CTAButton to="/get-started">Build My Lead Program</CTAButton>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}