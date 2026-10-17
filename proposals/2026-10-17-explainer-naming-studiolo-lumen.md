# Proposal: rename Explainers to Studiolo Lumen

Status: draft for the owner's decision · 17 Oct 2026

## 1. Summary

Rename the user-facing feature "Explainer" to **Studiolo Lumen**. The feature was inspired by another product called Explainer, so we need a name of our own. *Lumen* is Latin for light, as in "shed light on a topic". It sits well next to *Studiolo* (a Renaissance private study) and is short enough for buttons and labels.

Scope: **only the words users see change.** Code, database, environment switches and analytics keep `explainer` internally.

## 2. What is being renamed

A short, narrated, cited slide video of about 2–6 minutes, made from a topic, a library item or a copilot request. Explainers also make up the parts of a course. (Craft: *Explainers*, *Courses*; code: `src/features/explainers/`, `src/features/courses/`.)

## 3. Naming rules

| Use | Form | Example |
|---|---|---|
| Feature, in marketing and in public | **Studiolo Lumen** | "Turn any topic into a Studiolo Lumen." |
| Feature, inside the app | **Lumen** | "Lumens made for you" |
| One item | **a Lumen** | "Your Lumen on load paths is ready." |
| Plural | **Lumens** | "3 Lumens", "All 12 Lumens →" |
| Action (verb) | **Explain…**, unchanged | Explain… → "Making your Lumen…" |
| Course part | **Part N**, unchanged | "Part 2 of 6". A part *is* a Lumen, but the course UI doesn't need to say so. |

Decisions taken here (open to change):

- **Plural "Lumens", not "Lumina".** "Lumina" is the correct Latin plural and sounds more distinctive, but users would stumble on it and it reads as a separate brand. Choose one before any copy ships and never mix them.
- **Capitalised** ("a Lumen") because it is a product noun, not a common word.
- **Keep "Explain…" as the verb.** It says exactly what happens. Don't use "Lumen" as a verb ("Lumen this").
- **Always "Studiolo Lumen" in public**: the website, share pages, social cards and app store copy. On its own, "Lumen" is too widely used to own (see §6).

## 4. Copy changes, screen by screen

References are to `studiolo` @ `e71e7af` (read-only; nothing has been changed there). Below is a representative list, not every string. Roughly 45 UI files contain user-visible "explainer" text (`grep -rlE "[Ee]xplainers?" src --include=*.tsx`).

### Learn (`/learn`)
| Now | Proposed | Where |
|---|---|---|
| Explainers made for you | Lumens made for you | `src/app/(workspace)/learn/(list)/loading.tsx:7`, list page |
| Explainers you make from the graph, your library or the copilot appear here. | Lumens you make from the graph, your library or the copilot appear here. | `src/components/explainers/explainer-list.tsx:405` |
| Loading your explainers… | Loading your Lumens… | explainer list placeholder |
| "1 explainer" / "N explainers" | "1 Lumen" / "N Lumens" | list and graph counts |

The "Learn" destination name stays (`src/components/shell/destinations.ts:5`).

### Player
| Now | Proposed | Where |
|---|---|---|
| Explainer options | Lumen options | `src/features/explainers/player/player.tsx:965` |
| Delete this explainer for good? | Delete this Lumen for good? | `player.tsx:716` |
| This removes the explainer, its slides and its narration… | This removes the Lumen, its slides and its narration… | player |
| You have made as many explainers as you can for now. | You have made as many Lumens as you can for now. | `player.tsx:590` |
| This explainer couldn't finish / was stopped / was deleted / is no longer here | This Lumen couldn't finish / … | player states |
| Opening the explainer… · Playing the explainer | Opening the Lumen… · Playing the Lumen | player |

### Graph / Map
| Now | Proposed | Where |
|---|---|---|
| Explainers lane / card, "Close explainers" | Lumens lane / card, "Close Lumens" | `src/components/graph/explainers-card.tsx` |
| All N explainers → · ‹ Explainers | All N Lumens → · ‹ Lumens | `graph-workspace.tsx`, `graph-player.tsx` |
| No explainers on this topic yet. · Only its sub-topics have explainers so far. | No Lumens on this topic yet. · Only its sub-topics have Lumens so far. | `explainers-card.tsx:313` |
| Saved in this topic's explainers and in Learn | Saved in this topic's Lumens and in Learn | graph |

### Copilot
| Now | Proposed | Where |
|---|---|---|
| Short explainer · {place} (offer card) | Lumen · {place} | `src/components/copilot/explainer-offer-card.tsx:181`, `src/features/copilot/tools/explain.ts:11` |
| Writing the explainer… you can keep working. | Writing your Lumen… you can keep working. | `explainer-offer-card.tsx:200` |
| Planning an explainer… | Planning a Lumen… | `src/features/copilot/tools/explain.ts:30`, `memory-gateway.ts:120` |

**Copilot system prompt** (`src/features/copilot/prompt/system.ts:31,67–88`): the model says "explainer" to users because the prompt calls them that. Update the prompt so it calls the product a **Lumen** in what it writes to the learner. It should still recognise learners asking for "an explainer", "a walkthrough" or "a video" as a request for a Lumen. Re-run the copilot evals afterwards.

