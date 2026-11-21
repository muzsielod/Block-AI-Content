# AI Blocker

A browser extension that works like an ad blocker, but for AI: it hides AI features on pages and removes unwanted sites from search results.

## Features (v0.1)
- Hides AI feature blocks by heading text (e.g. Google AI Overviews), AI buttons and tabs by their label (e.g. the Google "AI Mode" tab and button), and anything matched by CSS selectors listed in `rules.json`.
- Filters search results (Google, Bing, DuckDuckGo, Brave) pointing at blocked domains. A built-in list of AI-focused and AI-generated-content sites is on by default (switch it off in the popup), and you can add your own.
- Rules live in `rules.json` so they can be updated and shared like ad-blocker filter lists.

- Shows a small "N results hidden" notice on search pages with a "Show anyway" button.
- Allowlist to override any blocklist entry, and a per-site pause switch.
- Backup: export and import your settings as JSON. You can also paste uBlacklist whole-domain patterns into the blocked list.
- Save reloads the current tab. The toolbar icon is a dark green "A" when enabled and gray when disabled.

## Limitations
- Site markup changes often, so selectors and heading rules need community upkeep.
- Label rules match the exact text, so they depend on the page language. Add translations of a label to `controlLabels` in `rules.json`.
- It does not try to detect AI-written text or images by content, because such detectors are unreliable.
- It runs on all pages (`<all_urls>`) so it can apply rules anywhere. It collects and sends no data.

## Install (development)
- **Chrome/Edge:** open `chrome://extensions`, enable Developer mode, choose "Load unpacked", select this folder.
- **Firefox:** open `about:debugging`, "This Firefox", "Load Temporary Add-on", select `manifest.json`.

## Project structure
Each file has one job and shares code through the `AIBlocker` namespace (content scripts cannot use ES modules).

| File | Responsibility |
| --- | --- |
| `settings.js` | Load and save user settings |
| `domains.js` | Parse and match domain lists |
| `blocklist.js` | Load the built-in blocklist |
| `update-blocklist.js` | Regenerate `default-blocklist.json` from the source list |
| `hiding.js` | Hide and restore an element (one place for the hiding technique) |
| `notice.js` | The "N results hidden" notice |
| `feature-blocker.js` | Hide AI feature blocks using `rules.json` |
| `result-filter.js` | Remove blocked sites from search results |
| `content.js` | Wire everything together and watch page changes |
| `popup.html` / `popup.js` | Settings UI (Save also reloads the current tab) |
| `background.js` | Switch the toolbar icon between enabled (dark green) and disabled (gray) |
| `make-icons.py` | Generate the `icon-*.png` files (needs Pillow) |

Run the tests with `node --test`.

## Automation
- `.github/workflows/test.yml` runs the tests on every push.
- `.github/workflows/update-blocklist.yml` checks the source list every Monday and opens a pull request when it changed. In the repository settings under Actions, General, enable "Allow GitHub Actions to create and approve pull requests" for this to work. Always review the pull request before merging.

## Built-in blocklist
`default-blocklist.json` holds whole-domain entries taken from the [Huge AI Blocklist](https://github.com/laylavish/uBlockOrigin-HUGE-AI-Blocklist) by laylavish, released under CC0 1.0 (public domain). Entries limited to a single path are left out so that large sites are not blocked entirely. The list is a community judgement, so check an entry before assuming it is wrong or right, and remove the built-in list in the popup if you prefer your own.

Refresh it with `node update-blocklist.js`. A short list of major sites (such as wikipedia.org) is never allowed into the result, as a safety net.

## Contributing
Add or fix rules in `rules.json` and open a pull request.

## Roadmap
- Image provenance checks (C2PA / IPTC metadata)
- Optional "likely AI" labels
- Importable shared filter lists

## License
MIT
