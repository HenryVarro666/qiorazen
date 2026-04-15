import { useTranslations } from "next-intl";
import Link from "next/link";
import { QuestionnaireForm } from "@/components/screening/questionnaire-form";

export default function ScreeningPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold text-brand-700">
            {t("common.appName")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">{t("screening.title")}</h1>
          <p className="mt-2 text-muted-foreground">
            {t("screening.subtitle")}
          </p>
        </div>

        <QuestionnaireForm />
      </main>

      <footer className="border-t bg-muted/50 px-4 py-6 text-center text-xs text-muted-foreground">
        {t("disclaimer.banner")}
      </footer>
    </div>
  );
}
