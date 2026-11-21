(function (root) {
  "use strict";

  const extensionApi =
    typeof browser !== "undefined" ? browser : typeof chrome !== "undefined" ? chrome : undefined;

  const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    hideFeatures: true,
    filterResults: true,
    useDefaultBlocklist: true,
    blockedDomains: [],
    allowedDomains: [],
    pausedSites: [],
  });

  function isValidSetting(key, value) {
    const defaultValue = DEFAULT_SETTINGS[key];
    if (Array.isArray(defaultValue)) {
      return Array.isArray(value) && value.every((item) => typeof item === "string");
    }
    return typeof value === typeof defaultValue;
  }

  // Keeps only known settings with the right type, so imported data cannot inject anything else.
  function sanitizeSettings(rawSettings) {
    const source = rawSettings && typeof rawSettings === "object" ? rawSettings : {};
    return Object.fromEntries(
      Object.entries(DEFAULT_SETTINGS).map(([key, defaultValue]) => {
        const value = isValidSetting(key, source[key]) ? source[key] : defaultValue;
        return [key, Array.isArray(value) ? [...value] : value];
      })
    );
  }

  async function loadSettings() {
    const storedSettings = await extensionApi.storage.sync.get(DEFAULT_SETTINGS);
    return sanitizeSettings({ ...DEFAULT_SETTINGS, ...storedSettings });
  }

  async function saveSettings(settings) {
    await extensionApi.storage.sync.set(sanitizeSettings(settings));
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, {
    extensionApi,
    sanitizeSettings,
    loadSettings,
    saveSettings,
  });
})(globalThis);
