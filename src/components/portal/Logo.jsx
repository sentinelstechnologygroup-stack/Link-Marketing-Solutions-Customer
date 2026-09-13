export default function Logo({ variant = "dark", size = 28, showWord = true, className = "" }) {
  // variant: "dark" (for light backgrounds) or "light" (for the navy shell)
  const word = variant === "light" ? "#FBFAF7" : "#0B2A2E";
  const sub = variant === "light" ? "#9FB5B3" : "#5A6B6D";
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" className="shrink-0">
        <rect width="64" height="64" rx="14" fill="#0B2A2E" />
        <path d="M18 44V20h5v19h12v5H18z" fill="#FBFAF7" />
        <circle cx="44" cy="32" r="9" stroke="#C9A24B" strokeWidth="4" />
        <path d="M44 23v18" stroke="#14857F" strokeWidth="4" />
      </svg>
      {showWord && (
        <div className="leading-none">
          <div className="font-display text-[15px] font-semibold tracking-tight" style={{ color: word }}>
            Link Marketing
          </div>
          <div className="text-[10px] font-medium tracking-[0.22em] uppercase" style={{ color: sub }}>
            Services
          </div>
        </div>
      )}
    </div>
  );
}