"use client";

import { createClient } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale() as "en" | "zh";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setSent(true);
      }
    } catch {
      setError(locale === "zh" ? "发送失败，请稍后重试" : "Failed to send. Please try again.");
    }
  }

  async function handleOAuth(provider: "google" | "apple" | "github") {
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
    } catch {
      setError(locale === "zh" ? "登录失败，请稍后重试" : "Login failed. Please try again.");
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 text-center">
          <Link href="/" className="text-2xl font-bold text-brand-700">
            {t("common.appName")}
          </Link>
          <div className="rounded-xl border bg-brand-50 p-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100">
              <svg className="h-6 w-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">
              {locale === "zh" ? "查看您的邮箱" : "Check Your Email"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {locale === "zh"
                ? `我们已向 ${email} 发送了登录链接。点击链接即可登录。`
                : `We sent a login link to ${email}. Click the link to sign in.`}
            </p>
          </div>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {locale === "zh" ? "使用其他邮箱" : "Use a different email"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold text-brand-700">
            {t("common.appName")}
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("common.tagline")}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-lg bg-muted p-1">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              isLogin ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "zh" ? "登录" : "Log In"}
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              !isLogin ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "zh" ? "注册" : "Sign Up"}
          </button>
        </div>

        {/* OAuth buttons */}
        <div className="space-y-3">
          <button
            onClick={() => handleOAuth("google")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {locale === "zh" ? "使用 Google 继续" : "Continue with Google"}
          </button>

          <button
            onClick={() => handleOAuth("apple")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {locale === "zh" ? "使用 Apple 继续" : "Continue with Apple"}
          </button>

          <button
            onClick={() => handleOAuth("github")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {locale === "zh" ? "使用 GitHub 继续" : "Continue with GitHub"}
          </button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {locale === "zh" ? "或使用邮箱" : "or continue with email"}
            </span>
          </div>
        </div>

        {/* Email form */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={locale === "zh" ? "输入邮箱地址" : "Enter your email"}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {locale === "zh"
              ? (isLogin ? "发送登录链接" : "发送注册链接")
              : (isLogin ? "Send Login Link" : "Send Sign Up Link")}
          </button>

          <p className="text-center text-xs text-muted-foreground">
            {locale === "zh"
              ? "我们将发送一个安全链接到您的邮箱，无需密码。"
              : "We'll send a secure link to your email. No password needed."}
          </p>
        </form>

        {/* Terms notice */}
        <p className="text-center text-xs text-muted-foreground">
          {locale === "zh" ? (
            <>
              继续即表示您同意我们的{" "}
              <Link href="/terms" className="underline hover:text-foreground">服务条款</Link>
              {" "}和{" "}
              <Link href="/privacy" className="underline hover:text-foreground">隐私政策</Link>
            </>
          ) : (
            <>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
