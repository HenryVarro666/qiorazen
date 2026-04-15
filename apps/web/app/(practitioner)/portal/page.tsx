import Link from "next/link";

export default function PortalDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Advisor Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Review and approve AI-generated wellness insights
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <StatCard title="Pending Review" value="—" color="amber" />
        <StatCard title="Reviewed Today" value="—" color="green" />
        <StatCard title="Urgent (< 4h)" value="—" color="red" />
      </div>

      <Link
        href="/portal/cases"
        className="inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white hover:bg-brand-700"
      >
        View Case Queue
      </Link>

      <div className="rounded-lg border bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Reminder:</strong> All responses must use wellness language only.
        Never diagnose, prescribe, or make organ-level claims.
        Your notes will be reviewed by compliance guardrails before delivery.
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
