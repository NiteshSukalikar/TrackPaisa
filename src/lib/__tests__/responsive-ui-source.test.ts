import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const globalsCss = readFileSync("src/app/globals.css", "utf8");
const appShell = readFileSync("src/components/layout/app-shell.tsx", "utf8");
const rootLayout = readFileSync("src/app/layout.tsx", "utf8");

describe("responsive UI source invariants", () => {
  it("keeps mobile browser text, tap, and control sizing safeguards", () => {
    expect(globalsCss).toContain("-webkit-text-size-adjust: 100%");
    expect(globalsCss).toContain("-webkit-tap-highlight-color: transparent");
    expect(globalsCss).toContain("min-width: 44px");
    expect(globalsCss).toContain("min-height: 44px");
    expect(globalsCss).toContain("accent-color: var(--primary)");
    expect(globalsCss).toContain("max-width: 100%");
    expect(globalsCss).not.toContain("input[type=\"date\"]");
    expect(globalsCss).not.toContain("input[type=\"month\"]");
  });

  it("keeps iOS PWA safe-area spacing in shell and viewport metadata", () => {
    expect(rootLayout).toContain('viewportFit: "cover"');
    expect(appShell).toContain("env(safe-area-inset-bottom)");
    expect(appShell).toContain("Mobile navigation");
  });

  it("keeps theme bootstrap in place before client hydration", () => {
    expect(rootLayout).toContain("trackpaisa-theme");
    expect(rootLayout).toContain("trackpaisa-color-theme");
    expect(rootLayout).toContain("document.documentElement.dataset.theme");
    expect(rootLayout).toContain("document.documentElement.style.colorScheme");
  });

  it("uses semantic status tokens instead of fixed light-only alert colors", () => {
    expect(globalsCss).toContain("--danger-bg");
    expect(globalsCss).toContain("--success-bg");
    expect(globalsCss).not.toContain("bg-red-50");
    expect(globalsCss).not.toContain("bg-green-50");
  });
});
