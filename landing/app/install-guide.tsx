"use client";

import { useEffect, useState, type ReactNode } from "react";

const windowsSteps: ReactNode[] = [
  <>
    <span className="text-slate-300">Unduh installer</span> dengan mengklik tombol di bawah.
  </>,
  <>
    <span className="text-slate-300">Jalankan file `.exe`</span> hasil unduhan.
  </>,
  <>
    Jika muncul peringatan Windows SmartScreen (
    <span className="text-slate-400">&quot;Windows protected your PC&quot;</span>), klik{" "}
    <span className="text-slate-200 font-medium">"More info"</span> lalu pilih{" "}
    <span className="text-emerald-400 font-medium">"Run anyway"</span>.
  </>,
];

const macSteps: ReactNode[] = [
  <>
    <span className="text-slate-300">Unduh file `.dmg`</span> dengan mengklik tombol di bawah.
  </>,
  <>
    Buka file `.dmg` dan <span className="text-slate-300">tarik ikon PAKDE</span> ke dalam folder{" "}
    <span className="text-slate-200">Applications</span>.
  </>,
  <>
    Bypass Gatekeeper: <span className="text-slate-200 font-medium">Klik kanan</span> aplikasi di Applications, pilih{" "}
    <span className="text-slate-200 font-medium">Open</span>, lalu konfirmasi{" "}
    <span className="text-emerald-400 font-medium">Open</span>. (Atau jalankan{" "}
    <code className="bg-slate-950 px-1 py-0.5 rounded text-red-400 text-xxs font-mono">
      xattr -cr /Applications/PAKDE.app
    </code>{" "}
    di Terminal).
  </>,
];

export default function InstallGuide({ children, className = "" }: { children: ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-700 bg-[#0c0c0c] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup"
              className="absolute right-4 top-4 text-slate-500 transition-colors hover:text-white"
            >
              ✕
            </button>
            <div className="pointer-events-none absolute -top-10 right-6 h-32 w-32 rounded-full bg-emerald-600/15 blur-3xl" />
            <h3 className="text-lg font-bold text-white">Cara Instalasi</h3>
            <p className="mt-1 text-xs text-slate-500">Panduan lengkap untuk Windows, lalu macOS.</p>

            {/* Windows first */}
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">💻</span>
                <h4 className="text-sm font-bold text-white">Windows</h4>
              </div>
              <ol className="list-decimal list-inside space-y-2.5 text-xs leading-relaxed text-slate-400">
                {windowsSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>

            {/* macOS second */}
            <div className="mt-6 border-t border-slate-800 pt-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">🍎</span>
                <h4 className="text-sm font-bold text-white">macOS</h4>
              </div>
              <ol className="list-decimal list-inside space-y-2.5 text-xs leading-relaxed text-slate-400">
                {macSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
