(async function main() {
  "use strict";

  const {
    extensionApi,
    loadSettings,
    normalizeDomains,
    createFeatureBlocker,
    createResultFilter,
  } = globalThis.AIBlocker;

  async function loadRules() {
    const response = await fetch(extensionApi.runtime.getURL("rules.json"));
    return response.json();
  }

  function createBlockers({ settings, rules, hostname }) {
    const blockers = [];
    if (settings.hideFeatures) {
      blockers.push(createFeatureBlocker({ rules, hostname }));
    }
    if (settings.filterResults) {
      const blockedDomains = normalizeDomains(settings.blockedDomains);
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
    const blockers = createBlockers({ settings, rules, hostname: location.hostname });
    const applyBlockers = () => blockers.forEach((blocker) => blocker.run());

    applyBlockers();
    watchForPageChanges(runOncePerFrame(applyBlockers));
  } catch (error) {
    console.warn("[AI Blocker] failed to start:", error);
  }
})();
