(function (root) {
  "use strict";

  const { hideElement, hostnameContainsAny, createDomainMatcher } = root.AIBlocker;

  const EXTERNAL_LINK_SELECTOR = "a[href^='http']";

  function hostnameOfLink(link) {
    try {
      return new URL(link.href).hostname;
    } catch {
      return null;
    }
  }

  function createResultFilter({ rules, hostname, blockedDomains }) {
    const isSearchPage = hostnameContainsAny(hostname, rules.searchHosts ?? []);
    const isActive = isSearchPage && blockedDomains.length > 0;
    const isBlocked = createDomainMatcher(blockedDomains);

    function hideResultIfBlocked(link) {
      const linkHostname = hostnameOfLink(link);
      if (linkHostname && isBlocked(linkHostname)) {
        hideElement(link.closest(rules.resultContainers));
      }
    }

    function run() {
      if (!isActive) return;
      document.querySelectorAll(EXTERNAL_LINK_SELECTOR).forEach(hideResultIfBlocked);
    }

    return { run };
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, { createResultFilter });
})(globalThis);
