export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-7xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
        PAKDE
      </h1>
      <p className="mt-8 max-w-md text-base text-slate-400 leading-relaxed">
        Offline-first desktop app for Indonesian cooperatives. Manage members, accounting, inventory, and financial
        analysis — all on your device.
      </p>

      <div className="mt-12 flex gap-4">
        <a
          href="https://github.com/okihita/PAKDE-tauri/releases/latest"
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 transition-colors"
        >
          Download for macOS
        </a>
        <a
          href="https://github.com/okihita/PAKDE-tauri"
          className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
        >
          View on GitHub
        </a>
      </div>

      <div className="mt-20 flex flex-wrap justify-center gap-8 text-xs text-slate-600">
        <Feature icon="👥" label="Member Management" />
        <Feature icon="📊" label="Double-Entry Accounting" />
        <Feature icon="📦" label="Inventory & Sales" />
        <Feature icon="📈" label="Feasibility Analysis" />
        <Feature icon="🔒" label="Works Offline" />
        <Feature icon="☁️" label="Sync (coming soon)" />
      </div>

      <footer className="mt-24 text-xs text-slate-700">
        &copy; {new Date().getFullYear()} PAKDE. Built for Indonesian cooperatives.
      </footer>
    </main>
  );
}

function Feature({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
