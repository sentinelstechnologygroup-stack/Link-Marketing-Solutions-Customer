import { useRef, useState } from 'react';
import { Container, CTAButton, Reveal } from '@/components/site/ui';
import PageHero, { LINK_MEDIA } from '@/components/site/PageHero';
import { INDUSTRIES } from '@/components/site/industries';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAttribution, trackLeadConversion } from '@/lib/marketing';
import { PROGRAM_REVIEW_CONSENT_VERSION } from '@/lib/programReviewConsent';

const VOLUMES = ['Less than 50', '50–200', '200–500', '500–1,000', '1,000+'];
const SOURCES = ['Web forms', 'PPC / Ads', 'SEO', 'Social media', 'Outbound', 'Referrals', 'Other'];
const SERVICES = [
  'Lead Generation',
  'Lead Response',
  'Lead Qualification',
  'Appointment Setting',
  'Live Transfers',
  'Lead Nurturing',
  'Database Reactivation',
  'Reporting',
];

const inputCls =
  'w-full rounded-lg bg-white border border-[#00282d]/15 px-4 py-3 text-[#04181a] placeholder:text-[#9aa8a9] focus:border-[#d4af37] focus:outline-none transition-colors';

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#3a4a4c] mb-2">{label}</label>
      {children}
    </div>
  );
}

