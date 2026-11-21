(function () {
  "use strict";

  // Chrome runs this as a service worker and needs settings.js imported;
  // Firefox loads it through "background.scripts" in the manifest.
  if (typeof importScripts === "function") importScripts("settings.js");

  const { extensionApi, loadSettings } = globalThis.AIBlocker;

  const ICON_SIZES = [16, 32, 48, 128];

  function iconPaths(state) {
    return Object.fromEntries(ICON_SIZES.map((size) => [size, `icon-${state}-${size}.png`]));
  }

  async function updateToolbarIcon() {
    const { enabled } = await loadSettings();
    const state = enabled ? "enabled" : "disabled";
    await extensionApi.action.setIcon({ path: iconPaths(state) });
  }

  function updateToolbarIconSafely() {
    updateToolbarIcon().catch((error) => console.warn("[AI Blocker] icon update failed:", error));
  }

  extensionApi.runtime.onInstalled.addListener(updateToolbarIconSafely);
  extensionApi.runtime.onStartup.addListener(updateToolbarIconSafely);
  extensionApi.storage.onChanged.addListener(updateToolbarIconSafely);
  updateToolbarIconSafely();
})();
