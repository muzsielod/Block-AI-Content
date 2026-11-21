(function (root) {
  "use strict";

  const UBLACKLIST_WHOLE_DOMAIN = /^\*:\/\/\*\.([^/]+)\/\*$/;

  // Accepts "example.com", pasted URLs, and uBlacklist whole-domain patterns.
  // uBlacklist patterns limited to a path are dropped, because blocking the
  // whole domain would hide far more than the pattern intended.
  function normalizeDomain(entry) {
    const text = entry.trim().toLowerCase();
    if (text.startsWith("#")) return "";
    if (text.startsWith("*://")) {
      const match = text.match(UBLACKLIST_WHOLE_DOMAIN);
      return match ? match[1] : "";
    }
    return text
      .replace(/^https?:\/\//, "")
      .replace(/^\*\./, "")
      .replace(/\/.*$/, "");
  }

  function normalizeDomains(entries) {
    return entries.map(normalizeDomain).filter(Boolean);
  }

  function parseDomainList(text) {
    return normalizeDomains(text.split("\n"));
  }

  function formatDomainList(domains) {
    return domains.join("\n");
  }

  // "news.example.com" yields "news.example.com" and "example.com", never the bare "com".
  function hostnameAndParentDomains(hostname) {
    const labels = hostname.toLowerCase().split(".");
    const candidateCount = Math.max(labels.length - 1, 1);
    return Array.from({ length: candidateCount }, (_, index) => labels.slice(index).join("."));
  }

  // Set lookup keeps matching fast even with a list of over a thousand domains.
  function createDomainMatcher(domains) {
    const blockedDomains = new Set(domains);
    return (hostname) =>
      hostnameAndParentDomains(hostname).some((domain) => blockedDomains.has(domain));
  }

  function hostnameContainsAny(hostname, fragments) {
    return fragments.some((fragment) => hostname.includes(fragment));
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, {
    normalizeDomains,
    parseDomainList,
    formatDomainList,
    createDomainMatcher,
    hostnameContainsAny,
  });
})(globalThis);
