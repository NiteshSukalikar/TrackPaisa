import { describe, expect, it } from "vitest";
import { getColorThemeLabel, getPaletteAttribute } from "@/lib/utils/appearance";

describe("appearance utilities", () => {
  it("maps the default color theme to the design preview green palette", () => {
    expect(getPaletteAttribute("green-blue")).toBe("green");
    expect(getColorThemeLabel("green-blue")).toBe("White, blue, and green");
  });

  it("maps the alternate color theme to the colorful palette", () => {
    expect(getPaletteAttribute("colorful")).toBe("colorful");
    expect(getColorThemeLabel("colorful")).toBe("Colorful");
  });
});
