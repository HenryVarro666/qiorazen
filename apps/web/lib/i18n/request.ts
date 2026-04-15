import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";

const locales = ["en", "zh"] as const;
type Locale = (typeof locales)[number];

function isValidLocale(locale: string): locale is Locale {
  return (locales as readonly string[]).includes(locale);
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();

  let locale: Locale = "zh";

  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const acceptLanguage = headerStore.get("accept-language") ?? "";
    if (acceptLanguage.startsWith("en")) {
      locale = "en";
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
