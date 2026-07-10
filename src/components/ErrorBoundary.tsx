import { Component, type ErrorInfo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { WarningIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

interface BoundaryProps {
  children: ReactNode;
}

interface BoundaryState {
  error: Error | null;
}

/**
 * Catches render-time crashes anywhere in the tree and also surfaces
 * uncaught async errors (global `error` / `unhandledrejection` events),
 * which a normal React error boundary cannot catch. Without this, a single
 * throw in any of the 21k LOC blanks the whole desktop app for the user.
 */
export class ErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface in console for diagnostics; the UI fallback is handled below.
    console.error("Uncaught error:", error, info.componentStack);
  }

  componentDidMount() {
    window.addEventListener("error", this.handleGlobalError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleGlobalError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  // Only react to real Errors; resource-load failures (e.g. <img> 404) fire
  // `error` with no Error object and must not trigger a full crash screen.
  private handleGlobalError = (event: ErrorEvent) => {
    if (event.error instanceof Error) this.setState({ error: event.error });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    this.setState({ error: reason instanceof Error ? reason : new Error(String(reason)) });
  };

  private handleReload = () => {
    this.setState({ error: null });
    window.location.reload();
  };

  render() {
    if (this.state.error) {
      return <CrashScreen error={this.state.error} onReload={this.handleReload} />;
    }
    return this.props.children;
  }
}

function CrashScreen({ error, onReload }: { error: Error; onReload: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-md p-8 bg-input border border-danger/30 rounded-2xl shadow-2xl text-center">
        <WarningIcon className="h-12 w-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-danger mb-1">{t("crash.title")}</h2>
        <p className="text-muted-foreground text-xs mb-6">{t("crash.message")}</p>
        <div className="bg-danger/5 border border-danger/10 p-4 rounded-xl text-danger text-left font-mono text-xs mb-6 overflow-x-auto">
          <code>{error.message || String(error)}</code>
        </div>
        <Button variant="destructive" className="w-full" onClick={onReload}>
          {t("crash.reload")}
        </Button>
      </div>
    </div>
  );
}
