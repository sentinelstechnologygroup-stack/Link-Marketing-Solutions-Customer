import { useId } from "react";

const tracePaths = [
  { d: "M82 78 L82 290 L235 290", delay: "0s", spark: [82, 78] },
  { d: "M286 78 L286 290", delay: "0.48s", spark: [286, 78] },
  { d: "M390 290 L390 78 L570 290 L570 78", delay: "0.9s", spark: [390, 290] },
  { d: "M650 78 L650 290 M650 198 L820 78 M650 198 L810 290", delay: "1.48s", spark: [650, 78] },
  { d: "M902 145 Q918 122 948 122 L1315 122 Q1345 138 1345 162 Q1345 194 1310 202 L930 202", delay: "2.08s", spark: [902, 145] },
  { d: "M958 220 L958 286 L1265 286", delay: "2.72s", spark: [958, 220] },
];

export default function Logo({ variant = "dark", size = 30, showWord = true, className = "" }) {
  const width = Math.max(showWord ? 190 : 72, Math.round(size * (showWord ? 7.25 : 2.4)));
  const electricFilterId = `electric-${useId().replace(/:/g, "")}`;

  return (
    <div
      className={`logo-electric relative inline-flex max-w-full items-center overflow-hidden rounded-lg bg-[#001922] shadow-sm ${variant === "light" ? "shadow-black/25" : ""} ${className}`}
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
      <svg
        viewBox="0 0 1400 466"
        preserveAspectRatio="xMidYMid meet"
        className="logo-electric__overlay"
        aria-hidden="true"
      >
        <defs>
          <filter id={electricFilterId} x="-20%" y="-30%" width="140%" height="160%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.12" numOctaves="1" seed="3" result="noise">
              <animate attributeName="seed" values="2;8;4;11;3" dur="0.35s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="B" />
          </filter>
        </defs>
        {tracePaths.map(({ d, delay, spark }) => (
          <g key={d} filter={`url(#${electricFilterId})`}>
            <path className="logo-electric__arc logo-electric__arc--glow" pathLength="1" d={d} style={{ animationDelay: delay }} />
            <path className="logo-electric__arc logo-electric__arc--core" pathLength="1" d={d} style={{ animationDelay: delay }} />
            <circle className="logo-electric__spark" cx={spark[0]} cy={spark[1]} r="7" style={{ animationDelay: delay }} />
          </g>
        ))}
      </svg>
    </div>
  );
}