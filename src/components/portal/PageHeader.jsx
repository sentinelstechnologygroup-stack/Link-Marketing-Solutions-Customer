import { Link } from "react-router-dom";

export default function PageHeader({ title, description = "", actions = null }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
      <div>
        <h1 className="font-display text-[26px] sm:text-[30px] font-semibold leading-tight tracking-tight" style={{ color: "var(--shell)" }}>
          {title}
        </h1>
        {description && <p className="mt-1 text-sm" style={{ color: "var(--muted-ink)" }}>{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function GhostButton({ children, onClick, type = "button", className = "", ...rest }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`touch-target inline-flex items-center gap-2 px-3.5 rounded-lg text-[13px] font-medium border bg-white focus-ring ${className}`}
      style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, onClick, type = "button", className = "", disabled = false, ...rest }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`touch-target inline-flex items-center justify-center gap-2 px-4 rounded-lg text-[13px] font-semibold text-white focus-ring disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      style={{ background: "var(--shell)" }}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({ to, children, className = "", ...rest }) {
  return (
    <Link
      to={to}
      className={`touch-target inline-flex items-center gap-2 px-3.5 rounded-lg text-[13px] font-medium border bg-white focus-ring ${className}`}
      style={{ borderColor: "var(--line)", color: "var(--ink-2)" }}
      {...rest}
    >
      {children}
    </Link>
  );
}