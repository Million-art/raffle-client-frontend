import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-[var(--color-slate-50)] text-[var(--color-slate-900)] py-16 border-t border-[var(--color-slate-200)]">

      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-10">

        <div>
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={160} height={50} className="h-12 w-auto object-contain mb-3" />
          </Link>
          <p className="text-sm text-slate-600">
            The trusted platform for secure online raffles.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/raffles" className="hover:text-[var(--brand-blue)]">Browse Raffles</Link></li>
            <li><Link href="/agents" className="hover:text-[var(--brand-blue)]">Become Agent</Link></li>
            <li><Link href="/winners" className="hover:text-[var(--brand-blue)]">Past Winners</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/about" className="hover:text-[var(--brand-blue)]">About</Link></li>
            <li><Link href="/contact" className="hover:text-[var(--brand-blue)]">Contact</Link></li>
            <li><Link href="/faq" className="hover:text-[var(--brand-blue)]">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-600">
            <li><Link href="/terms" className="hover:text-[var(--brand-blue)]">Terms</Link></li>
            <li><Link href="/privacy" className="hover:text-[var(--brand-blue)]">Privacy</Link></li>
          </ul>
        </div>

      </div>

      <div className="text-center text-xs text-slate-500 mt-12">
        © {new Date().getFullYear()} All rights reserved.
      </div>

    </footer>
  );
}
