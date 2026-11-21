(function () {
  "use strict";

  const { loadSettings, saveSettings, parseDomainList, formatDomainList, loadDefaultBlocklist } =
    globalThis.AIBlocker;

  const hideFeaturesInput = document.getElementById("hideFeatures");
  const filterResultsInput = document.getElementById("filterResults");
  const useDefaultBlocklistInput = document.getElementById("useDefaultBlocklist");
  const defaultCountLabel = document.getElementById("defaultCount");
  const blockedDomainsInput = document.getElementById("blockedDomains");
  const saveButton = document.getElementById("save");
  const statusLabel = document.getElementById("status");

  function showSettings(settings) {
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
      hideFeatures: hideFeaturesInput.checked,
      filterResults: filterResultsInput.checked,
      useDefaultBlocklist: useDefaultBlocklistInput.checked,
      blockedDomains: parseDomainList(blockedDomainsInput.value),
    };
  }

  async function handleSave() {
    await saveSettings(readSettingsFromForm());
    statusLabel.textContent = "Saved. Reload the page.";
  }

  saveButton.addEventListener("click", handleSave);
  loadSettings().then(showSettings);
  loadDefaultBlocklist().then(showDefaultBlocklistSize);
})();
