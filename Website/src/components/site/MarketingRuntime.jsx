import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { captureAttribution, getConsent, loadGoogleTag, trackEvent } from '@/lib/marketing';

export default function MarketingRuntime() {
  const location = useLocation();

  useEffect(() => {
    captureAttribution(location.search);
    if (getConsent() === 'granted') loadGoogleTag();
    trackEvent('page_view', {
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onCtaClick = (event) => trackEvent('cta_click', event.detail);
    window.addEventListener('link:cta-click', onCtaClick);
    return () => window.removeEventListener('link:cta-click', onCtaClick);
  }, []);

  return null;
}
