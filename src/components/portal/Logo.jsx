export default function Logo({ variant = "dark", size = 30, showWord = true, className = "" }) {
  const width = Math.max(showWord ? 190 : 72, Math.round(size * (showWord ? 7.25 : 2.4)));
  return (
    <div
      className={`inline-flex max-w-full items-center ${variant === "dark" ? "rounded-xl bg-[#071b1e] px-2.5 py-1.5" : ""} ${className}`}
      aria-label="Link Marketing Services Customer Portal"
    >
      <img
        src="/link-customer-portal-logo.svg"
        alt="Link Marketing Services Customer Portal"
        className="h-auto max-w-full object-contain"
        style={{ width }}
        width="1400"
        height="466"
        decoding="async"
      />
    </div>
  );
}
