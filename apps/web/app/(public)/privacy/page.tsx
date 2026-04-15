import { useTranslations } from "next-intl";
import Link from "next/link";

export default function PrivacyPage() {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <Link href="/" className="text-xl font-bold text-brand-700">
            {t("appName")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 14, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Section number="1" title="Information We Collect">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Account information (email, display name)</li>
              <li>Wellness screening questionnaire responses</li>
              <li>Constitution assessment results</li>
              <li>Questions submitted for wellness guidance</li>
              <li>Tongue images (if voluntarily uploaded)</li>
              <li>Usage data (pages visited, features used)</li>
            </ul>
          </Section>

          <Section number="2" title="How We Use Your Data">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>To provide personalized wellness insights</li>
              <li>To facilitate wellness advisor review</li>
              <li>To improve our services (anonymized data only)</li>
              <li>We NEVER sell personal data to third parties</li>
            </ul>
          </Section>

          <Section number="3" title="Data Storage & Security">
            All data is stored on U.S.-based servers, encrypted at rest and in transit
            (TLS 1.2+). Access is restricted to authorized personnel only.
          </Section>

          <Section number="4" title="Tongue Images">
            Tongue images are stored in encrypted private storage, accessible only to
            your assigned wellness advisor. They are auto-deleted after 90 days
            (user configurable) and are never shared externally or used for facial
            recognition.
          </Section>

          <Section number="5" title="Your Rights">
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li><strong>Access:</strong> Request a copy of all your data</li>
              <li><strong>Deletion:</strong> Request complete deletion of your account and data</li>
              <li><strong>Opt-out:</strong> Withdraw consent for data processing at any time</li>
              <li><strong>Contact:</strong> hello@qiorazen.com</li>
            </ul>
          </Section>

          <Section number="6" title="Not HIPAA Covered">
            Qiorazen is a wellness platform, not a healthcare provider. We implement
            strong security practices but do not claim HIPAA compliance.
          </Section>

          <Section number="7" title="Breach Notification">
            In the event of unauthorized access to health-related data, we will
            notify affected users within 60 days per the FTC Health Breach Notification Rule.
          </Section>

          <Section number="8" title="California Residents (CCPA)">
            California residents have additional rights including the right to know,
            delete, and opt-out. We do not sell personal data.
          </Section>

          <Section number="9" title="Changes">
            We may update this policy periodically. Material changes will be notified
            via email or platform notice.
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-base font-semibold text-foreground">
        {number}. {title}
      </h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
