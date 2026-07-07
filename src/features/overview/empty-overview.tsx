import { ArrowDownLeft, ArrowUpRight, Database, ShieldCheck } from "lucide-react";
import { defaultCategories } from "@/lib/constants/default-categories";
import { formatInr } from "@/lib/utils/currency";

const stats = [
  { label: "Income", value: formatInr(0), detail: "Add salary or freelance income", icon: ArrowUpRight },
  { label: "Expense", value: formatInr(0), detail: "Track spending by category", icon: ArrowDownLeft },
  { label: "Net savings", value: formatInr(0), detail: "Calculated from local records", icon: ShieldCheck },
  { label: "Categories", value: String(defaultCategories.length), detail: "Seeded for Phase 1", icon: Database },
];

export function EmptyOverview() {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">Track every rupee, without the clutter.</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
            Your local-first money journal is ready for the first transaction flow.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Phase 0 establishes the responsive shell, brand system, theme handling,
            data model, and tests. Phase 1 can now build add, edit, delete, and
            persistence workflows on top of a stable base.
          </p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <p className="text-sm font-bold text-[var(--text)]">Privacy baseline</p>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--muted)]">
            <li>No required login.</li>
            <li>No backend database.</li>
            <li>IndexedDB reserved for app data.</li>
            <li>localStorage limited to UI preferences.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Empty dashboard summary">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-[var(--muted)]">{stat.label}</span>
              <stat.icon aria-hidden="true" size={20} className="text-[var(--accent)]" />
            </div>
            <p className="mt-4 text-2xl font-bold">{stat.value}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{stat.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-lg font-bold">Foundation checklist</h3>
          <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
            {[
              "Next.js App Router with TypeScript",
              "Tailwind design tokens for light and dark mode",
              "Responsive desktop sidebar and mobile bottom navigation",
              "Typed local-first data models and default categories",
              "Vitest coverage for calculations, validation, and settings",
            ].map((item) => (
              <p key={item} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2">
                {item}
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-lg font-bold">Next build target</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            The first Phase 1 slice should add income and expense entry with
            amount, type, category, wallet, date, note, validation, and IndexedDB
            persistence.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <a
              href="/transactions/new?type=income"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white"
            >
              Add income
            </a>
            <a
              href="/transactions/new?type=expense"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-sm font-bold text-[var(--text)]"
            >
              Add expense
            </a>
          </div>
        </article>
      </section>
    </div>
  );
}
