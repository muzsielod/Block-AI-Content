(function (root) {
  "use strict";

  const {
    hideElement,
    showElement,
    hostnameContainsAny,
    createDomainMatcher,
    createHiddenResultsNotice,
  } = root.AIBlocker;

  const EXTERNAL_LINK_SELECTOR = "a[href^='http']";

  function hostnameOfLink(link) {
    try {
      return new URL(link.href).hostname;
    } catch {
      return null;
    }
  }

  function createResultFilter({ rules, hostname, blockedDomains, allowedDomains = [] }) {
    const isSearchPage = hostnameContainsAny(hostname, rules.searchHosts ?? []);
    const isApplicable = isSearchPage && blockedDomains.length > 0;
    const isBlocked = createDomainMatcher(blockedDomains);
    const isAllowed = createDomainMatcher(allowedDomains);
    const hiddenResults = new Set();
    let isRevealed = false;

    const notice = createHiddenResultsNotice({ onToggleReveal: toggleReveal });

    function shouldHide(linkHostname) {
      return isBlocked(linkHostname) && !isAllowed(linkHostname);
    }

    function hideResultIfBlocked(link) {
      const linkHostname = hostnameOfLink(link);
      if (!linkHostname || !shouldHide(linkHostname)) return;
      const result = link.closest(rules.resultContainers);
      if (!result) return;
      hideElement(result);
      hiddenResults.add(result);
    }

    function forgetDetachedResults() {
      hiddenResults.forEach((result) => {
        if (!result.isConnected) hiddenResults.delete(result);
      });
    }

    function updateNotice() {
      notice.update({ count: hiddenResults.size, isRevealed });
    }

    function toggleReveal() {
      isRevealed = !isRevealed;
      hiddenResults.forEach(isRevealed ? showElement : hideElement);
      updateNotice();
    }

    function run() {
      if (!isApplicable) return;
      forgetDetachedResults();
      if (!isRevealed) {
        document.querySelectorAll(EXTERNAL_LINK_SELECTOR).forEach(hideResultIfBlocked);
      }
      updateNotice();
    }

    return { run, isApplicable };
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, { createResultFilter });
})(globalThis);
