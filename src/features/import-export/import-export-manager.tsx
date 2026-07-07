"use client";

import { CheckCircle2, Download, FileJson, ShieldCheck, Upload, XCircle } from "lucide-react";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  exportBackup,
  importBackup,
  previewBackupImport,
} from "@/lib/db/repositories/backup-repository";
import { seedDefaultCategories } from "@/lib/db/repositories/categories-repository";
import type { BackupPreview, ImportMode, TrackPaisaBackup } from "@/lib/utils/backup";
import { parseBackupJson } from "@/lib/utils/backup";

export function ImportExportManager() {
  const [backup, setBackup] = useState<TrackPaisaBackup | null>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const duplicateCount = useMemo(() => {
    if (!preview) {
      return 0;
    }

    return (
      preview.duplicateCategoryIds.length +
      preview.duplicateBudgetLimitIds.length +
      preview.duplicateRecurringTemplateIds.length +
      preview.duplicateTransactionIds.length +
      preview.duplicateWalletIds.length
    );
  }, [preview]);

  useEffect(() => {
    void seedDefaultCategories();
  }, []);

  async function downloadBackup() {
    setIsBusy(true);
    setMessage("");
    setError("");

    try {
      const nextBackup = await exportBackup();
      const blob = new Blob([JSON.stringify(nextBackup, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `trackpaisa-backup-${nextBackup.exportedAt.slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Backup exported.");
    } catch {
      setError("Backup could not be exported from this device.");
    } finally {
      setIsBusy(false);
    }
  }

  async function readImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsBusy(true);
    setMessage("");
    setError("");
    setBackup(null);
    setPreview(null);

    try {
      const parsedBackup = parseBackupJson(await file.text());
      const nextPreview = await previewBackupImport(parsedBackup);

      setBackup(parsedBackup);
      setPreview(nextPreview);
      setMessage("Backup preview is ready.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Backup file could not be read.");
    } finally {
      setIsBusy(false);
      event.target.value = "";
    }
  }

  async function runImport(mode: ImportMode) {
    if (!backup) {
      return;
    }

    if (mode === "replace") {
      const confirmed = window.confirm(
        "Replace all saved TrackPaisa data with this backup? A safety backup will be saved first.",
      );

      if (!confirmed) {
        return;
      }
    }

    setIsBusy(true);
    setMessage("");
    setError("");

    try {
      const result = await importBackup(backup, mode);

      setMessage(
        `Import complete. Saved ${result.transactions} transactions, ${result.categories} categories, ${result.wallets} wallets, ${result.budgetLimits} budgets, and ${result.recurringTemplates} templates.`,
      );
      setBackup(null);
      setPreview(null);
    } catch {
      setError("Backup could not be imported. Your existing data was left unchanged.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold text-[var(--primary)]">Data portability</p>
          <h2 className="mt-2 text-2xl font-bold">Back up and restore</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            Export a full JSON backup or restore one from another device. Imports validate the file and save a safety backup first.
          </p>
        </div>
      </div>

      {error ? (
        <div role="alert" className="flex gap-2 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger)]">
          <XCircle aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      ) : null}

      {message ? (
        <div
          role="status"
          className="flex gap-2 rounded-lg border border-[var(--success-border)] bg-[var(--success-bg)] p-4 text-sm font-semibold text-[var(--success)]"
        >
          <CheckCircle2 aria-hidden="true" size={18} className="mt-0.5 shrink-0" />
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[var(--primary)]">Export</p>
              <h3 className="mt-2 text-xl font-bold">Full JSON backup</h3>
            </div>
            <Download aria-hidden="true" size={21} className="text-[var(--muted)]" />
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Includes transactions, categories, wallets, settings, app version, and export date.
          </p>
          <button
            type="button"
            onClick={downloadBackup}
            disabled={isBusy}
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:opacity-60"
          >
            <FileJson aria-hidden="true" size={18} />
            {isBusy ? "Working..." : "Export JSON"}
          </button>
        </article>

        <article className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-[var(--primary)]">Import</p>
              <h3 className="mt-2 text-xl font-bold">Restore from backup</h3>
            </div>
            <Upload aria-hidden="true" size={21} className="text-[var(--muted)]" />
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Choose a TrackPaisa JSON file to preview records and duplicate IDs before importing.
          </p>
          <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-bold">
            <Upload aria-hidden="true" size={18} />
            Select backup file
            <input
              type="file"
              accept="application/json,.json"
              onChange={readImportFile}
              disabled={isBusy}
              className="sr-only"
            />
          </label>
        </article>
      </section>

      {preview ? (
        <section className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
            <div>
              <p className="text-sm font-bold text-[var(--primary)]">Import preview</p>
              <h3 className="mt-2 text-xl font-bold">
                Backup from {formatBackupDate(preview.backup.exportedAt)}
              </h3>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--muted)]">
              <ShieldCheck aria-hidden="true" size={17} />
              Safety backup before import
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <PreviewStat label="Transactions" value={preview.summary.transactions} />
            <PreviewStat label="Categories" value={preview.summary.categories} />
            <PreviewStat label="Wallets" value={preview.summary.wallets} />
            <PreviewStat label="Budgets" value={preview.summary.budgetLimits} />
            <PreviewStat label="Templates" value={preview.summary.recurringTemplates} />
            <PreviewStat label="Duplicate IDs" value={duplicateCount} />
          </div>

          {preview.invalidReasons.length > 0 ? (
            <div role="alert" className="mt-5 rounded-lg border border-[var(--danger-border)] bg-[var(--danger-bg)] p-4 text-sm text-[var(--danger)]">
              {preview.invalidReasons.join(" ")}
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runImport("skip")}
                disabled={isBusy}
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-bold text-white disabled:opacity-60"
              >
                Import new only
              </button>
              <button
                type="button"
                onClick={() => runImport("overwrite")}
                disabled={isBusy}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-sm font-bold disabled:opacity-60"
              >
                Overwrite duplicates
              </button>
              <button
                type="button"
                onClick={() => runImport("replace")}
                disabled={isBusy}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--danger-border)] px-4 text-sm font-bold text-[var(--danger)] disabled:opacity-60"
              >
                Replace all data
              </button>
            </div>
          )}
        </section>
      ) : null}
    </section>
  );
}

function PreviewStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-4">
      <p className="text-sm font-bold text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value.toLocaleString("en-IN")}</p>
    </div>
  );
}

function formatBackupDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
