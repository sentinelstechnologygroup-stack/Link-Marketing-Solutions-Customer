export default function Logo({ variant = "dark", size = 30, showWord = true, className = "" }) {
  const width = Math.max(showWord ? 190 : 72, Math.round(size * (showWord ? 7.25 : 2.4)));

  return (
    <div
      className={`inline-flex max-w-full items-center overflow-hidden rounded-lg bg-[#001922] shadow-sm ${variant === "light" ? "shadow-black/25" : ""} ${className}`}
      aria-label="Link Marketing Services Customer Portal"
    >
      <img
        src="/link-customer-portal-logo.svg"
        alt="Link Marketing Services Customer Portal"
        className="block h-auto max-w-full object-contain"
        style={{ width }}
        width="1400"
        height="466"
        decoding="async"
      />
    </div>
  );
}
