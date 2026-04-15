import { useTranslations } from "next-intl";
import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 14, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Section number="1" title="Nature of Service">
            Qiorazen provides AI-assisted wellness and lifestyle guidance based on
            traditional health practices. It does not provide medical services.
          </Section>

          <Section number="2" title="No Medical Advice">
            The information provided is not intended to diagnose, treat, cure, or
            prevent any disease. You should consult a licensed healthcare provider
            for medical concerns.
          </Section>

          <Section number="3" title="User Responsibility">
            You agree that you are solely responsible for how you interpret and
            use the information provided. Any lifestyle or wellness suggestions are
            based on general traditional practices and may not be suitable for your
            specific situation.
          </Section>

          <Section number="4" title="No Doctor-Patient Relationship">
            Use of this platform does not establish a doctor-patient relationship.
            Wellness consultants on the platform provide insights based on traditional
            wellness concepts. They may not hold medical licenses in your jurisdiction
            and are not acting as licensed healthcare providers.
          </Section>

          <Section number="5" title="Emergency Disclaimer">
            Qiorazen is NOT an emergency service. If you are experiencing a medical
            emergency, call 911 (or your local emergency number) immediately.
          </Section>

          <Section number="6" title="Limitation of Liability">
            To the maximum extent permitted by law, the platform and its affiliates
            shall not be liable for any damages resulting from the use of this service.
            Maximum liability shall not exceed the amount paid for the specific service.
          </Section>

          <Section number="7" title="Indemnification">
            You agree to indemnify and hold harmless the platform from any claims
            arising from your use of the service.
          </Section>

          <Section number="8" title="Governing Law">
            These Terms shall be governed by the laws of the State of Delaware,
            United States.
          </Section>

          <Section number="9" title="Dispute Resolution">
            Any disputes shall be resolved through binding arbitration.
          </Section>

          <Section number="10" title="Modifications">
            We reserve the right to update these terms at any time. Continued use
            of the service constitutes acceptance of updated terms.
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
      <p className="mt-2">{children}</p>
    </div>
  );
}
