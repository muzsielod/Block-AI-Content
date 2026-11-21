(async function main() {
  "use strict";

  const {
    extensionApi,
    loadSettings,
    normalizeDomains,
    loadDefaultBlocklist,
    createFeatureBlocker,
    createResultFilter,
  } = globalThis.AIBlocker;

  async function loadRules() {
    const response = await fetch(extensionApi.runtime.getURL("rules.json"));
    return response.json();
  }

  async function collectBlockedDomains(settings) {
    const ownDomains = normalizeDomains(settings.blockedDomains);
    if (!settings.useDefaultBlocklist) return ownDomains;
    const defaultBlocklist = await loadDefaultBlocklist();
    return [...defaultBlocklist.domains, ...ownDomains];
  }

  function createBlockers({ settings, rules, hostname, blockedDomains }) {
    const blockers = [];
    if (settings.hideFeatures) {
      blockers.push(createFeatureBlocker({ rules, hostname }));
    }
    if (settings.filterResults) {
      blockers.push(createResultFilter({ rules, hostname, blockedDomains }));
    }
    return blockers;
  }

  function runOncePerFrame(task) {
    let isScheduled = false;
    return () => {
      if (isScheduled) return;
      isScheduled = true;
      requestAnimationFrame(() => {
        isScheduled = false;
        task();
      });
    };
  }

  function watchForPageChanges(onChange) {
    new MutationObserver(onChange).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  try {
    const [settings, rules] = await Promise.all([loadSettings(), loadRules()]);
    const blockedDomains = await collectBlockedDomains(settings);
    const hostname = location.hostname;
    const blockers = createBlockers({ settings, rules, hostname, blockedDomains });
    const applyBlockers = () => blockers.forEach((blocker) => blocker.run());

    applyBlockers();
    watchForPageChanges(runOncePerFrame(applyBlockers));
  } catch (error) {
    console.warn("[AI Blocker] failed to start:", error);
  }
})();
