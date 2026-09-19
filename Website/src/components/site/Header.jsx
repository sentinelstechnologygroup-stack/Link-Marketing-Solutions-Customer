import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { CTAButton } from './ui';
import { cn } from '@/lib/utils';
import BrandLogo from './BrandLogo';

const NAV = [
  { label: 'Solutions', to: '/services' },
  { label: 'Our Process', to: '/how-it-works' },
  { label: 'Industries', to: '/industries' },
  { label: 'Why Link', to: '/#why' },
  { label: 'About', to: '/about' },
  { label: 'Resources', to: '/faq' },
];

function Wordmark() {
  return <BrandLogo className="block h-[58px] w-[188px]" />;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-[#d4af37]/15 bg-[#071b1e]/95 shadow-[0_12px_35px_rgba(0,0,0,0.18)] backdrop-blur-xl'
          : 'border-white/10 bg-[#071b1e]/92 backdrop-blur-md'
      )}
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="flex h-[76px] items-center justify-between">
          <Link to="/" aria-label="Link Marketing Services home" className="shrink-0">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary navigation">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-[13px] font-medium text-[#dbe4e2] transition-colors hover:text-[#d4af37]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <CTAButton to="/get-started" size="sm">
              Build My Lead Program
            </CTAButton>
          </div>

          <button
            type="button"
            className="p-2 text-white lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#071b1e] lg:hidden"
          >
            <div className="flex flex-col px-6 py-5">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="border-b border-white/10 py-3 text-sm font-medium text-[#dbe4e2] hover:text-[#d4af37]"
                >
                  {item.label}
                </Link>
              ))}
              <CTAButton to="/get-started" className="mt-5">
                Build My Lead Program
              </CTAButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
