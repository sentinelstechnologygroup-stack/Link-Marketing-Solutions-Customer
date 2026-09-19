export default function SectionCard({ title, subtitle = "", action = null, children, className = "", bodyClass = "" }) {
  return (
    <section className={`portal-card flex flex-col ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-3 px-4 sm:px-5 pt-4 sm:pt-5">
          <div>
            {title && <h3 className="font-display text-[17px] font-semibold leading-tight" style={{ color: "var(--shell)" }}>{title}</h3>}
            {subtitle && <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--muted-ink)" }}>{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={`p-4 sm:p-5 ${bodyClass}`}>{children}</div>
    </section>
  );
}