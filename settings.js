(function (root) {
  "use strict";

  const extensionApi = typeof browser !== "undefined" ? browser : chrome;

  const DEFAULT_SETTINGS = Object.freeze({
    hideFeatures: true,
    filterResults: true,
    blockedDomains: [],
  });

  async function loadSettings() {
    const storedSettings = await extensionApi.storage.sync.get(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS, ...storedSettings };
  }

  async function saveSettings(settings) {
    await extensionApi.storage.sync.set(settings);
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, {
    extensionApi,
    loadSettings,
    saveSettings,
  });
})(globalThis);
