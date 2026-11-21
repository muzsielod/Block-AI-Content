(function (root) {
  "use strict";

  const { extensionApi } = root.AIBlocker;

  async function loadDefaultBlocklist() {
    const response = await fetch(extensionApi.runtime.getURL("default-blocklist.json"));
    return response.json();
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, { loadDefaultBlocklist });
})(globalThis);
