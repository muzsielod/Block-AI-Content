// Run with: node --test
const test = require("node:test");
const assert = require("node:assert");

const { extractWholeDomains } = require("./update-blocklist.js");

test("extractWholeDomains keeps whole-domain entries, sorted and unique", () => {
  const list = "# note\n*://*.b.ai/*\n*://*.a.com/*\n*://*.a.com/*";
  assert.deepStrictEqual(extractWholeDomains(list), ["a.com", "b.ai"]);
});

test("extractWholeDomains skips path-limited entries", () => {
  assert.deepStrictEqual(extractWholeDomains("*://*.apple.com/apple-intelligence/*"), []);
});

test("extractWholeDomains never lets protected major sites through", () => {
  assert.deepStrictEqual(extractWholeDomains("*://*.wikipedia.org/*\n*://*.x.ai/*"), ["x.ai"]);
});
