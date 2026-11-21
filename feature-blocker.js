(function (root) {
  "use strict";

  const { hideElement, hostnameContainsAny } = root.AIBlocker;

  const HEADING_SELECTOR = "h1, h2, h3, [role='heading']";
  const CONTROL_SELECTOR =
    "a, button, [role='button'], [role='link'], [role='tab'], [role='menuitem'], [aria-label]";
  const RESULTS_COLUMN_IDS = ["rso", "center_col", "main", "search"];
  const MAX_ANCESTOR_STEPS = 5;
  const MAX_WRAPPER_STEPS = 2;

  function normalizeLabel(text) {
    return text.trim().toLowerCase();
  }

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

  // Includes wrappers that exist only to hold the control, so no empty gap is left behind.
  function findControlContainer(control) {
    let container = control;
    for (let step = 0; step < MAX_WRAPPER_STEPS; step++) {
      const parent = container.parentElement;
      const isSoleChild = parent && parent !== document.body && parent.children.length === 1;
      if (!isSoleChild) break;
      container = parent;
    }
    return container;
  }

  function labelsOfControl(control) {
    return [control.getAttribute("aria-label"), control.textContent]
      .filter(Boolean)
      .map(normalizeLabel);
  }

  function collectSelectorsForHost(selectorsByHost, hostname) {
    return Object.entries(selectorsByHost)
      .filter(([hostFragment]) => hostname.includes(hostFragment))
      .flatMap(([, selectors]) => selectors);
  }

  function createFeatureBlocker({ rules, hostname }) {
    const matchesHeadingHost = hostnameContainsAny(hostname, rules.headingHosts ?? []);
    const matchesControlHost = hostnameContainsAny(hostname, rules.controlHosts ?? []);
    const featureHeadings = (rules.headings ?? []).map(normalizeLabel);
    const controlLabels = (rules.controlLabels ?? []).map(normalizeLabel);
    const featureSelectors = collectSelectorsForHost(rules.selectors ?? {}, hostname);

    const isApplicable =
      matchesHeadingHost || matchesControlHost || featureSelectors.length > 0;

    function isFeatureHeading(element) {
      return featureHeadings.includes(normalizeLabel(element.textContent));
    }

    function isFeatureControl(element) {
      return labelsOfControl(element).some((label) => controlLabels.includes(label));
    }

    function hideFeaturesByHeading() {
      if (!matchesHeadingHost) return;
      document.querySelectorAll(HEADING_SELECTOR).forEach((heading) => {
        if (isFeatureHeading(heading)) hideElement(findFeatureContainer(heading));
      });
    }

    function hideControlsByLabel() {
      if (!matchesControlHost) return;
      document.querySelectorAll(CONTROL_SELECTOR).forEach((control) => {
        if (isFeatureControl(control)) hideElement(findControlContainer(control));
      });
    }

    function hideFeaturesBySelector() {
      featureSelectors.forEach((selector) => {
        document.querySelectorAll(selector).forEach(hideElement);
      });
    }

    function run() {
      hideFeaturesByHeading();
      hideControlsByLabel();
      hideFeaturesBySelector();
    }

    return { run, isApplicable };
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, { createFeatureBlocker });
})(globalThis);
