(function (root) {
  "use strict";

  function normalizeDomain(entry) {
    return entry
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
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

  function isSameOrSubdomain(hostname, domain) {
    return hostname === domain || hostname.endsWith("." + domain);
  }

  function isDomainBlocked(hostname, blockedDomains) {
    const lowerCaseHostname = hostname.toLowerCase();
    return blockedDomains.some((domain) => isSameOrSubdomain(lowerCaseHostname, domain));
  }

  function hostnameContainsAny(hostname, fragments) {
    return fragments.some((fragment) => hostname.includes(fragment));
  }

  root.AIBlocker = Object.assign(root.AIBlocker || {}, {
    normalizeDomains,
    parseDomainList,
    formatDomainList,
    isDomainBlocked,
    hostnameContainsAny,
  });
})(globalThis);
