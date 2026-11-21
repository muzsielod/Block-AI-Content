// Run with: node --test
const test = require("node:test");
const assert = require("node:assert");

require("./domains.js");
const { parseDomainList, createDomainMatcher, hostnameContainsAny } = globalThis.AIBlocker;

test("parseDomainList trims, lowercases and strips protocol and path", () => {
  const result = parseDomainList(" Example.com \nhttps://Foo.org/page\n\n");
  assert.deepStrictEqual(result, ["example.com", "foo.org"]);
});

test("domain matcher matches the domain and its subdomains only", () => {
  const isBlocked = createDomainMatcher(["example.com"]);
  assert.ok(isBlocked("example.com"));
  assert.ok(isBlocked("news.example.com"));
  assert.ok(isBlocked("NEWS.Example.com"));
  assert.ok(!isBlocked("notexample.com"));
  assert.ok(!isBlocked("example.com.evil.org"));
});

test("domain matcher never matches on a bare top-level domain", () => {
  const isBlocked = createDomainMatcher(["com"]);
  assert.ok(!isBlocked("example.com"));
});

test("hostnameContainsAny finds a fragment in the hostname", () => {
  assert.ok(hostnameContainsAny("www.google.ro", ["google."]));
  assert.ok(!hostnameContainsAny("www.bing.com", ["google."]));
});
