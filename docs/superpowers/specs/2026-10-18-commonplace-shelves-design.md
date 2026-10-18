# Commonplace: the Library as shelves

Status: first draft for the owner · 18 Oct 2026 · nothing built.

Mockup: the "Studiolo Commonplace" design canvas (desktop and phone artboards, light and dark via the Theme tweak): https://claude.ai/artifact/EkCnrVDC7M1hR6CuftP5V8 (private until shared).

Sources: `studiolo` @ `7150fad` (read-only): `project-docs/product/library.md` (types, collections, Library areas), `project-docs/design/interface.md` (tokens, type scale, Collections page), `src/styles/tokens.css` (light and dark values). Craft: *Library - polishment Phase* ("collections are data types rather than folders", "collections need a cover or nice colour, similar to how mymind groups stuff").

## 1. The idea

A commonplace book is where you copy what is worth keeping. **Commonplace** is a view of the Library that shows everything you keep standing on shelves, the way a study looks:

- each **type** (Sources, Notes, Photos, Objects) is a **bay**;
- each **collection** is a **shelf** in its type's bay;
- items **without a collection** sit on a dashed "Not on a shelf" table at the end;
- what you are reading, watching or writing now sits **on the desk** at the top.

It adds no new data. It is another way to look at the records the Library already has, and it fits the owner's rule that collections are types of information, not folders: a shelf can only sit in the bay of its own type.

## 2. How the data maps

| Library today (as built) | On the shelves |
|---|---|
| Type: Notes, Sources, Photos, Objects | Bay, in that fixed order |
| Collection (one type, a name, a description, a cover, a position) | Shelf, in the collection's position within its bay |
| Collection accent tone | The small swatch beside the shelf name |
| Item in at most one collection | Stands on exactly one shelf, or on the loose table |
| Source reading state To read / Reading / Read; video position | Reading items and resumable videos go on the desk; a video's resume point is the bar under its thumbnail |
| Library area (`?area=`) | Applies as it does on the other walls: shelves show only the area's items, and empty shelves hide |
| Move to… | "Shelve…" on a loose item; dragging onto a shelf is a later step |

## 3. What each item looks like on a shelf

Each type keeps a recognisable shape so a shelf reads at a glance, built only from existing tokens:

- **Books** stand as spines (title in Newsreader, author in small caps), with width and height varied a little so a shelf looks like a shelf. The newest or chosen one is face-out (its cover). A book with an ISBN cover or a chosen photo could use it on the face-out copy.
- **Videos** stand as thumbnails with the duration badge and the resume bar.
- **PDFs** stand as pale binders with a "PDF" label and the page count.
- **Quotes** are index cards on the warm quote paper (`--quote-paper`), italic; **Notes** are plain cards. The last card leans.
- **Photos** are framed prints on the grid-paper placeholder until the real image loads.
- **Objects**: a Person-base shelf shows portraits (the name set large when there is no photo); a Thing-base shelf shows picture cards with title and maker · year.
- A shelf shows what fits and ends with a dashed **"+ N more on this shelf"** stub. **Open shelf** opens the collection's own wall.

Hover lifts an item 6 px, as if pulled off the shelf (none under reduced motion). Selecting an item opens it the same way it opens from the Everything wall.

## 4. Layout

- **Desktop**: the Library header as today, with **Commonplace** as a new tab after Collections. Then the title, search and **Arrange shelves**, the desk strip, the bay links, and the bays. Each shelf is a two-column row: label (kicker, serif name, count, Open shelf) on the left, the shelf on the right with a 2 px ink edge and a thin board under it. Shelves scroll sideways when they overflow.
- **Phone** (under 700 px): bay chips under the header and one bay at a time; the desk collapses to one line; each shelf is its name and count over a row that scrolls sideways; the usual bottom tab bar.

## 5. Start simple: what the first version is

1. Read-only view: bays, shelves, the desk and the loose table, from existing queries.
2. The area picker, search narrowing the shelves, Open shelf, and opening an item as the wall does.
3. Shelve… on loose items (reuses Move to…).

Not in the first version: dragging between shelves, reordering on the page (Arrange shelves opens the existing Reorder), sub-shelves (for example "Books" and "Specifications" as kinds of Sources), and any AI.

## 6. Decisions for the owner

1. **Tab or replacement?** Recommended: add Commonplace as its own tab first, and decide after testing whether it replaces the Collections grid.
2. **Name.** "Commonplace" for the view and "shelf" for a collection in this view only, or "shelf" everywhere?
3. **The desk.** Keep it on this page, or leave reading-now to To read and Today?
4. **Shelf colours.** Spines use a fixed mix of the blue tokens, ink and paper. Should a collection's accent tone (or cover) colour its shelf's spines instead?
5. **Sub-shelves.** The Craft note asks whether PDFs can hold books, specifications and so on. Shelves within a bay are the natural place for that; it needs its own design.
