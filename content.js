(async function main() {
  "use strict";

  const {
    extensionApi,
    loadSettings,
    normalizeDomains,
    createDomainMatcher,
    loadDefaultBlocklist,
    createFeatureBlocker,
    createResultFilter,
  } = globalThis.AIBlocker;

  async function loadRules() {
    const response = await fetch(extensionApi.runtime.getURL("rules.json"));
    return response.json();
  }

  function isPausedOnSite(settings, hostname) {
    return createDomainMatcher(normalizeDomains(settings.pausedSites))(hostname);
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
      const allowedDomains = normalizeDomains(settings.allowedDomains);
      blockers.push(createResultFilter({ rules, hostname, blockedDomains, allowedDomains }));
    }
    return blockers.filter((blocker) => blocker.isApplicable);
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
    const hostname = location.hostname;
    const settings = await loadSettings();
    if (!settings.enabled || isPausedOnSite(settings, hostname)) return;

    const rules = await loadRules();
    const blockedDomains = await collectBlockedDomains(settings);
    const blockers = createBlockers({ settings, rules, hostname, blockedDomains });
    if (blockers.length === 0) return; // nothing to do here, so do not watch the page

    const applyBlockers = () => blockers.forEach((blocker) => blocker.run());
    applyBlockers();
    watchForPageChanges(runOncePerFrame(applyBlockers));
  } catch (error) {
    console.warn("[AI Blocker] failed to start:", error);
  }
})();
