# Loci finds resources

An interactive prototype of phase **R1** of [`docs/superpowers/specs/2026-10-24-loci-suggests-resources-design.md`](../../docs/superpowers/specs/2026-10-24-loci-suggests-resources-design.md): the learner asks Loci in the chat for something to read or watch. Loci suggests real, checked resources, and **Save** files each one in Commonplace under the right type, shelf and topic. §14 of the design maps it onto `studiolo`'s code.

Published at https://claude.ai/artifact/QZxKcs1UCTUbiTqvcmu4pk. It is one self-contained `index.html`, with no build step.

**The data.**
- **The learner** is the architect from `studiolo`'s own sample library (`src/dev/library-sample.ts`). They already have Hassan Fathy's *Natural Energy and Vernacular Architecture*, unopened, and a note on Gulf humidity.
- **The suggested resources are real.** They were found and checked on 29 October 2026, and their links open the real pages.
- **Covers are drawn.** The app shows Open Library covers and YouTube thumbnails instead.
- **The search steps are simulated.** Their counts are illustrative.

## Try this

| Where | What it shows |
|---|---|
| **The suggestion under the box** | Loci looks in your Commonplace first. It says you already have Fathy's book and should start there, then names what your shelf is missing: evidence from humid climates and a recent review |
| **The "Looked at" steps** | Your Commonplace, what Loci knows about you here, Open Library, YouTube, the web, then the check: what opened, what you already have, what didn't open |
| **A card** | The kind and the catalogue it came from, the title (it links to the real page), level and access, Loci's **Why**, and a link to your open question *Does depth matter more than width?* |
| **Files to** | Where Save will put it, decided before you see the card: the two papers go to **PDFs** (your starter shelf), and the video goes to **Lectures**, because your last video in this area went there. Its topic is *Vernacular & regional*, a closer topic than Courtyards |
| **Why here?** | The rule in words: shelf, topic, kind, and any link to an Object you already have (the video and *Hassan Fathy* in People) |
| **Change a shelf** | Pick another collection, or **+ New collection…**. The card notes that the next items of that kind in this area will go there too, and other open cards of the same kind follow at once |
| **Save · Save all · Undo** | The card shows where it went, with **See it in Commonplace** and Undo; the toast has Undo too |
| **Dismiss ▾** | Dismiss, with an optional reason (*Too basic*, *Not my format*…). Loci won't suggest it again |
| **Find more like these** | Three more: a book (Paid · or a library), a preprint that argues the opposite of the Colima paper, and a paid review |
| **Commonplace** (top) | Saved items on the wall, outlined, in their collections, with **Suggested by Loci for Courtyards · 29 Oct**, their topic, *To read*, and links to a Person or a question. **To read** counts them |
| **Loci** (top) | A **+N** badge on each topic that received saves |
| **Journal** (panel tab) | Suggested, saved, dismissed and undone, as Courtyards' journal |
| **How filing works** | The rules on one sheet |

On a phone, the top switch shows **Loci chat**, **Loci** or **Commonplace**, one at a time.

## Resources used (real)

- *Evaluation of the thermal performance of traditional courtyard houses in a warm humid climate: Colima, Mexico*, Heritage Science (2022), https://link.springer.com/10.1186/s40494-022-00820-4
- Zhou, Antonini and Gaspari, *Impact of Courtyard Microclimate on Building Thermal Performance Under Hot Weather Conditions: A Review*, Energies 18(20), 5433 (2025), https://www.mdpi.com/1996-1073/18/20/5433
- *The People's Architect – Hassan Fathy*, YouTube, https://www.youtube.com/watch?v=R7vNy1jFyDk
- Edwards, Sibley, Hakmi and Land (eds), *Courtyard Housing: Past, Present and Future*, Taylor & Francis (2006)
- *A ventilated courtyard as a passive cooling strategy in the warm humid tropics*, Research Square preprint, https://www.researchsquare.com/article/rs-1742681/v1
- Zamani, Heidari and Hanachi, *Reviewing the thermal and microclimatic function of courtyards*, Renewable and Sustainable Energy Reviews 93 (2018), https://econpapers.repec.org/RePEc:eee:rensus:v:93:y:2018:i:c:p:580-595
- Already in the learner's Commonplace: Hassan Fathy, *Natural Energy and Vernacular Architecture* (1986)
