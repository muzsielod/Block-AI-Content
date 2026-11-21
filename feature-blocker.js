(function (root) {
  "use strict";

  const { hideElement, hostnameContainsAny } = root.AIBlocker;

  const HEADING_SELECTOR = "h1, h2, h3, [role='heading']";
  const RESULTS_COLUMN_IDS = ["rso", "center_col", "main", "search"];
  const MAX_ANCESTOR_STEPS = 5;

  function isResultsColumn(element) {
    return element === document.body || RESULTS_COLUMN_IDS.includes(element.id);
  }

  // Climbs from a heading to the block that wraps the whole AI feature,
  // stopping before the page-level results column.
  function findFeatureContainer(heading) {
    let container = heading;
    for (let step = 0; step < MAX_ANCESTOR_STEPS && container.parentElement; step++) {
      if (isResultsColumn(container.parentElement)) break;
      container = container.parentElement;
    }
    return container;
  }

  function collectSelectorsForHost(selectorsByHost, hostname) {
    return Object.entries(selectorsByHost)
      .filter(([hostFragment]) => hostname.includes(hostFragment))
      .flatMap(([, selectors]) => selectors);
  }

  function createFeatureBlocker({ rules, hostname }) {
    const matchesHeadingHost = hostnameContainsAny(hostname, rules.headingHosts ?? []);
    const featureHeadings = (rules.headings ?? []).map((text) => text.toLowerCase());
    const featureSelectors = collectSelectorsForHost(rules.selectors ?? {}, hostname);

    function isFeatureHeading(element) {
      return featureHeadings.includes(element.textContent.trim().toLowerCase());
    }

    function hideFeaturesByHeading() {
      if (!matchesHeadingHost) return;
      document
        .querySelectorAll(HEADING_SELECTOR)
        .forEach((heading) => {
          if (isFeatureHeading(heading)) hideElement(findFeatureContainer(heading));
        });
    }

    function hideFeaturesBySelector() {
      featureSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach(hideElement);
      });
    }

    function run() {
      hideFeaturesByHeading();
      hideFeaturesBySelector();
    }

    return { run };
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, { createFeatureBlocker });
})(globalThis);
