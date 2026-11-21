// Run with: node --test
const test = require("node:test");
const assert = require("node:assert");

require("./settings.js");
const { sanitizeSettings } = globalThis.AIBlocker;

test("sanitizeSettings fills defaults for missing or empty input", () => {
  const result = sanitizeSettings(null);
  assert.strictEqual(result.enabled, true);
  assert.deepStrictEqual(result.blockedDomains, []);
});

test("sanitizeSettings keeps valid values and drops wrong types and unknown keys", () => {
  const result = sanitizeSettings({
    enabled: false,
    hideFeatures: "yes",
    blockedDomains: ["a.com", 5],
    allowedDomains: ["b.com"],
    evil: "x",
  });
  assert.strictEqual(result.enabled, false);
  assert.strictEqual(result.hideFeatures, true);
  assert.deepStrictEqual(result.blockedDomains, []);
  assert.deepStrictEqual(result.allowedDomains, ["b.com"]);
  assert.ok(!("evil" in result));
});
