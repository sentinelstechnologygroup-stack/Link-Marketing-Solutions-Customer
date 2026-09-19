import { Component } from "react";
import { AlertTriangle } from "lucide-react";

export default class PortalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || "Something went wrong" };
  }
  componentDidCatch() { /* no-op; surface in UI */ }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <AlertTriangle className="w-8 h-8 mb-3" style={{ color: "var(--warn)" }} />
        <h2 className="font-display text-xl font-semibold" style={{ color: "var(--shell)" }}>
          This section couldn’t load
        </h2>
        <p className="mt-1 text-sm max-w-md" style={{ color: "var(--muted-ink)" }}>
          {this.state.message}. You can try again, or return to the overview.
        </p>
        <button
          onClick={() => this.setState({ hasError: false, message: "" })}
          className="mt-4 touch-target px-4 rounded-md text-sm font-medium text-white focus-ring"
          style={{ background: "var(--shell)" }}
        >
          Try again
        </button>
      </div>
    );
  }
}