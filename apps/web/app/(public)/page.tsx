import { useTranslations } from "next-intl";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-xl font-bold text-brand-700">
            {t("common.appName")}
          </span>
          <nav className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {t("common.login")}
            </Link>
            <Link
              href="/screening"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t("landing.hero.cta")}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — gradient background */}
      <section className="bg-gradient-to-b from-brand-50 to-background px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t("landing.hero.title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("landing.hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <Link
              href="/screening"
              className="rounded-lg bg-brand-600 px-8 py-3.5 text-lg font-medium text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700 transition-all"
            >
              {t("landing.hero.cta")}
            </Link>
            <span className="text-sm text-muted-foreground">
              {t("landing.hero.ctaSub")}
            </span>
          </div>
        </div>
      </section>

      {/* How It Works — 3 steps with numbers */}
      <section className="px-4 py-20">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          {t("common.appName")} — How It Works
        </h2>
        <div className="mx-auto mt-12 grid max-w-5xl gap-10 md:grid-cols-3">
          <StepCard
            step="1"
            title={t("landing.features.screening.title")}
            description={t("landing.features.screening.description")}
          />
          <StepCard
            step="2"
            title={t("landing.features.insights.title")}
            description={t("landing.features.insights.description")}
          />
          <StepCard
            step="3"
            title={t("landing.features.practitioner.title")}
            description={t("landing.features.practitioner.description")}
          />
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y bg-muted/30 px-4 py-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 text-center md:flex-row md:justify-center md:gap-12">
          <Stat value="570M+" label="Person-times assessed in China" />
          <div className="hidden h-8 w-px bg-border md:block" />
          <Stat value="27" label="Clinically validated questions" />
          <div className="hidden h-8 w-px bg-border md:block" />
          <Stat value="9" label="Constitution types identified" />
        </div>
      </section>

      {/* Education — What is Constitution? */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            {t("landing.education.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
            {t("landing.education.subtitle")}
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {(["constitution", "classification", "differentiation", "biased"] as const).map(
              (key) => (
                <div
                  key={key}
                  className="rounded-xl border bg-card p-6"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-lg font-semibold">
                      {t(`landing.education.${key}.term`)}
                    </span>
                    <span className="text-sm text-brand-600">
                      {t(`landing.education.${key}.chinese`)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {t(`landing.education.${key}.definition`)}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 py-20">
        <h2 className="text-center text-3xl font-bold">
          {t("landing.pricing.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Free screening for everyone. Pay only when you want personalized guidance.
        </p>
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 md:grid-cols-3">
          {/* Starter Session */}
          <div className="flex flex-col rounded-2xl border bg-card p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t("landing.pricing.entry.title")}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{t("landing.pricing.entry.price")}</span>
                <span className="text-muted-foreground">{t("landing.pricing.entry.per")}</span>
              </div>
              <p className="mt-2 text-sm italic text-muted-foreground">
                {t("landing.pricing.entry.subtitle")}
              </p>
            </div>
            <ul className="mt-8 flex-1 space-y-4">
              {[0, 1, 2].map((i) => (
                <FeatureItem key={i} text={t(`landing.pricing.entry.features.${i}`)} />
              ))}
            </ul>
            <Link
              href="/screening"
              className="mt-8 block rounded-lg border-2 border-brand-600 py-3 text-center text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              Try a Session
            </Link>
          </div>

          {/* Core — highlighted */}
          <div className="relative flex flex-col rounded-2xl border-2 border-brand-500 bg-brand-50/50 p-8 shadow-xl shadow-brand-500/10">
            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white">
              {t("landing.pricing.core.badge")}
            </span>
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t("landing.pricing.core.title")}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{t("landing.pricing.core.price")}</span>
                <span className="text-muted-foreground">{t("landing.pricing.core.per")}</span>
              </div>
              <p className="mt-2 text-sm italic text-muted-foreground">
                {t("landing.pricing.core.subtitle")}
              </p>
            </div>
            <ul className="mt-8 flex-1 space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <FeatureItem key={i} text={t(`landing.pricing.core.features.${i}`)} />
              ))}
            </ul>
            <Link
              href="/screening"
              className="mt-8 block rounded-lg bg-brand-600 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700"
            >
              Get Started
            </Link>
          </div>

          {/* Premium */}
          <div className="flex flex-col rounded-2xl border bg-card p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold">{t("landing.pricing.premium.title")}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{t("landing.pricing.premium.price")}</span>
                <span className="text-muted-foreground">{t("landing.pricing.premium.per")}</span>
              </div>
              <p className="mt-2 text-sm italic text-muted-foreground">
                {t("landing.pricing.premium.subtitle")}
              </p>
            </div>
            <ul className="mt-8 flex-1 space-y-4">
              {[0, 1, 2, 3].map((i) => (
                <FeatureItem key={i} text={t(`landing.pricing.premium.features.${i}`)} />
              ))}
            </ul>
            <Link
              href="/screening"
              className="mt-8 block rounded-lg border-2 border-brand-600 py-3 text-center text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
            >
              Go Premium
            </Link>
          </div>
        </div>

        {/* Transformation — subtle bottom note */}
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          {t("landing.pricing.transformation.text")}{" "}
          {t("landing.pricing.transformation.link")}{" "}
          <a
            href="mailto:hello@qiorazen.com"
            className="font-medium text-brand-600 underline hover:text-brand-700"
          >
            {t("landing.pricing.transformation.contact")}
          </a>
        </p>
      </section>

      {/* Disclaimer Footer */}
      <footer className="mt-auto border-t bg-muted/50 px-4 py-6 text-center text-xs text-muted-foreground">
        {t("disclaimer.banner")}
      </footer>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
        {step}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-brand-700">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3 text-sm">
      <svg
        className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span>{text}</span>
    </li>
  );
}
