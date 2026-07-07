import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAKDE — Koperasi Management Desktop App",
  description:
    "Offline-first desktop app for Indonesian cooperatives. Manage members, accounting, inventory, and financial analysis — all on your device.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
