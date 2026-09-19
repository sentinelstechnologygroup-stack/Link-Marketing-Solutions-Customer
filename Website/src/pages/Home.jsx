import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CalendarCheck, Check, Database,
  MessageSquareText, PhoneForwarded, Route, ShieldCheck,
  Sparkles, Target, TimerReset, UsersRound
} from 'lucide-react';
import { Container, CTAButton, Reveal } from '@/components/site/ui';
import { INDUSTRIES } from '@/components/site/industries';

const HERO_REP = '/media/link-representative.png';
const TEAM_IMG = '/media/link-engagement-team.png';
const BRIDGE_IMG = '/media/link-business-bridge.jpg';

const services = [
  {
    icon: MessageSquareText,
    title: 'Lead Response & Qualification',
    body: 'We respond to new inquiries, engage in human conversation, and qualify each prospect against your criteria.'
  },
  {
    icon: CalendarCheck,
    title: 'Appointment Setting',
    body: 'Qualified prospects are scheduled directly on your team’s calendar with clear context for the next conversation.'
  },
  {
    icon: PhoneForwarded,
    title: 'Live Transfers',
    body: 'When a prospect is ready now, we connect them to the right person on your sales team in real time.'
  },
  {
    icon: Database,
    title: 'Database Reactivation',
    body: 'Past leads and aging opportunities receive thoughtful outreach designed to restart valuable conversations.'
  }
];

const process = [
  ['01', 'Lead received'],
  ['02', 'Rapid response'],
  ['03', 'Human conversation'],
  ['04', 'Qualification'],
  ['05', 'Appointment or live transfer'],
  ['06', 'Client sales team']
];

/** @typedef {import('react').ComponentType<import('lucide-react').LucideProps>} IconComponent */

/** @type {Array<[string, string, IconComponent]>} */
const benefits = [
  ['Faster Response', 'Prompt, professional outreach', TimerReset],
  ['Better Qualification', 'Your criteria guide the conversation', Target],
  ['Smarter Connections', 'The right prospect, routed correctly', Route],
  ['Consistent Follow-Up', 'A structured multi-channel cadence', MessageSquareText],
];

/** @type {Array<[string, string, IconComponent]>} */
const differentiators = [
  ['Human Conversations', 'Every interaction is handled by a trained representative—not an automated script alone.', UsersRound],
  ['Customized Qualification', 'Your criteria, terminology, routing rules, and expectations guide the engagement.', Target],
  ['Structured Follow-Up', 'A disciplined cadence keeps viable opportunities from disappearing after one attempt.', TimerReset],
  ['Intelligent Routing', 'Prospects reach the appropriate person, location, or team based on your workflow.', Route],
  ['Transparent Reporting', 'Clear disposition data provides visibility from first response through handoff.', ShieldCheck],
  ['Scalable Operations', 'A flexible engagement team supports changing lead volume without sacrificing quality.', Sparkles]
];

/** @param {{icon: IconComponent}} props */
function GoldIcon({ icon: Icon }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/70 text-[#e0bd55]">
      <Icon size={19} strokeWidth={1.6} />
    </span>
  );
}

