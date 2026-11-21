# AI Blocker

A browser extension that works like an ad blocker, but for AI: it hides AI features on pages and removes unwanted sites from search results.

## Features (v0.1)
- Hides AI feature blocks by heading text (e.g. Google AI Overviews) and by CSS selectors listed in `rules.json`.
- Filters search results (Google, Bing, DuckDuckGo, Brave) pointing at domains you list in the popup.
- Rules live in `rules.json` so they can be updated and shared like ad-blocker filter lists.

## Limitations
- Site markup changes often, so selectors and heading rules need community upkeep.
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
| `hiding.js` | Hide an element (one place for the hiding technique) |
| `feature-blocker.js` | Hide AI feature blocks using `rules.json` |
| `result-filter.js` | Remove blocked sites from search results |
| `content.js` | Wire everything together and watch page changes |
| `popup.html` / `popup.js` | Settings UI |

Run the tests with `node --test`.

## Contributing
Add or fix rules in `rules.json` and open a pull request.

## Roadmap
- Image provenance checks (C2PA / IPTC metadata)
- Optional "likely AI" labels
- Importable shared filter lists

## License
MIT
