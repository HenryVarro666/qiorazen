import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Qiorazen</h1>
        <p className="mt-2 text-muted-foreground">
          Your wellness insights dashboard
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/screening"
          className="rounded-xl border bg-card p-6 transition-colors hover:border-brand-400"
        >
          <h3 className="font-semibold">Take Screening</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete the 27-question wellness assessment
          </p>
        </Link>

        <Link
          href="/dashboard/insights/new"
          className="rounded-xl border bg-card p-6 transition-colors hover:border-brand-400"
        >
          <h3 className="font-semibold">Ask Questions</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get personalized wellness guidance from our advisors
          </p>
        </Link>
      </div>
    </div>
  );
}
