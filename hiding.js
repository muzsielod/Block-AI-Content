(function (root) {
  "use strict";

  const HIDDEN_MARKER = "aiBlocked";

  function isAlreadyHidden(element) {
    return element.dataset[HIDDEN_MARKER] === "true";
  }

  function hideElement(element) {
    if (!element || isAlreadyHidden(element)) return;
    element.dataset[HIDDEN_MARKER] = "true";
    element.style.setProperty("display", "none", "important");
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, { hideElement });
})(globalThis);
