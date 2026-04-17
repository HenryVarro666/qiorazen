"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import Link from "next/link";

interface CaseSummary {
  id: string;
  status: string;
  tier: string;
  response_deadline: string | null;
}

export default function PortalDashboard() {
  const locale = useLocale() as "en" | "zh";
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/practitioner/cases");
        if (res.ok) {
          const data = await res.json();
          setCases(data.cases ?? []);
        }
      } catch {
        // continue
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const pendingCount = cases.length;
  const urgentCount = cases.filter((c) => {
    if (!c.response_deadline) return false;
    const hoursLeft = (new Date(c.response_deadline).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft < 4;
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          {locale === "zh" ? "顾问工作台" : "Advisor Dashboard"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {locale === "zh" ? "审核 AI 生成的养生建议" : "Review and approve AI-generated wellness insights"}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard
          title={locale === "zh" ? "待审核" : "Pending Review"}
          value={loading ? "..." : String(pendingCount)}
          color="amber"
        />
        <StatCard
          title={locale === "zh" ? "紧急 (< 4h)" : "Urgent (< 4h)"}
          value={loading ? "..." : String(urgentCount)}
          color={urgentCount > 0 ? "red" : "green"}
        />
        <StatCard
          title={locale === "zh" ? "全部案例" : "Total Cases"}
          value={loading ? "..." : String(cases.length)}
          color="green"
        />
      </div>

      <Link
        href="/portal/cases"
        className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
      >
        {locale === "zh" ? "查看案例队列" : "View Case Queue"}
      </Link>

      <div className="rounded-lg border bg-amber-50 p-4 text-sm text-amber-800">
        <strong>{locale === "zh" ? "提醒：" : "Reminder:"}</strong>{" "}
        {locale === "zh"
          ? "所有回复必须使用养生语言。不得诊断、开处方或做器官层面的判断。您的备注将经过合规审查后才会发送给用户。"
          : "All responses must use wellness language only. Never diagnose, prescribe, or make organ-level claims. Your notes will be reviewed by compliance guardrails before delivery."}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: "amber" | "green" | "red";
}) {
  const colorClasses = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    green: "border-brand-200 bg-brand-50 text-brand-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };

  return (
    <div className={`rounded-xl border p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
