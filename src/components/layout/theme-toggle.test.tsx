import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "@/components/layout/theme-toggle";

describe("ThemeToggle", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-palette");
    document.documentElement.className = "";
    document.documentElement.style.colorScheme = "";
  });

  it("uses the applied root theme as the source of truth", async () => {
    window.localStorage.setItem("trackpaisa-theme", "light");
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.palette = "green";

    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Switch to light mode" })).toBeInTheDocument();
    });
  });

  it("toggles light/dark and green/colorful palettes", async () => {
    document.documentElement.dataset.theme = "light";
    document.documentElement.dataset.palette = "green";

    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("trackpaisa-theme")).toBe("dark");

    fireEvent.click(screen.getByRole("button", { name: "Switch to colorful theme" }));
    expect(document.documentElement.dataset.palette).toBe("colorful");
    expect(window.localStorage.getItem("trackpaisa-color-theme")).toBe("colorful");
  });
});
