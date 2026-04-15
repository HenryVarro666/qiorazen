"use client";

import { useRouter } from "next/navigation";

export function LanguageSwitcher() {
  const router = useRouter();

  function switchLocale(locale: string) {
    document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => switchLocale("zh")}
        className="rounded px-2 py-1 hover:bg-accent"
      >
        中文
      </button>
      <span className="text-muted-foreground">/</span>
      <button
        onClick={() => switchLocale("en")}
        className="rounded px-2 py-1 hover:bg-accent"
      >
        EN
      </button>
    </div>
  );
}
