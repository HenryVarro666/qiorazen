"use client";

import { createClient } from "@/lib/supabase/client";
import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type AuthMethod = "oauth" | "email" | "phone";
type PhoneStep = "input" | "verify";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale() as "en" | "zh";
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [method, setMethod] = useState<AuthMethod>("oauth");
  const [error, setError] = useState("");

  // Email state
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Phone state
  const [phone, setPhone] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("input");
  const [otpCode, setOtpCode] = useState("");
  const [phoneSending, setPhoneSending] = useState(false);

  const isLogin = mode === "login";
  const callbackUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`;

  async function handleOAuth(provider: "google" | "apple") {
    setError("");
    try {
      const supabase = createClient();
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl },
      });
    } catch {
      setError(locale === "zh" ? "登录失败，请稍后重试" : "Login failed. Please try again.");
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl },
      });
      if (error) {
        setError(error.message);
      } else {
        setEmailSent(true);
      }
    } catch (err: any) {
      setError(err?.message ?? (locale === "zh" ? "发送失败，请稍后重试" : "Failed to send. Please try again."));
    }
  }

  async function handlePhoneSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPhoneSending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) {
        setError(error.message);
      } else {
        setPhoneStep("verify");
      }
    } catch (err: any) {
      setError(err?.message ?? (locale === "zh" ? "发送失败" : "Failed to send"));
    } finally {
      setPhoneSending(false);
    }
  }

  async function handlePhoneVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otpCode,
        type: "sms",
      });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = redirectTo;
      }
    } catch (err: any) {
      setError(err?.message ?? (locale === "zh" ? "验证失败" : "Verification failed"));
    }
  }

  // Email sent confirmation
  if (emailSent) {
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
            onClick={() => { setEmailSent(false); setEmail(""); setMethod("oauth"); }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            {locale === "zh" ? "返回登录" : "Back to login"}
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

          {/* Apple login — requires Apple Developer Program ($99/yr)
          <button
            onClick={() => handleOAuth("apple")}
            className="flex w-full items-center justify-center gap-3 rounded-lg border bg-black px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-900"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {locale === "zh" ? "使用 Apple 继续" : "Continue with Apple"}
          </button>
          */}
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {locale === "zh" ? "或" : "or"}
            </span>
          </div>
        </div>

        {/* Phone login — hidden until Twilio 10DLC registration is approved
        <div className="flex rounded-lg border p-1">
          <button
            onClick={() => { setMethod("phone"); setError(""); }}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              method === "phone" ? "bg-brand-50 text-brand-700" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "zh" ? "手机号" : "Phone"}
          </button>
          <button
            onClick={() => { setMethod("email"); setError(""); }}
            className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
              method === "email" ? "bg-brand-50 text-brand-700" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {locale === "zh" ? "邮箱" : "Email"}
          </button>
        </div>
        */}

        {/* Error */}
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Phone auth — hidden until Twilio 10DLC approved */}

        {/* Email auth */}
        {(
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder={locale === "zh" ? "输入邮箱地址" : "Enter your email"}
            />
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
        )}

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
