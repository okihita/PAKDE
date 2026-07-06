import { useState, useEffect, useCallback } from "react";
import { Bug, X } from "lucide-react";

interface LogEntry {
  id: number;
  message: string;
  type: "error" | "warn" | "info";
  time: string;
}

let nextId = 0;
const MAX_LOGS = 50;

// Global store so errors from anywhere in the app appear here
const logListeners = new Set<(entry: LogEntry) => void>();

export function devLog(message: string, type: LogEntry["type"] = "error") {
  const entry: LogEntry = {
    id: nextId++,
    message,
    type,
    time: new Date().toLocaleTimeString(),
  };
  logListeners.forEach((fn) => fn(entry));
}

export default function DevConsole() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Subscribe to devLog calls
  useEffect(() => {
    const handler = (entry: LogEntry) => {
      setLogs((prev) => [entry, ...prev].slice(0, MAX_LOGS));
    };
    logListeners.add(handler);
    return () => {
      logListeners.delete(handler);
    };
  }, []);

  // Catch unhandled errors
  const errorHandler = useCallback((event: ErrorEvent) => {
    devLog(`${event.message} (${event.filename}:${event.lineno})`, "error");
  }, []);

  // Catch unhandled promise rejections
  const rejectionHandler = useCallback((event: PromiseRejectionEvent) => {
    const msg = event.reason instanceof Error ? event.reason.message : String(event.reason);
    devLog(`Unhandled rejection: ${msg}`, "error");
  }, []);

  useEffect(() => {
    window.addEventListener("error", errorHandler);
    window.addEventListener("unhandledrejection", rejectionHandler);
    return () => {
      window.removeEventListener("error", errorHandler);
      window.removeEventListener("unhandledrejection", rejectionHandler);
    };
  }, [errorHandler, rejectionHandler]);

  const errorCount = logs.filter((l) => l.type === "error").length;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => {
          if (visible && expanded) {
            setExpanded(false);
          } else if (visible && !expanded) {
            setVisible(false);
          } else {
            setVisible(true);
            setExpanded(true);
          }
        }}
        className="fixed bottom-2 left-2 z-[9999] flex items-center gap-1.5 text-xxxs font-mono font-bold px-2 py-1 rounded-lg border transition-all
          bg-slate-950/90 border-slate-800 hover:border-slate-600 text-slate-400"
        title="Developer Console"
      >
        <Bug className="h-3 w-3" />
        {errorCount > 0 && (
          <span className="text-rose-400">{errorCount}</span>
        )}
      </button>

      {/* Console panel */}
      {visible && expanded && (
        <div className="fixed bottom-10 left-2 z-[9998] w-[480px] max-h-[300px] rounded-lg border border-slate-700 bg-slate-950/95 backdrop-blur-md shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800 shrink-0">
            <span className="text-xxs font-mono font-bold text-slate-400">
              DEV CONSOLE
              {errorCount > 0 && (
                <span className="ml-2 text-rose-400">({errorCount} errors)</span>
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setLogs([])}
                className="text-xxxs font-mono text-slate-500 hover:text-slate-300 px-1.5 py-0.5 rounded hover:bg-slate-800"
              >
                clear
              </button>
              <button
                onClick={() => setVisible(false)}
                className="text-slate-500 hover:text-slate-300"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Log entries */}
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 font-mono text-xxxs">
            {logs.length === 0 ? (
              <div className="text-slate-600 p-2 text-center">no errors logged</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`px-2 py-1 rounded break-all ${
                    log.type === "error"
                      ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                      : log.type === "warn"
                        ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                        : "bg-slate-800/40 text-slate-400"
                  }`}
                >
                  <span className="text-slate-600 mr-2">{log.time}</span>
                  <span className="uppercase font-bold text-xxxs mr-1">[{log.type}]</span>
                  {log.message}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
}
