import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** @param {{className?: string, children?: import('react').ReactNode}} props */
export function Container({ className, children }) {
  return <div className={cn('mx-auto w-full max-w-7xl px-6 md:px-10', className)}>{children}</div>;
}

const BTN_BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold tracking-wide transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none';
const BTN_VARIANTS = {
  primary:
    'bg-[#d4af37] text-[#04181a] hover:bg-[#c9a433] shadow-[0_8px_24px_-8px_rgba(212,175,55,0.6)] hover:shadow-[0_10px_30px_-8px_rgba(212,175,55,0.75)]',
  ghost:
    'border border-[#00282d]/15 text-[#00282d] bg-white hover:border-[#d4af37] hover:text-[#00838f]',
  outline:
    'border border-[#d4af37]/50 text-[#00838f] hover:bg-[#d4af37]/10 hover:border-[#d4af37]',
  onDark:
    'border border-white/20 text-white bg-white/5 backdrop-blur hover:border-[#d4af37]/60 hover:text-[#d4af37]',
};
const BTN_SIZES = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-7 py-3.5 text-sm',
  lg: 'px-8 py-4 text-base',
};

/** @param {{to?: string, href?: string, onClick?: (event: any) => void, type?: 'button'|'submit'|'reset', variant?: 'primary'|'ghost'|'outline'|'onDark', size?: 'sm'|'md'|'lg', className?: string, children?: import('react').ReactNode, [key: string]: any}} props */
export function CTAButton({ to, href, onClick, type = 'button', variant = 'primary', size = 'md', className, children, ...props }) {
  const classes = cn(BTN_BASE, BTN_VARIANTS[variant], BTN_SIZES[size], className);
  const handleClick = (event) => {
    window.dispatchEvent(new CustomEvent('link:cta-click', {
      detail: { destination: to || href || 'form-action', label: event.currentTarget.textContent?.trim() || 'CTA' },
    }));
    onClick?.(event);
  };
  if (to) return <Link to={to} className={classes} onClick={handleClick} {...props}>{children}</Link>;
  if (href) return <a href={href} className={classes} onClick={handleClick} {...props}>{children}</a>;
  return (
    <button type={type} onClick={handleClick} className={classes} {...props}>
      {children}
    </button>
  );
}

/** @param {{eyebrow?: string, title: string, subtitle?: string, align?: 'center'|'left', onDark?: boolean, className?: string}} props */
export function SectionHeading({ eyebrow, title, subtitle, align = 'center', onDark = false, className }) {
  const titleCls = onDark ? 'text-white' : 'text-[#04181a]';
  const subCls = onDark ? 'text-[#9fb3b3]' : 'text-[#4a5a5c]';
  const eyebrowCls = onDark ? 'text-[#d4af37]' : 'text-[#00838f]';
  return (
    <div className={cn(align === 'center' ? 'text-center mx-auto max-w-3xl' : 'text-left', className)}>
      {eyebrow && (
        <div className={cn('inline-flex items-center gap-2.5 mb-5', align === 'center' && 'justify-center')}>
          <span className={cn('h-px w-8', onDark ? 'bg-[#d4af37]' : 'bg-[#d4af37]')} />
          <span className={cn('text-xs uppercase tracking-[0.25em] font-semibold', eyebrowCls)}>{eyebrow}</span>
        </div>
      )}
      <h2 className={cn('text-3xl md:text-5xl font-bold tracking-tight leading-[1.08]', titleCls)}>{title}</h2>
      {subtitle && <p className={cn('mt-5 text-lg leading-relaxed', subCls)}>{subtitle}</p>}
    </div>
  );
}

/** @param {{children?: import('react').ReactNode, delay?: number, className?: string}} props */
export function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function PulseDivider() {
  return (
    <div className="relative h-px w-full">
      <div className="pulse-line absolute inset-0" />
    </div>
  );
}
