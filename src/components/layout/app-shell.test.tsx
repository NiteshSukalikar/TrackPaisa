import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "@/components/layout/app-shell";

vi.mock("next/image", () => ({
  default: ({
    alt,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt ?? ""} {...props} />
  ),
}));

describe("AppShell responsive layout contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.palette = "green";
  });

  it("renders stable desktop and mobile navigation with theme controls", () => {
    render(
      <AppShell activePath="/transactions" phaseLabel="QA" title="Transactions">
        <p>Screen content</p>
      </AppShell>,
    );

    expect(screen.getByRole("navigation", { name: "Primary navigation" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Transactions" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "List" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Switch to dark mode" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to colorful theme" })).toBeInTheDocument();
  });
});
