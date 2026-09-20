import { Link } from 'react-router-dom';
import { Container } from './ui';
import BrandLogo from './BrandLogo';

const CUSTOMER_PORTAL_SIGN_IN =
  import.meta.env.VITE_CUSTOMER_PORTAL_SIGN_IN_URL ||
  'https://customer.linkmarketingservices.co/login';

const AGENT_PORTAL_SIGN_IN =
  import.meta.env.VITE_AGENT_PORTAL_SIGN_IN_URL ||
  'https://agent.linkmarketingservices.co/login';

const COLS = [
  {
    title: 'Solutions',
    links: [
      { label: 'Lead Response', to: '/services' },
      { label: 'Lead Qualification', to: '/services' },
      { label: 'Appointment Setting', to: '/services' },
      { label: 'Live Transfers', to: '/services' },
      { label: 'Database Reactivation', to: '/services' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Real Estate', to: '/industries/real-estate' },
      { label: 'Roofing', to: '/industries/roofing' },
      { label: 'HVAC', to: '/industries/hvac' },
      { label: 'Dog Training', to: '/industries/dog-training' },
      { label: 'More Industries', to: '/industries' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Why Link', to: '/about' },
      { label: 'Our Process', to: '/how-it-works' },
      { label: 'Resources', to: '/faq' },
      { label: 'Contact', to: '/get-started' },
    ],
  },
  {
    title: 'Portal Access',
    links: [
      { label: 'Customer Portal', href: CUSTOMER_PORTAL_SIGN_IN },
      { label: 'Agent Portal', href: AGENT_PORTAL_SIGN_IN },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Communications Policy', to: '/communications-policy' },
      { label: 'Accessibility', to: '/accessibility' },
    ],
  },
];

function Wordmark() {
  return <BrandLogo className="block h-[78px] w-[230px]" />;
}

function FooterLink({ link }) {
  const className = "text-xs text-white/60 transition-colors hover:text-[#e0bd55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]";

  if (link.href) {
    return (
    <a href={link.href} className={className} rel="nofollow">
        {link.label}
      </a>
    );
  }

  return <Link to={link.to} className={className}>{link.label}</Link>;
}

export default function Footer() {
  return (
    <footer className="border-t border-[#d4af37]/20 bg-[#061a1d] text-white">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_repeat(5,minmax(0,1fr))]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" aria-label="Link Marketing Services home"><Wordmark /></Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
              We help businesses turn new inquiries and existing databases into qualified conversations.
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[.15em] text-[#d4af37]">LinkMarketingServices.com</p>
          </div>

          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[.22em] text-[#d4af37]">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-[11px] text-white/40 md:flex-row">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p>Link Marketing Services is a DBA of Link Marketing Solutions.</p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('link:privacy-settings'))}
              className="underline decoration-white/25 underline-offset-4 transition-colors hover:text-[#e0bd55]"
            >
              Privacy choices
            </button>
          </div>
          <p>&copy; {new Date().getFullYear()} Link Marketing Services. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
