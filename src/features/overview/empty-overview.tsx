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
            Your local-first money journal is ready for your first entry.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">
            Add income or expenses to turn this overview into a monthly summary
            with savings, recent activity, and category spending.
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
          <h3 className="text-lg font-bold">Ready on this device</h3>
          <div className="mt-4 grid gap-3 text-sm text-[var(--muted)]">
            {[
              "Income and expense entry",
              "Searchable transaction history",
              "Edit and delete controls",
              "Local IndexedDB storage",
              "Responsive mobile and desktop layout",
            ].map((item) => (
              <p key={item} className="rounded-lg bg-[var(--surface-muted)] px-3 py-2">
                {item}
              </p>
            ))}
          </div>
        </article>

        <article className="flex min-h-full flex-col rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          <div className="p-5">
            <h3 className="text-lg font-bold">Quick start</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Save a salary, freelance payment, grocery bill, or any daily expense.
              The dashboard updates from local records after entries are saved.
            </p>
          </div>
          <div className="mt-auto grid gap-3 border-t border-[var(--border)] p-5 sm:grid-cols-2">
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
