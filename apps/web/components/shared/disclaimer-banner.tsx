"use client";

import { useTranslations } from "next-intl";

export function DisclaimerBanner() {
  const t = useTranslations("disclaimer");

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
      {t("banner")}
    </div>
  );
}

export function DisclaimerFooter() {
  const t = useTranslations("disclaimer");

  return (
    <p className="text-center text-xs text-muted-foreground">
      {t("footer")}
    </p>
  );
}