### Today, onboarding, background jobs
| Now | Proposed | Where |
|---|---|---|
| Your first explainer | Your first Lumen | `src/components/today/continue-card.tsx:73`, onboarding |
| …let's start with a short explainer of {topic} | …let's start with a short Lumen on {topic} | `src/components/onboarding/onboarding-workspace.tsx:412` |
| Explainers in the background (jobs card) | Lumens in the background | `src/components/explainers/jobs-card.tsx:269` |
| Two explainers are already being made… · Another explainer is still being made… | Two Lumens are already being made… · … | error copy |

### Sharing (public)
| Now | Proposed | Where |
|---|---|---|
| An explainer made with Studiolo (share page description, social card) | A Studiolo Lumen | `src/app/e/[code]/page.tsx:9` |
| Studiolo explainer (share page label) | Studiolo Lumen | share page |
| Anyone with the link can watch this explainer without signing in… | …watch this Lumen without signing in… | `src/components/explainers/share-dialog.tsx:13` |
| This explainer isn't shared any more | This Lumen isn't shared any more | `src/app/e/[code]/not-found.tsx` |

### Privacy and legal
- `src/app/privacy/page.tsx`: "…never sends Loops your notes, maps, files, explainers or sign-in codes" → "…files, Lumens or…". The wording changes; the meaning stays the same.

## 5. URLs

| URL | Proposal |
|---|---|
| `/e/[code]` (public share) | **Keep.** It's already neutral, and changing it would break links people have shared. |
| `/learn/explainers/[id]` (signed-in player) | **Change to `/learn/lumens/[id]`**, with a permanent redirect from the old path so saved links, including the test links in Craft docs, still work. |
| `/learn/series/[seriesId]/[part]` (courses) | Keep. |
| `/api/explainers/...` | Keep. Users never see it. |

If you don't want routing work right now, keeping `/learn/explainers/` is acceptable for testers. Change it before any public launch.

## 6. Trademark and conflict check (do before committing)

"Lumen" is widely used. Check these first:

| Name | What it is | Risk |
|---|---|---|
| **Lumen5** | An AI tool that turns articles and text into videos | **High.** Close to what this feature does. The main thing to check. |
| Lumen Learning | Open courseware and edtech | **Medium–high.** Same market (learning). |
| Lumen Technologies | A telecom company | Low (different market) |
| Unreal Engine Lumen | A lighting system in a 3D engine | Low |
| Laravel Lumen | A code framework | Low |

To do:
1. Search the trademark registries in your launch markets (USPTO, EUIPO, UAE) in the education and software classes (9, 41, 42) for "Lumen" and "Studiolo Lumen".
2. Search the app stores and domains for products called Lumen in learning or video.
3. If the risk is too high, fall back to "Studiolo Briefing" or "Studiolo Folio" (shortlisted earlier). The rules in §3 work the same way with either name.

Always pairing the name with *Studiolo* in public lowers the risk but doesn't remove it. This is not legal advice; for launch, have a trademark professional confirm.

## 7. What stays internal (no change)

- Environment switches: `EXPLAINER_ACCESS`, `EXPLAINER_TESTERS`, `EXPLAINER_COURSES`, `EXPLAINER_ITEM_GROUNDING` (`src/config/explainers.ts`)
- Database: `studiolo.explainers`, `explainer_views`, `explainer_series` (`drizzle/0023_explainer_series.sql`)
- Code: `src/features/explainers/`, `src/trigger/explainer-tasks.ts`, the `explainer_author` AI purpose (`src/features/ai/purposes.ts`)
- Analytics events: `explainer_started`, `explainer_finished` (`src/features/analytics/events.ts`). Renaming these would break the history in PostHog.
- Author and voice prompts (`src/features/explainers/contract/`, `speech/direction.ts`): the model never says the product name aloud (the contract already bans "In this explainer"), so they can keep the internal word.

Add one line to the project docs glossary: *"Lumen (user-facing) = explainer (internal)."* That way the code and Craft docs don't need rewording.

## 8. Rollout

1. **Decide:** name, plural, URL choice (§3, §5) and the trademark check (§6).
2. **One copy PR in `studiolo`** (written by whoever works on the main app, not from this repo): the copy changes in §4, the copilot prompt change, and the `/learn/lumens` route with a redirect.
3. **Check:** copilot evals; unit tests that check user-facing text will need updating (e.g. `tests/unit/copilot-course-tools.test.ts`, `tests/unit/explainer-share-menu.test.ts`); look at Learn, the Graph lane, the player, the share page and onboarding.
4. **Docs:** add the glossary line; rename the Craft *Explainers* doc title to "Lumens (explainers)" when convenient.

Rough effort: about a day for the copy and prompt, plus half a day for the redirect and tests. This is an estimate, not measured.

## 9. Open questions for the owner

1. "Lumens" or "Lumina"?
2. Should the copilot offer card say "Lumen · {topic}" or keep "Short" ("Short Lumen")?
3. Change `/learn/explainers` now, or at public launch?
4. Who runs the trademark check, and in which markets?

## Sources

- Craft, Studilo space: *Explainers*, *Courses*, *Copilot*, *Learn*, *Onboarding*, *the vision* (read 17 Oct 2026)
- `studiolo` @ `e71e7af`, read only: files cited inline above
