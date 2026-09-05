import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--bg-2)] mt-auto px-4 sm:px-6 py-6 text-xs text-[var(--text-4)] flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <span>Voltra — buy and sell PC parts locally.</span>
      <div className="flex items-center gap-4">
        <Link href="/terms" className="hover:text-[var(--text-3)] transition-colors">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:text-[var(--text-3)] transition-colors">
          Privacy Policy
        </Link>
        <span>&copy; {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