/** @param {{eyebrow: string, title: string, body?: string, light?: boolean, className?: string}} props */
function SectionIntro({ eyebrow, title, body, light = false, className = '' }) {
  return (
    <div className={className}>
      <p className="editorial-kicker">{eyebrow}</p>
      <h2 className={`mt-3 max-w-3xl text-4xl leading-[1.05] sm:text-5xl ${light ? 'text-white' : 'text-[#071b1e]'}`}>
        {title}
      </h2>
      {body && (
        <p className={`mt-5 max-w-2xl text-base leading-7 ${light ? 'text-white/70' : 'text-[#405054]'}`}>
          {body}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#f4f1ea]">
      <section className="relative min-h-[720px] overflow-hidden bg-[#062d32] pt-24 text-white">
        <div className="absolute inset-0 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[62%]">
          <img
            src={HERO_REP}
            alt="Link representative speaking with a prospect"
            className="h-full w-full object-cover object-[64%_center]"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,45,50,.42)_0%,rgba(5,62,67,.74)_38%,#063b40_86%)] lg:bg-[linear-gradient(90deg,#063b40_0%,rgba(5,62,67,.97)_32%,rgba(4,45,50,.68)_57%,rgba(4,25,29,.12)_82%)]" />
        <div className="absolute inset-y-0 right-0 hidden w-[18%] border-l border-white/10 bg-[#071b1e]/45 lg:block" />
        <Container className="relative z-10 flex min-h-[620px] items-center py-16 lg:py-24">
          <div className="max-w-[680px]">
            <Reveal>
              <p className="editorial-kicker">Lead response / qualification / appointment setting / live transfer</p>
              <h1 className="mt-5 text-5xl leading-[.98] tracking-[-.03em] sm:text-6xl lg:text-[76px]">
                Stop Chasing Leads.
                <span className="mt-1 block text-[#e0bd55]">Start Talking to Qualified Prospects.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-white/80">
                We respond, qualify, set appointments, and live-transfer high-intent prospects—so your team can focus on closing.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <CTAButton to="/get-started" size="lg">Build My Lead Program <ArrowRight size={17} /></CTAButton>
                <Link to="/how-it-works" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-white/55 px-6 text-sm font-semibold text-white transition hover:border-[#d4af37] hover:text-[#e0bd55]">
                  See How It Works
                </Link>
              </div>
            </Reveal>
          </div>
          <div className="absolute bottom-20 right-5 hidden w-48 lg:block">
            <div className="premium-rule" />
            <p className="mt-5 font-serif text-lg uppercase leading-7 tracking-[.16em] text-white/80">
              Real conversations.<br />Real opportunities.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-y border-[#d4af37]/20 bg-[#071b1e] text-white">
        <Container>
          <div className="grid md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([title, text, Icon], i) => (
              <div key={title} className={`flex gap-4 py-7 lg:px-7 ${i ? 'border-t border-white/10 md:border-t-0 md:border-l' : ''}`}>
                <GoldIcon icon={Icon} />
                <div>
                  <h3 className="text-lg text-white">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-white/60">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative bg-[#00616a] py-20 text-white">
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-15 [background:repeating-linear-gradient(120deg,transparent_0_18px,#d4af37_19px_20px)]" />
        <Container className="relative">
          <Reveal>
            <SectionIntro
              eyebrow="A full-service lead engagement partner"
              title="Four Services. A Stronger Revenue Engine."
              light
            />
          </Reveal>
          <div className="mt-10 grid gap-px overflow-hidden border border-white/15 bg-white/15 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service, i) => (
              <Reveal key={service.title} delay={i * .06}>
                <article className="h-full bg-[#004c54] p-7 transition duration-300 hover:bg-[#073e44]">
                  <GoldIcon icon={service.icon} />
                  <h3 className="mt-6 text-2xl leading-tight text-white">{service.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/68">{service.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f4f1ea] py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[.8fr_2.2fr] lg:items-end">
            <SectionIntro eyebrow="A clear path from lead to opportunity" title="The Link Process" />
            <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {process.map(([number, label], i) => (
                <div key={number} className="relative pr-4">
                  {i < process.length - 1 && <div className="absolute left-10 right-0 top-4 hidden h-px bg-[#c9b984] lg:block" />}
                  <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#b68a27] text-xs font-bold text-white">{number}</span>
                  <p className="mt-4 text-[10px] font-bold uppercase leading-4 tracking-[.15em] text-[#263b3e]">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative min-h-[540px] overflow-hidden bg-[#071b1e] text-white">
        <div className="absolute inset-0 opacity-45">
          <img src={TEAM_IMG} alt="Link engagement team" className="h-full w-full object-cover" loading="lazy" decoding="async" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,23,27,.92),rgba(5,23,27,.77)_45%,rgba(5,23,27,.42))]" />
        <Container className="relative py-24">
          <div className="ml-auto max-w-3xl border-l border-[#d4af37]/55 pl-8 lg:pl-14">
            <Reveal>
              <SectionIntro
                eyebrow="People, process, accountability"
                title="Human Conversations. Structured Results."
                body="Our trained, bilingual representatives use approved scripts, intelligent routing, structured follow-up, and quality review to ensure every lead is handled with professionalism and care."
                light
              />
              <div className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {['Trained bilingual representatives', 'Client-approved scripts', 'Intelligent routing', 'Structured follow-up', 'Quality review and coaching', 'Clear lead dispositions'].map(item => (
                  <div key={item} className="flex items-center gap-3 border-b border-white/10 pb-3 text-sm text-white/80">
                    <Check size={16} className="text-[#e0bd55]" /> {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="bg-[#f4f1ea] py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <Reveal>
              <SectionIntro
                eyebrow="Where revenue quietly disappears"
                title="The Problem Between Marketing and Sales"
                body="Many businesses generate leads, but too many go unworked, are poorly qualified, or never reach the right person. Link Marketing Services closes that gap with a structured response process that turns more leads into real conversations."
              />
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-[#d8d2c6] bg-[#ebe7df] p-7">
                <p className="font-serif text-2xl text-[#182d30]">Unworked Leads</p>
                <ul className="mt-5 space-y-3 text-sm text-[#5c6768]">
                  {['Slow response times', 'Unqualified inquiries', 'Leads falling through the cracks', 'Lost opportunities'].map(x => <li key={x} className="flex gap-3"><span className="text-[#b68a27]">—</span>{x}</li>)}
                </ul>
              </div>
              <div className="bg-[#00616a] p-7 text-white shadow-[0_18px_50px_rgba(0,49,55,.18)]">
                <p className="font-serif text-2xl">The Link Advantage</p>
                <ul className="mt-5 space-y-3 text-sm text-white/78">
                  {['Prompt, professional follow-up', 'Qualified prospects', 'Structured process', 'More conversations for your team'].map(x => <li key={x} className="flex gap-3"><Check size={15} className="mt-0.5 shrink-0 text-[#e0bd55]" />{x}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="grid min-h-[330px] bg-[#071b1e] text-white md:grid-cols-3">
        {[
          [HERO_REP, '01', 'Respond', 'Prompt, professional outreach begins the engagement.'],
          [TEAM_IMG, '02', 'Qualify', 'A real conversation tests fit, intent, and timing.'],
          [BRIDGE_IMG, '03', 'Connect', 'The qualified opportunity reaches the right sales professional.']
        ].map(([src, number, title, body], i) => (
          <figure key={title} className="group relative min-h-[290px] overflow-hidden border-white/10 md:border-r">
            <img src={src} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" loading="lazy" decoding="async" />
            <div className={`absolute inset-0 ${i === 1 ? 'bg-[#003f46]/70' : 'bg-[#071b1e]/64'}`} />
            <figcaption className="absolute inset-x-0 bottom-0 border-t border-[#d4af37]/35 bg-[#071b1e]/78 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <span className="font-serif text-3xl text-[#e0bd55]">{number}</span>
                <div>
                  <p className="font-serif text-2xl">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/62">{body}</p>
                </div>
              </div>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="relative bg-[#00616a] py-20 text-white">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[.75fr_2.25fr] lg:items-end">
            <SectionIntro
              eyebrow="Industries we serve"
              title="Qualification Built Around Your Business"
              body="Every market has its own language, timing, and buying signals. We shape the conversation around yours."
              light
            />
            <div className="grid grid-cols-2 gap-px bg-white/15 sm:grid-cols-3">
              {INDUSTRIES.slice(0, 6).map((industry, i) => {
                const Icon = industry.icon || Target;
                return (
                  <Link key={industry.slug || industry.name} to={`/industries/${industry.slug}`} className="group bg-[#004c54] p-6 transition hover:bg-[#073e44]">
                    <Icon className="text-[#e0bd55]" size={23} strokeWidth={1.5} />
                    <p className="mt-7 font-serif text-xl text-white">{industry.name}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/55">{industry.shortDescription || industry.description}</p>
                    <span className="mt-5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.16em] text-[#e0bd55]">Explore <ArrowRight size={12} /></span>
                  </Link>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#f7f4ee] py-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative min-h-[390px] overflow-hidden">
              <img src={TEAM_IMG} alt="Representative following a client-approved conversation" className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071b1e]/70 to-transparent" />
              <p className="absolute bottom-6 left-7 font-serif text-2xl text-white">Your prospect. Your brand. Our team.</p>
            </div>
            <Reveal>
              <SectionIntro
                eyebrow="Built to represent your business"
                title="Your Standards Stay at the Center."
                body="We represent your business the way you want—with client-approved scripts, qualification criteria, scheduling rules, terminology, and routing logic."
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {['Client-approved scripts', 'Your qualification criteria', 'Scheduling rules', 'Industry-specific terminology', 'Custom routing logic', 'Documented dispositions'].map(item => (
                  <div key={item} className="flex items-center gap-3 border-b border-[#ddd7cb] pb-3 text-sm text-[#405054]">
                    <Check size={15} className="text-[#b68a27]" /> {item}
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#071b1e] text-white">
        <div className="absolute inset-0 opacity-35 sm:opacity-45 lg:left-auto lg:w-[42%]">
          <img src={HERO_REP} alt="" className="h-full w-full object-cover object-[65%_center]" loading="lazy" decoding="async" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#071b1e] via-[#071b1e]/95 to-[#071b1e]/40" />
        <Container className="relative py-16">
          <div className="max-w-4xl">
            <p className="editorial-kicker">Ready prospects, connected in real time</p>
            <h2 className="mt-3 text-4xl text-white sm:text-5xl">Live Transfers</h2>
            <p className="mt-4 max-w-2xl text-white/65">When a prospect is qualified and ready, we connect them to your team with context—so the handoff feels seamless for both sides.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {['Qualified prospects', 'Real-time connection', 'Client-defined routing', 'Clear disposition tracking'].map(item => (
                <div key={item} className="flex items-center gap-3 border-t border-[#d4af37]/40 pt-4 text-sm text-white/80">
                  <Check size={15} className="text-[#e0bd55]" /> {item}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="grid lg:grid-cols-2">
        <div className="bg-[#f4f1ea] px-6 py-20 sm:px-10 lg:px-[max(4rem,calc((100vw-1280px)/2))]">
          <SectionIntro
            eyebrow="Multi-channel persistence"
            title="Follow-Up & Nurturing"
            body="We keep your pipeline active with strategic, professional follow-up across the channels approved for your program."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {['Phone', 'SMS', 'Email', 'Scheduled callback'].map(x => <span key={x} className="border border-[#cfc6b4] bg-white/60 px-4 py-2 text-xs font-semibold uppercase tracking-[.12em] text-[#31474a]">{x}</span>)}
          </div>
        </div>
        <div className="bg-[#00616a] px-6 py-20 text-white sm:px-10 lg:px-16">
          <SectionIntro
            eyebrow="Reconnect. Re-engage. Create opportunity."
            title="Database Reactivation"
            body="The next valuable conversation may already be in your database. We re-engage past leads with personalized outreach to uncover renewed interest."
            light
          />
          <CTAButton to="/services" variant="outline" className="mt-8 border-white/55 text-white hover:bg-white hover:text-[#063b40]">Explore Reactivation <ArrowRight size={16} /></CTAButton>
        </div>
      </section>

      <section className="bg-[#f7f4ee] py-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[.9fr_2.1fr] lg:items-center">
            <SectionIntro
              eyebrow="Visibility from first touch to outcome"
              title="See What Happens Between Lead Creation and Client Outcome"
              body="Our reporting gives you a clear view of each stage—from initial response through final disposition."
            />
            <div className="grid grid-cols-3 gap-px border border-[#ddd7cb] bg-[#ddd7cb] md:grid-cols-6">
              {['Lead received', 'In outreach', 'In conversation', 'Qualified', 'Appointment / transfer', 'Client outcome'].map((x, i) => (
                <div key={x} className="bg-[#f0ece4] px-3 py-6 text-center">
                  <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-[#b68a27]/55 text-[10px] font-bold text-[#9a731c]">{i + 1}</span>
                  <p className="mt-3 text-[10px] font-bold uppercase leading-4 tracking-[.1em] text-[#405054]">{x}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-[#ded7cb] bg-[#f4f1ea] py-20">
        <Container>
          <SectionIntro eyebrow="A trusted extension of your team" title="Why Link Marketing Services" />
          <div className="mt-10 grid gap-px border border-[#d8d2c6] bg-[#d8d2c6] sm:grid-cols-2 lg:grid-cols-3">
            {differentiators.map(([title, body, Icon]) => (
              <article key={title} className="bg-[#f7f4ee] p-7">
                <Icon size={22} strokeWidth={1.5} className="text-[#b68a27]" />
                <h3 className="mt-5 text-xl text-[#10292c]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#596668]">{body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-[#d4af37]/30 bg-[#071b1e] py-8 text-white">
        <Container className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="font-serif text-2xl">Part of the Link Business Alliance ecosystem.</p>
            <p className="mt-1 text-sm text-white/55">Different expertise. One standard of professional service.</p>
          </div>
          <span className="editorial-kicker">More conversations. A brighter tomorrow.</span>
        </Container>
      </section>

      <section className="relative overflow-hidden bg-[#00616a] py-20 text-white">
        <div className="absolute inset-0 opacity-10 [background:repeating-linear-gradient(120deg,transparent_0_20px,#d4af37_21px_22px)]" />
        <Container className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="editorial-kicker">Let’s build a lead engagement program tailored to your business.</p>
            <h2 className="mt-3 max-w-3xl text-4xl leading-tight text-white sm:text-5xl">What Happens After Your Next Lead Comes In?</h2>
          </div>
          <CTAButton to="/get-started" size="lg" className="shrink-0">Request a Program Review <ArrowRight size={17} /></CTAButton>
        </Container>
      </section>
    </div>
  );
}
