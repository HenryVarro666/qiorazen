import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-brand-700">
            {t("appName")}
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/dashboard/insights/new" className="text-sm text-muted-foreground hover:text-foreground">
              New Session
            </Link>
            <LanguageSwitcher />
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
