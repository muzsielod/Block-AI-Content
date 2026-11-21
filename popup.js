(function () {
  "use strict";

  const {
    extensionApi,
    loadSettings,
    saveSettings,
    sanitizeSettings,
    parseDomainList,
    formatDomainList,
    loadDefaultBlocklist,
  } = globalThis.AIBlocker;

  const byId = (id) => document.getElementById(id);
  const enabledInput = byId("enabled");
  const pauseHereInput = byId("pauseHere");
  const siteNameLabel = byId("siteName");
  const hideFeaturesInput = byId("hideFeatures");
  const filterResultsInput = byId("filterResults");
  const useDefaultBlocklistInput = byId("useDefaultBlocklist");
  const defaultCountLabel = byId("defaultCount");
  const blockedDomainsInput = byId("blockedDomains");
  const allowedDomainsInput = byId("allowedDomains");
  const backupInput = byId("backup");
  const statusLabel = byId("status");

  let pausedSites = [];
  let currentHostname = null;

  async function findActiveTab() {
    const [activeTab] = await extensionApi.tabs.query({ active: true, currentWindow: true });
    return activeTab;
  }

  function hostnameOfTab(tab) {
    try {
      const url = new URL(tab.url);
      return /^https?:$/.test(url.protocol) ? url.hostname : null;
    } catch {
      return null;
    }
  }

  function updatePausedSites(sites, hostname, shouldPause) {
    const otherSites = sites.filter((site) => site !== hostname);
    return shouldPause && hostname ? [...otherSites, hostname] : otherSites;
  }

  function showSettings(settings) {
    pausedSites = settings.pausedSites;
    enabledInput.checked = settings.enabled;
    hideFeaturesInput.checked = settings.hideFeatures;
    filterResultsInput.checked = settings.filterResults;
    useDefaultBlocklistInput.checked = settings.useDefaultBlocklist;
    blockedDomainsInput.value = formatDomainList(settings.blockedDomains);
    allowedDomainsInput.value = formatDomainList(settings.allowedDomains);
    pauseHereInput.checked = pausedSites.includes(currentHostname);
  }

  function showSiteControls(hostname) {
    currentHostname = hostname;
    pauseHereInput.disabled = !hostname;
    siteNameLabel.textContent = hostname ? `(${hostname})` : "(not available here)";
  }

  function readSettingsFromForm() {
    return {
      enabled: enabledInput.checked,
      hideFeatures: hideFeaturesInput.checked,
      filterResults: filterResultsInput.checked,
      useDefaultBlocklist: useDefaultBlocklistInput.checked,
      blockedDomains: parseDomainList(blockedDomainsInput.value),
      allowedDomains: parseDomainList(allowedDomainsInput.value),
      pausedSites: updatePausedSites(pausedSites, currentHostname, pauseHereInput.checked),
    };
  }

  async function reloadActiveTab() {
    const activeTab = await findActiveTab();
    if (activeTab) await extensionApi.tabs.reload(activeTab.id);
  }

  async function handleSave() {
    await saveSettings(readSettingsFromForm());
    await reloadActiveTab();
    statusLabel.textContent = "Saved and reloaded.";
  }

  function handleExport() {
    backupInput.value = JSON.stringify(sanitizeSettings(readSettingsFromForm()), null, 2);
    statusLabel.textContent = "Copy the text below to back it up.";
  }

  function handleImport() {
    try {
      showSettings(sanitizeSettings(JSON.parse(backupInput.value)));
      statusLabel.textContent = "Imported. Press Save to apply.";
    } catch {
      statusLabel.textContent = "That is not valid settings JSON.";
    }
  }

  async function start() {
    showSiteControls(hostnameOfTab(await findActiveTab() ?? {}));
    showSettings(await loadSettings());
    const blocklist = await loadDefaultBlocklist();
    defaultCountLabel.textContent = blocklist.domains.length;
  }

  byId("save").addEventListener("click", handleSave);
  byId("export").addEventListener("click", handleExport);
  byId("import").addEventListener("click", handleImport);
  start();
})();
