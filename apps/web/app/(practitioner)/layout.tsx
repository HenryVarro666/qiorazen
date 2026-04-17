"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { createClient } from "@/lib/supabase/client";

export default function PractitionerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("common");
  const locale = useLocale() as "en" | "zh";
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link href="/portal" className="text-xl font-bold text-brand-700">
              {t("appName")}
            </Link>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
              {locale === "zh" ? "顾问工作台" : "Advisor Portal"}
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/portal" className="text-sm text-muted-foreground hover:text-foreground">
              {locale === "zh" ? "总览" : "Dashboard"}
            </Link>
            <Link href="/portal/cases" className="text-sm text-muted-foreground hover:text-foreground">
              {locale === "zh" ? "案例" : "Cases"}
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              {locale === "zh" ? "用户面板" : "My Dashboard"}
            </Link>
            <LanguageSwitcher />
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {locale === "zh" ? "退出" : "Log Out"}
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
