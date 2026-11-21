// Run with: node --test
const test = require("node:test");
const assert = require("node:assert");

require("./domains.js");
const { parseDomainList, isDomainBlocked, hostnameContainsAny } = globalThis.AIBlocker;

test("parseDomainList trims, lowercases and strips protocol and path", () => {
  const result = parseDomainList(" Example.com \nhttps://Foo.org/page\n\n");
  assert.deepStrictEqual(result, ["example.com", "foo.org"]);
});

test("isDomainBlocked matches the domain and its subdomains only", () => {
  const blocked = ["example.com"];
  assert.ok(isDomainBlocked("example.com", blocked));
  assert.ok(isDomainBlocked("news.example.com", blocked));
  assert.ok(!isDomainBlocked("notexample.com", blocked));
});

test("hostnameContainsAny finds a fragment in the hostname", () => {
  assert.ok(hostnameContainsAny("www.google.ro", ["google."]));
  assert.ok(!hostnameContainsAny("www.bing.com", ["google."]));
});
