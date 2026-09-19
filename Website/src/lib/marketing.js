const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://linkmarketingservices.com').replace(/\/$/, '');
const CONSENT_KEY = 'link_marketing_consent_v1';
const ATTRIBUTION_KEY = 'link_marketing_attribution_v1';
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'fbclid'];
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];
const ALLOWED_PARAMS = [...UTM_KEYS, ...CLICK_IDS];

/** @param {'localStorage'|'sessionStorage'} type @returns {Storage|null} */
function safeStorage(type) {
  try {
    return window[type];
  } catch {
    return null;
  }
}

export function getConsent() {
  return safeStorage('localStorage')?.getItem(CONSENT_KEY) || 'unset';
}

export function setConsent(value) {
  safeStorage('localStorage')?.setItem(CONSENT_KEY, value);
  window.dispatchEvent(new CustomEvent('link:consent-changed', { detail: value }));
}

export function captureAttribution(search = window.location.search) {
  const params = new URLSearchParams(search);
  const captured = {};
  ALLOWED_PARAMS.forEach((key) => {
    const value = params.get(key);
    if (value) captured[key] = value.slice(0, 250);
  });

  const session = safeStorage('sessionStorage');
  const local = safeStorage('localStorage');
  const existing = getAttribution();
  const now = new Date().toISOString();
  const landingPage = `${window.location.pathname}${window.location.search}`.slice(0, 500);
  const referrer = document.referrer?.slice(0, 500) || '';

  const next = {
    firstTouch: existing.firstTouch || { ...captured, landingPage, referrer, capturedAt: now },
    lastTouch: { ...captured, landingPage, referrer, capturedAt: now },
  };

  session?.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
  if (getConsent() === 'granted') local?.setItem(ATTRIBUTION_KEY, JSON.stringify(next));
  return next;
}

export function getAttribution() {
  for (const store of [safeStorage('sessionStorage'), safeStorage('localStorage')]) {
    try {
      const parsed = JSON.parse(store?.getItem(ATTRIBUTION_KEY) || 'null');
      if (parsed?.firstTouch || parsed?.lastTouch) return parsed;
    } catch {
      // Ignore invalid or unavailable browser storage.
    }
  }
  return {};
}

export function trackEvent(name, params = {}) {
  const payload = { event: name, ...params };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
  window.dispatchEvent(new CustomEvent('link:marketing-event', { detail: payload }));

  if (getConsent() === 'granted' && typeof window.gtag === 'function') {
    window.gtag('event', name, params);
  }
}

export function trackLeadConversion(params = {}) {
  trackEvent('generate_lead', params);
  const conversionId = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_ID;
  const conversionLabel = import.meta.env.VITE_GOOGLE_ADS_LEAD_LABEL;
  if (getConsent() === 'granted' && conversionId && conversionLabel && typeof window.gtag === 'function') {
    window.gtag('event', 'conversion', {
      send_to: `${conversionId}/${conversionLabel}`,
      value: 1,
      currency: 'USD',
    });
  }
}

export function loadGoogleTag() {
  const tagId = import.meta.env.VITE_GOOGLE_TAG_ID;
  if (!tagId || getConsent() !== 'granted' || document.querySelector('[data-link-google-tag]')) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', tagId, { anonymize_ip: true, send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
  script.dataset.linkGoogleTag = 'true';
  document.head.appendChild(script);
}

export { SITE_URL };
