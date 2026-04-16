"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AuthNav() {
  const locale = useLocale() as "en" | "zh";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
    });
  }, []);

  if (isLoggedIn) {
    return (
      <Link
        href="/dashboard"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {locale === "zh" ? "我的面板" : "Dashboard"}
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="text-sm text-muted-foreground hover:text-foreground"
    >
      {locale === "zh" ? "登录" : "Log In"}
    </Link>
  );
}
