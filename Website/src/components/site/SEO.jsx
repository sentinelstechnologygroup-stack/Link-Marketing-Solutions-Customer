import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { INDUSTRIES } from './industries';
import { FAQS } from '@/content/faqs';
import { SITE_URL } from '@/lib/marketing';

const BRAND = 'Link Marketing Services';
const DEFAULT_IMAGE = `${SITE_URL}/brand/link-marketing-services-social.jpg`;

const PAGES = {
  '/': {
    title: 'Lead Response & Qualification Services | Link Marketing Services',
    description: 'Turn inbound leads into qualified conversations with bilingual lead response, qualification, appointment setting, live transfers, follow-up, and reporting.',
  },
  '/services': {
    title: 'Lead Response, Qualification & Appointment Setting Services',
    description: 'Explore managed lead response, qualification, appointment setting, live transfers, nurturing, database reactivation, and performance reporting.',
  },
  '/how-it-works': {
    title: 'How Our Lead Qualification & Sales Handoff Process Works',
    description: 'See how Link responds to new inquiries, holds real conversations, qualifies prospects, and hands sales-ready opportunities to your team.',
  },
  '/industries': {
    title: 'Lead Qualification Services by Industry',
    description: 'Industry-specific lead response and qualification programs for real estate, home services, automotive, professional services, healthcare, B2B, and more.',
  },
  '/pricing': {
    title: 'Performance-Based Lead Qualification Pricing',
    description: 'No retainer and no setup fee. Request pricing for a program built around your market, lead volume, qualification criteria, and sales handoff needs.',
  },
  '/about': {
    title: 'About Link Marketing Services',
    description: 'Meet the lead engagement partner built around real conversations, bilingual representatives, client-approved scripts, transparent reporting, and measured outcomes.',
  },
  '/faq': {
    title: 'Lead Response & Qualification FAQs',
    description: 'Answers about qualified leads, live transfers, appointment setting, database reactivation, supported industries, pricing, and the Link process.',
  },
  '/get-started': {
    title: 'Request a Lead Program Review',
    description: 'Tell us about your market, monthly lead volume, lead sources, and qualification needs. Request a tailored lead engagement program review.',
  },
  '/privacy': { title: 'Privacy Policy', description: 'How Link Marketing Services collects, uses, protects, and shares website inquiry information.' },
  '/terms': { title: 'Terms of Service', description: 'Terms governing use of the Link Marketing Services website and service information.' },
  '/communications-policy': { title: 'Communications Policy', description: 'How Link Marketing Services handles inquiry follow-up, consent, message frequency, and opt-out requests.' },
  '/accessibility': { title: 'Accessibility Statement', description: 'Link Marketing Services’ commitment to an accessible website experience.' },
};

function setMeta(selector, attrs) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
}

function setCanonical(url) {
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

function setStructuredData(items) {
  document.head.querySelectorAll('script[data-link-schema]').forEach((node) => node.remove());
  items.filter(Boolean).forEach((item) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.linkSchema = 'true';
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  });
}

export default function SEO() {
  const location = useLocation();
  const pathname = location.pathname.replace(/\/$/, '') || '/';
  const industrySlug = pathname.startsWith('/industries/') ? pathname.split('/')[2] : null;
  const industry = INDUSTRIES.find((item) => item.slug === industrySlug);
  const page = industry
    ? {
        title: `${industry.name} Lead Response & Qualification Services`,
        description: `${industry.intro} Learn how Link Marketing Services qualifies and routes ${industry.name.toLowerCase()} opportunities.`,
      }
    : PAGES[pathname];
  const isNotFound = !page;
  const title = page
    ? (page.title.endsWith(BRAND) ? page.title : `${page.title} | ${BRAND}`)
    : `Page Not Found | ${BRAND}`;
  const description = page?.description || 'The requested page could not be found.';
  const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
  const robots = isNotFound ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  useEffect(() => {
    document.title = title;
    document.documentElement.lang = 'en';
    setCanonical(canonicalUrl);
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', { name: 'robots', content: robots });
    setMeta('meta[property="og:type"]', { property: 'og:type', content: industry ? 'website' : 'website' });
    setMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: BRAND });
    setMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'en_US' });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE });
    setMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: 'Link Marketing Services' });
    setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_IMAGE });

    const breadcrumb = pathname === '/' ? null : {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        ...(industry ? [{ '@type': 'ListItem', position: 2, name: 'Industries', item: `${SITE_URL}/industries` }] : []),
        { '@type': 'ListItem', position: industry ? 3 : 2, name: industry?.name || page?.title || 'Page', item: canonicalUrl },
      ],
    };
    const organization = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: BRAND,
      legalName: 'Link Business Alliance LLC',
      url: SITE_URL,
      logo: DEFAULT_IMAGE,
      description: PAGES['/'].description,
      areaServed: { '@type': 'Country', name: 'United States' },
    };
    const website = pathname === '/' ? {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: BRAND,
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
    } : null;
    const faq = pathname === '/faq' ? {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: FAQS.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    } : null;
    const service = industry ? {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: `${industry.name} Lead Response and Qualification`,
      description,
      provider: { '@id': `${SITE_URL}/#organization` },
      areaServed: { '@type': 'Country', name: 'United States' },
      serviceType: ['Lead response', 'Lead qualification', 'Appointment setting', 'Live transfers'],
      url: canonicalUrl,
    } : null;

    setStructuredData([organization, website, faq, service, breadcrumb]);
  }, [canonicalUrl, description, industry, pathname, robots, title]);

  return null;
}