export default function GetStarted() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    industry: '',
    volume: '',
    name: '',
    company: '',
    website: '',
    email: '',
    phone: '',
    market: '',
    sources: [],
    services: [],
    notes: '',
  });
  const [done, setDone] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [submitState, setSubmitState] = useState({ pending: false, error: '' });
  const startedAt = useRef(Date.now());

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k, v) =>
    setForm((f) => {
      const arr = f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v];
      return { ...f, [k]: arr };
    });

  const canNext = step === 1 ? form.industry : step === 2 ? form.volume : form.name && form.email;

  const submit = async (e) => {
    e.preventDefault();
    if (submitState.pending) return;

    if (honeypot) {
      setDone(true);
      return;
    }

    setSubmitState({ pending: true, error: '' });
    try {
      const endpoint = import.meta.env.VITE_LEAD_FORM_ENDPOINT || '/api/lead';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...form,
          attribution: getAttribution(),
          pageUrl: window.location.href,
          formStartedAt: new Date(startedAt.current).toISOString(),
          submittedAt: new Date().toISOString(),
          consentVersion: PROGRAM_REVIEW_CONSENT_VERSION,
          consentAccepted: true,
          _company_url_check: honeypot,
        }),
      });

      if (!response.ok) throw new Error('Submission failed');
      trackLeadConversion({ form_name: 'program_review', industry: form.industry, lead_volume: form.volume });
      setDone(true);
    } catch {
      setSubmitState({
        pending: false,
        error: 'We could not send your request. Please try again or email support@linkmarketingservices.com.',
      });
    }
  };

  if (done) {
    return (
      <section className="pt-40 pb-32 relative">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <Container className="relative">
          <Reveal className="text-center max-w-2xl mx-auto">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 glow-cyan">
              <Check className="h-8 w-8 text-[#d4af37]" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#04181a]">Request received.</h1>
            <p className="mt-4 text-lg text-[#4a5a5c]">
              Our team is reviewing your {form.industry || 'business'} profile. Prepare for a conversation — we
              will be in touch within one business day.
            </p>
            <div className="mt-10">
              <CTAButton to="/" variant="ghost">
                Back to Home
              </CTAButton>
            </div>
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Program Review"
        title="Let’s Build the Right Lead Program"
        subtitle="Tell us about your market, lead flow, and definition of a qualified opportunity. We’ll use it to shape the right engagement model."
        image={LINK_MEDIA.representative}
        imageAlt="Link representative preparing a customized lead engagement program"
        imagePosition="64% center"
      >
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#e0bd55]">A focused three-step review</p>
        <div className="mt-5 space-y-3">
          {['Your market', 'Your lead volume', 'Your qualification needs'].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d4af37]/60 text-[10px] font-bold text-[#e0bd55]">{i + 1}</span>
              <span className="text-sm text-white/72">{label}</span>
            </div>
          ))}
        </div>
      </PageHero>
      <section className="relative py-20">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <Container className="relative max-w-3xl">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                n <= step ? 'bg-[#d4af37]' : 'bg-[#00282d]/10'
              )}
            />
          ))}
        </div>
        <p className="mt-3 text-sm text-[#4a5a5c]">Step {step} of 3</p>

        <form onSubmit={submit} className="mt-8" noValidate={false}>
          <div className="absolute -left-[10000px] h-px w-px overflow-hidden" aria-hidden="true">
            <label htmlFor="company-url-check">Leave this field blank</label>
            <input
              id="company-url-check"
              name="_company_url_check"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>
          {step === 1 && (
            <Reveal>
              <label className="block text-lg font-semibold text-[#04181a] mb-6">
                Which industry are we scaling?
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {INDUSTRIES.map((ind) => {
                  const Icon = ind.icon;
                  const active = form.industry === ind.name;
                  return (
                    <button
                      type="button"
                      key={ind.slug}
                      onClick={() => set('industry', ind.name)}
                      aria-pressed={active}
                      className={cn(
                        'flex items-center gap-3 rounded-xl p-4 text-left border transition-all',
                        active
                          ? 'border-[#d4af37] bg-[#d4af37]/10'
                          : 'border-[#00282d]/12 bg-white hover:border-[#00282d]/25'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', active ? 'text-[#d4af37]' : 'text-[#9aa8a9]')} />
                      <span className={cn('text-sm font-medium', active ? 'text-[#04181a]' : 'text-[#3a4a4c]')}>
                        {ind.name}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-end">
                <CTAButton type="button" onClick={() => setStep(2)} disabled={!canNext}>
                  Continue <ArrowRight className="h-4 w-4" />
                </CTAButton>
              </div>
            </Reveal>
          )}

          {step === 2 && (
            <Reveal>
              <label className="block text-lg font-semibold text-[#04181a] mb-6">
                What is your approximate monthly lead volume?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {VOLUMES.map((v) => (
                  <button
                    type="button"
                    key={v}
                    onClick={() => set('volume', v)}
                    aria-pressed={form.volume === v}
                    className={cn(
                      'rounded-xl p-4 text-sm font-medium border transition-all',
                      form.volume === v
                        ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#04181a]'
                        : 'border-[#00282d]/12 bg-white text-[#3a4a4c] hover:border-[#00282d]/25'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <CTAButton type="button" variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </CTAButton>
                <CTAButton
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canNext}
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </CTAButton>
              </div>
            </Reveal>
          )}

          {step === 3 && (
            <Reveal>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Full Name *">
                  <input name="name" autoComplete="name" required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Company">
                  <input name="company" autoComplete="organization" value={form.company} onChange={(e) => set('company', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Website">
                  <input name="website" type="url" inputMode="url" autoComplete="url" value={form.website} onChange={(e) => set('website', e.target.value)} className={inputCls} placeholder="https://" />
                </Field>
                <Field label="Email *">
                  <input name="email" type="email" inputMode="email" autoComplete="email" required value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Phone">
                  <input name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} />
                </Field>
                <Field label="Market / Location">
                  <input name="market" autoComplete="address-level2" value={form.market} onChange={(e) => set('market', e.target.value)} className={inputCls} />
                </Field>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-[#04181a] mb-3">Current lead sources</p>
                <div className="flex flex-wrap gap-2">
                  {SOURCES.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggle('sources', s)}
                      aria-pressed={form.sources.includes(s)}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm border transition-all',
                        form.sources.includes(s)
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#04181a]'
                          : 'border-[#00282d]/15 text-[#4a5a5c] hover:border-[#00282d]/30'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm font-medium text-[#04181a] mb-3">Services you need</p>
                <div className="flex flex-wrap gap-2">
                  {SERVICES.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggle('services', s)}
                      aria-pressed={form.services.includes(s)}
                      className={cn(
                        'rounded-full px-4 py-2 text-sm border transition-all',
                        form.services.includes(s)
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#04181a]'
                          : 'border-[#00282d]/15 text-[#4a5a5c] hover:border-[#00282d]/30'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <Field label="Notes">
                  <textarea name="notes" rows={4} maxLength={2000} value={form.notes} onChange={(e) => set('notes', e.target.value)} className={inputCls} />
                </Field>
              </div>

              <p className="mt-6 text-xs leading-5 text-[#647275]">
                By submitting, you agree that Link Marketing Services may contact you about this inquiry by phone, email, or SMS. Message and data rates may apply. Consent is not a condition of purchase. See our <a href="/communications-policy" className="underline">communications policy</a> and <a href="/privacy" className="underline">privacy policy</a>.
              </p>
              {submitState.error && (
                <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                  {submitState.error}
                </p>
              )}
              <div className="mt-8 flex justify-between gap-4">
                <CTAButton type="button" variant="ghost" onClick={() => setStep(2)} disabled={submitState.pending}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </CTAButton>
                <CTAButton type="submit" disabled={submitState.pending || !canNext}>
                  {submitState.pending ? 'Sending…' : 'Request Program Review'} {!submitState.pending && <ArrowRight className="h-4 w-4" />}
                </CTAButton>
              </div>
            </Reveal>
          )}
        </form>
      </Container>
    </section>
    </>
  );
}
