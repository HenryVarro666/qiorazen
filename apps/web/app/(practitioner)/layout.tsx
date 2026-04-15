import Link from "next/link";
import { useTranslations } from "next-intl";

export default function PractitionerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-brand-700">
              {t("appName")}
            </Link>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              Advisor Portal
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/portal" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/portal/cases" className="text-sm text-muted-foreground hover:text-foreground">
              Cases
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
