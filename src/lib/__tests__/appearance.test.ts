import { beforeEach, describe, expect, it } from "vitest";
import {
  applyThemeMode,
  getAppliedColorTheme,
  getAppliedThemeMode,
  getColorThemeLabel,
  getPaletteAttribute,
} from "@/lib/utils/appearance";

describe("appearance utilities", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-palette");
    document.documentElement.className = "";
    document.documentElement.style.colorScheme = "";
    window.localStorage.clear();
  });

  it("maps the default color theme to the design preview green palette", () => {
    expect(getPaletteAttribute("green-blue")).toBe("green");
    expect(getColorThemeLabel("green-blue")).toBe("White, blue, and green");
  });

  it("maps the alternate color theme to the colorful palette", () => {
    expect(getPaletteAttribute("colorful")).toBe("colorful");
    expect(getColorThemeLabel("colorful")).toBe("Colorful");
  });

  it("reads the applied document theme before falling back to storage", () => {
    window.localStorage.setItem("trackpaisa-theme", "light");
    document.documentElement.dataset.theme = "dark";
    document.documentElement.dataset.palette = "colorful";

    expect(getAppliedThemeMode()).toBe("dark");
    expect(getAppliedColorTheme()).toBe("colorful");
  });

  it("updates the document color scheme with the theme", () => {
    applyThemeMode("dark");

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
});
