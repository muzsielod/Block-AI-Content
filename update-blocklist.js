// Regenerates default-blocklist.json from the Huge AI Blocklist (CC0-1.0).
// Usage: node update-blocklist.js   (needs Node 18+)
//
// Only whole-domain entries are kept. Entries limited to a path
// (e.g. apple.com/apple-intelligence/) are skipped on purpose,
// because blocking the whole domain would hide far more than intended.
// A short list of major sites is also never allowed into the result,
// as a safety net against a mistaken or malicious upstream change.
const fs = require("node:fs");

const SOURCE_URL =
  "https://raw.githubusercontent.com/laylavish/uBlockOrigin-HUGE-AI-Blocklist/main/list_uBlacklist.txt";
const SOURCE_PAGE = "https://github.com/laylavish/uBlockOrigin-HUGE-AI-Blocklist";
const OUTPUT_FILE = "default-blocklist.json";
const WHOLE_DOMAIN_PATTERN = /^\*:\/\/\*\.([^/]+)\/\*$/;
const PROTECTED_DOMAINS = new Set([
  "google.com", "youtube.com", "wikipedia.org", "github.com", "microsoft.com", "apple.com",
  "amazon.com", "reddit.com", "facebook.com", "bing.com", "duckduckgo.com", "stackoverflow.com",
]);

function extractWholeDomains(listText) {
  const domains = listText
    .split("\n")
    .map((line) => line.trim().match(WHOLE_DOMAIN_PATTERN))
    .filter(Boolean)
    .map((match) => match[1].toLowerCase())
    .filter((domain) => !PROTECTED_DOMAINS.has(domain));
  return [...new Set(domains)].sort();
}

function buildBlocklist(domains) {
  return {
    name: "Huge AI Blocklist (whole-domain entries)",
    source: SOURCE_PAGE,
    license: "CC0-1.0",
    retrieved: new Date().toISOString().slice(0, 10),
    domains,
  };
}

function readExistingDomains() {
  try {
    return JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8")).domains;
  } catch {
    return [];
  }
}

function sameDomains(first, second) {
  return first.length === second.length && first.every((domain, index) => domain === second[index]);
}

async function main() {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) throw new Error(`Download failed: HTTP ${response.status}`);
  const domains = extractWholeDomains(await response.text());
  if (sameDomains(domains, readExistingDomains())) {
    console.log("No changes in the source list.");
    return;
  }
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(buildBlocklist(domains), null, 2) + "\n");
  console.log(`Wrote ${domains.length} domains to ${OUTPUT_FILE}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { extractWholeDomains };
