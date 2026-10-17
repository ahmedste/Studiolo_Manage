# Studiolo_Manage

The workspace for managing Studiolo: planning, notes, specs, trackers, scripts and anything else we produce while running the project.

## Sources and access rules

| Source | Location | Access | Purpose |
|---|---|---|---|
| **Studiolo_Manage** (this repo) | `github.com/ahmedste/Studiolo_Manage` | **Read + write** | The only place new work is written and committed. |
| **Studiolo** (main app) | `github.com/ahmedste/studiolo` | **Read-only** | Main application code and docs. Used as reference only. |
| **Craft: "Studilo" space** | Craft app, connected via the Craft connector | **Read** (writes only on explicit request) | Product, strategy, AI systems, engineering, brand, business and meeting notes. |

### Rules

1. **Write only here.** All new files, edits, commits and pushes go to `Studiolo_Manage`.
2. **Never modify `studiolo`.** Don't commit, push, open branches or PRs, comment, or change settings on the main app repo, even though the GitHub account has push rights there. Read and cite it only.
3. **Craft is a source, not a scratchpad.** Read the Studilo space freely. Create or edit Craft documents only when explicitly asked, and say which document changed.
4. **Cite where things came from.** When content here is based on `studiolo` or Craft, include a reference (file path + commit, or Craft document name/link).
5. **Proposed changes to the main app** go in this repo as a written proposal, patch or issue draft. They're never applied to `studiolo` directly.
6. **No secrets.** Don't copy credentials, API keys, `.env` values or tokens from any source into this repo.

## Craft space layout (for reference)

`00 Inbox` · `01 Vision & Strategy` · `02 Product` · `03 AI Systems` · `04 Engineering` · `05 Brand & Marketing` · `06 Business & Finance` · `07 Meetings & Reviews` · `TBS` · `99 Archive`
