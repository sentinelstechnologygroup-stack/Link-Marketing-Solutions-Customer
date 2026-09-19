import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getConsent, loadGoogleTag, setConsent } from '@/lib/marketing';

export default function ConsentBanner() {
  const [choice, setChoice] = useState(() => (typeof window === 'undefined' ? 'unset' : getConsent()));

  useEffect(() => {
    const reopen = () => setChoice('unset');
    const changed = (event) => {
      setChoice(event.detail);
      if (event.detail === 'granted') loadGoogleTag();
    };
    window.addEventListener('link:privacy-settings', reopen);
    window.addEventListener('link:consent-changed', changed);
    if (choice === 'granted') loadGoogleTag();
    return () => {
      window.removeEventListener('link:privacy-settings', reopen);
      window.removeEventListener('link:consent-changed', changed);
    };
  }, [choice]);

  if (choice !== 'unset') return null;

  const decide = (value) => {
    setConsent(value);
    setChoice(value);
  };

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-3xl rounded-xl border border-[#d4af37]/30 bg-[#071b1e] p-5 text-white shadow-2xl md:flex md:items-center md:gap-6" aria-label="Privacy choices">
      <p className="text-sm leading-6 text-white/75">
        We use optional analytics and advertising cookies to measure performance. You can accept or decline them. See our <Link to="/privacy" className="text-[#e0bd55] underline underline-offset-2">privacy policy</Link>.
      </p>
      <div className="mt-4 flex shrink-0 gap-3 md:mt-0">
        <button type="button" onClick={() => decide('denied')} className="rounded-md border border-white/25 px-4 py-2 text-sm font-semibold hover:border-white/60">Decline</button>
        <button type="button" onClick={() => decide('granted')} className="rounded-md bg-[#d4af37] px-4 py-2 text-sm font-semibold text-[#04181a] hover:bg-[#e0bd55]">Accept</button>
      </div>
    </aside>
  );
}
