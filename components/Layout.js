// components/Layout.js
// Enveloppe commune : header + footer, réutilisée sur toutes les pages.
import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            Kelo<span className="text-violet">Verify</span>
          </Link>
          <span className="text-sm text-gray-500">W Social → Kelo Social</span>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 text-sm text-gray-400">
          Passerelle de vérification manuelle — aucune donnée n'est utilisée à d'autres fins.
        </div>
      </footer>
    </div>
  );
}
