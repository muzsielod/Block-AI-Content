(function (root) {
  "use strict";

  const NOTICE_STYLE = {
    position: "fixed",
    bottom: "12px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: "2147483647",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "#1B5E20",
    color: "#ffffff",
    font: "13px system-ui, sans-serif",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35)",
  };

  const BUTTON_STYLE = {
    border: "1px solid #ffffff",
    borderRadius: "999px",
    background: "transparent",
    color: "#ffffff",
    padding: "2px 10px",
    font: "inherit",
    cursor: "pointer",
  };

  function setTextIfChanged(element, text) {
    // Skipping identical text avoids triggering the page observer in a loop.
    if (element.textContent !== text) element.textContent = text;
  }

  function createHiddenResultsNotice({ onToggleReveal }) {
    let container = null;
    let label = null;
    let button = null;

    function build() {
      container = document.createElement("div");
      label = document.createElement("span");
      button = document.createElement("button");
      Object.assign(container.style, NOTICE_STYLE);
      Object.assign(button.style, BUTTON_STYLE);
      button.type = "button";
      button.addEventListener("click", onToggleReveal);
      container.append(label, button);
    }

    function attachIfNeeded() {
      if (!container.isConnected) (document.body ?? document.documentElement).append(container);
    }

    function remove() {
      if (container) container.remove();
      container = null;
    }

    function update({ count, isRevealed }) {
      if (count === 0) return remove();
      if (!container) build();
      attachIfNeeded();
      const noun = count === 1 ? "result" : "results";
      setTextIfChanged(label, `${count} ${noun} ${isRevealed ? "shown" : "hidden"} by AI Blocker`);
      setTextIfChanged(button, isRevealed ? "Hide again" : "Show anyway");
    }

    return { update };
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, { createHiddenResultsNotice });
})(globalThis);
