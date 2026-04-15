import Link from "next/link";

export default function CasesPage() {
  // In production, this fetches from /api/practitioner/cases with SLA sorting
  const mockCases = [
    {
      id: "demo-1",
      tier: "premium",
      primaryConstitution: "Qi Deficiency",
      questionPreview: "I've been feeling tired after moving to a cold climate...",
      deadline: "12h remaining",
      urgency: "green",
    },
    {
      id: "demo-2",
      tier: "core",
      primaryConstitution: "Damp-Heat",
      questionPreview: "My skin has been breaking out more than usual...",
      deadline: "36h remaining",
      urgency: "green",
    },
  ] as { id: string; tier: string; primaryConstitution: string; questionPreview: string; deadline: string; urgency: string }[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Case Queue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sorted by: deadline urgency → tier priority → submission time
        </p>
      </div>

      <div className="space-y-3">
        {mockCases.map((c) => (
          <Link
            key={c.id}
            href={`/portal/cases/${c.id}`}
            className="flex items-center justify-between rounded-xl border bg-card p-5 transition-colors hover:border-brand-400"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{c.primaryConstitution}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  c.tier === "premium"
                    ? "bg-purple-100 text-purple-700"
                    : c.tier === "core"
                    ? "bg-brand-100 text-brand-700"
                    : "bg-muted text-muted-foreground"
                }`}>
                  {c.tier}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{c.questionPreview}</p>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium ${
                c.urgency === "red" ? "text-red-600" :
                c.urgency === "yellow" ? "text-amber-600" :
                "text-brand-600"
              }`}>
                {c.deadline}
              </span>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        In production, cases are fetched from the database with real SLA tracking.
      </p>
    </div>
  );
}
