# Craft validation (17 Oct 2026)

The Craft "Studilo" feature docs were checked against `ahmedste/studiolo` @ `ad38415` (main) and its `project-docs/`. Every Craft doc listed below now ends with a **"How it works (verified against code)"** section. That section contains the validation list (✅ confirmed / ⚠️ wrong or outdated / ❓ not verifiable), Mermaid diagrams, key code paths and connected docs. Parts that are designed but not built are drawn with dashed lines. Every diagram was syntax-checked with mermaid-cli before it was written to Craft.

The hub doc is **System Map (verified)** in Craft → 04 Engineering. It was created new for this check.

| Report | Craft docs | Diagrams | ✅ / ⚠️ / ❓ |
|---|---|---|---|
| [library.md](library.md) | Library · Library - polishment Phase · Sources pulling | 6 | 27 / 2 / 3 (+9 polish notes still open) |
| [graph.md](graph.md) | Graph · Graph actions | 6 | 14 / 0 / 2 |
| [copilot-and-learner-context.md](copilot-and-learner-context.md) | Copilot · Learner context & Memory · AI BRain | 7 | 19 / 1 / 5 |
| [explainers-and-courses.md](explainers-and-courses.md) | Explainers · Learn · Courses · Course engine (long-term) | 11 | 44 / 7 / 3 |
| [today-and-onboarding.md](today-and-onboarding.md) | Today · Settings & Onboarding · Features & Ideas (stage callout only) | 7 | 17 / 2 / 1 |
| [engineering-and-system-map.md](engineering-and-system-map.md) | Stack & Architecture · Runbooks · AI Lab & Test Results · neon - database prompt · **System Map (verified)** (new) | 9 | 28 / 7 / 7 |

## Edits made in place in Craft (before/after text is in each report)
- **Courses:** "3–6 parts" was corrected. Item courses have 3–6 parts, topic courses follow the map (up to 24 parts) and copilot plans have 4–12.
- **Runbooks:** `trigger.dev@4.6.3` had been auto-linked as an email address and was reformatted as code.
- Everything else was appended. No existing text was deleted.

## Not verifiable from main
- The branches `copilot-graph-actions`, `learner-context-design` and `phase-2i-reader-fixes` are not on the remote; only `main` is there.
- Hosting settings that live outside the repo: the Trigger.dev region, the Vercel region and ElevenLabs keys on the worker.
