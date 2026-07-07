export type ThemeMode = "light" | "dark";
export type ColorTheme = "green-blue" | "colorful";

export const themeStorageKey = "trackpaisa-theme";
export const colorThemeStorageKey = "trackpaisa-color-theme";
export const appearanceChangeEvent = "trackpaisa-appearance-change";

export function getPaletteAttribute(colorTheme: ColorTheme) {
  return colorTheme === "colorful" ? "colorful" : "green";
}

export function getColorThemeLabel(colorTheme: ColorTheme) {
  return colorTheme === "colorful" ? "Colorful" : "White, blue, and green";
}

export function applyThemeMode(theme: ThemeMode) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function applyColorTheme(colorTheme: ColorTheme) {
  document.documentElement.dataset.palette = getPaletteAttribute(colorTheme);
}

export function getStoredThemeMode(): ThemeMode {
  return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
}

export function getStoredColorTheme(): ColorTheme {
  return window.localStorage.getItem(colorThemeStorageKey) === "colorful"
    ? "colorful"
    : "green-blue";
}

export function saveThemeMode(theme: ThemeMode) {
  window.localStorage.setItem(themeStorageKey, theme);
  applyThemeMode(theme);
  window.dispatchEvent(new Event(appearanceChangeEvent));
}

export function saveColorTheme(colorTheme: ColorTheme) {
  window.localStorage.setItem(colorThemeStorageKey, colorTheme);
  applyColorTheme(colorTheme);
  window.dispatchEvent(new Event(appearanceChangeEvent));
}
