(function () {
  "use strict";

  const {
    extensionApi,
    loadSettings,
    saveSettings,
    parseDomainList,
    formatDomainList,
    loadDefaultBlocklist,
  } = globalThis.AIBlocker;

  const enabledInput = document.getElementById("enabled");
  const hideFeaturesInput = document.getElementById("hideFeatures");
  const filterResultsInput = document.getElementById("filterResults");
  const useDefaultBlocklistInput = document.getElementById("useDefaultBlocklist");
  const defaultCountLabel = document.getElementById("defaultCount");
  const blockedDomainsInput = document.getElementById("blockedDomains");
  const saveButton = document.getElementById("save");
  const statusLabel = document.getElementById("status");

  function showSettings(settings) {
    enabledInput.checked = settings.enabled;
    hideFeaturesInput.checked = settings.hideFeatures;
    filterResultsInput.checked = settings.filterResults;
    useDefaultBlocklistInput.checked = settings.useDefaultBlocklist;
    blockedDomainsInput.value = formatDomainList(settings.blockedDomains);
  }

  function showDefaultBlocklistSize(blocklist) {
    defaultCountLabel.textContent = blocklist.domains.length;
  }

  function readSettingsFromForm() {
    return {
      enabled: enabledInput.checked,
      hideFeatures: hideFeaturesInput.checked,
      filterResults: filterResultsInput.checked,
      useDefaultBlocklist: useDefaultBlocklistInput.checked,
      blockedDomains: parseDomainList(blockedDomainsInput.value),
    };
  }

  async function reloadActiveTab() {
    const [activeTab] = await extensionApi.tabs.query({ active: true, currentWindow: true });
    if (activeTab) await extensionApi.tabs.reload(activeTab.id);
  }

  async function handleSave() {
    await saveSettings(readSettingsFromForm());
    await reloadActiveTab();
    statusLabel.textContent = "Saved and reloaded.";
  }

  saveButton.addEventListener("click", handleSave);
  loadSettings().then(showSettings);
  loadDefaultBlocklist().then(showDefaultBlocklistSize);
})();
