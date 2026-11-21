(function (root) {
  "use strict";

  const HIDDEN_MARKER = "aiBlocked";
  const originalDisplayByElement = new WeakMap();

  function isAlreadyHidden(element) {
    return element.dataset[HIDDEN_MARKER] === "true";
  }

  function hideElement(element) {
    if (!element || isAlreadyHidden(element)) return;
    originalDisplayByElement.set(element, element.style.getPropertyValue("display"));
    element.dataset[HIDDEN_MARKER] = "true";
    element.style.setProperty("display", "none", "important");
  }

  function showElement(element) {
    if (!element || !isAlreadyHidden(element)) return;
    delete element.dataset[HIDDEN_MARKER];
    const originalDisplay = originalDisplayByElement.get(element);
    if (originalDisplay) {
      element.style.setProperty("display", originalDisplay);
    } else {
      element.style.removeProperty("display");
    }
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, { hideElement, showElement });
})(globalThis);
