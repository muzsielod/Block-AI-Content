(function () {
  "use strict";

  const { loadSettings, saveSettings, parseDomainList, formatDomainList } = globalThis.AIBlocker;

  const hideFeaturesInput = document.getElementById("hideFeatures");
  const filterResultsInput = document.getElementById("filterResults");
  const blockedDomainsInput = document.getElementById("blockedDomains");
  const saveButton = document.getElementById("save");
  const statusLabel = document.getElementById("status");

  function showSettings(settings) {
    hideFeaturesInput.checked = settings.hideFeatures;
    filterResultsInput.checked = settings.filterResults;
    blockedDomainsInput.value = formatDomainList(settings.blockedDomains);
  }

  function readSettingsFromForm() {
    return {
      hideFeatures: hideFeaturesInput.checked,
      filterResults: filterResultsInput.checked,
      blockedDomains: parseDomainList(blockedDomainsInput.value),
    };
  }

  async function handleSave() {
    await saveSettings(readSettingsFromForm());
    statusLabel.textContent = "Saved. Reload the page.";
  }

  saveButton.addEventListener("click", handleSave);
  loadSettings().then(showSettings);
})();
