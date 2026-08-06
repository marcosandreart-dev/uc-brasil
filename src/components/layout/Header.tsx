import Link from "next/link";
import { Leaf } from "lucide-react";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/buscar", label: "Buscar UCs" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Leaf aria-hidden className="h-5 w-5" />
          </span>
          <span className="text-xl font-bold text-gray-900">UC Brasil</span>
        </Link>

        <nav aria-label="Navegação principal" className="flex items-center gap-6 text-sm font-medium text-gray-600">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition-colors hover:text-primary-600">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
