# Learn, slice 2: one Lumen, three formats

Status: **draft for owner review**, 22 October 2026. This is a design and prototype, not approved or built. Nothing has changed in `studiolo`.
- Prototype: [`prototypes/learn-lumens/`](../../../prototypes/learn-lumens/README.md).
- It builds on [Learn slice 1](2026-10-22-learn-live-slice-1.md) and [Learning forms and Dialogues](2026-10-22-learning-forms-and-dialogues.md).
- It replaces two things there: the Dialogues tab, and the Lumen | Live | Dialogue switch on Home.

## The model

Owner direction (22 Oct): *a Dialogue is a Lumen in itself; a Lumen can be audio, video or long-form.*

| Thing | What it is |
|---|---|
| **Lumen** | One idea, explained for you, made from one brief: question, goal, topic, sources, what you already know. |
| **Format** | How you take it in. **Watch** is slides and a narrator, 2–6 min. **Listen** is two voices, 10–30 min (what the Dialogues spec called a Dialogue). **Read** is a long read, 10–20 min. A Lumen has one or more formats. |
| **Edition** | A variant of a format. Today only Listen has one: the **drive edition**, written and played for the road. |
| **Live** | Not a format but a way through a Lumen: Studiolo talks it through now and you cut in. Sessions are kept for 30 days and can be kept as a Lumen. The interaction is slice 1's, unchanged (go live, interruptions, asides, written answers, Keep, resume). Slice 2 only changes where it's offered: it's a **first-class choice** in the Home bar (Watch · Listen · Read · ● Live) and at the end of every Lumen page's switcher. |
| **Course** | A series of Lumens (its parts). Parts can have formats too. |

## What changed

| | Before | Slice 2 |
|---|---|---|
| Learn tabs | Home · Lumens · Dialogues · Courses · Live sessions | **Home · Lumens · Courses** |
| Making | A Lumen \| Live \| Dialogue switch, plus a separate "New Dialogue" page | One verb, **Make a Lumen**: pick **Watch / Listen / Read** in the bar. **Tailor…** opens one brief whose first question is the format. **Talk it through live** is the alternative. |
| Adding a format | Making a second, separate thing | **+ Listen** (or + Watch, + Read) on a card or in the page switcher. It's made from the same brief and kept on the same card. |
| Cards | Lumen cards and Dialogue tiles, different shapes | One card per Lumen, with **format pills**. Made formats open it; missing ones are "+ Format"; Live sits beside them. The poster follows the main format: a slide, an audio cover, or a long read's title page. |
| Pages | A Watch page and a Dialogue page with different heads; a separate Recording \| Live switch on Watch | Every Lumen page has the same **Watch · Listen · Read \| ● Live** switcher. Each format keeps its own player. On the Watch page, Watch and Live are the player's two modes, so one control replaces Recording \| Live. |
| Finding things | Separate lists per tab | **Lumens** filters by format (All, Watch, Listen, Read, Live sessions), state and area, and groups **by date or by topic**. |
| Continue | Watch only | The last Lumen, plus **Also in progress** in any format (e.g. Listen at chapter 2, or its drive edition) |
| Words | "Dialogue", "Long read" | **Listen** and **Read** in the interface. "Dialogue" stays only as a code name. |

## Creation flow

1. **The Home bar.**
   - The format is chosen in the bar, which remembers it; new users start on Watch.
   - **● Live** is the fourth choice. It turns the button into **Start live session**, and holding the mic starts it as you speak, as in slice 1.
   - Under the bar, one line shows the brief Studiolo will use: "For *Thesis · Dubai courtyard house* · under *Climate-responsive design* · from *3 library items* · builds on *3 things you've seen* · **Tailor…**".
   - **Make a Lumen** uses those defaults:
     - Watch and Read are made in the background, with a "Making · Watch" row and a toast.
     - Listen opens and starts playing in about half a minute.
2. **Tailor…** opens the brief, prefilled.
   - The first question is **How do you want to take it in?**
   - The other fields follow the format:

     | Field | Watch | Listen | Read |
     |---|---|---|---|
     | Goal, topic, sources, already known | ✓ | ✓ | ✓ |
     | Two voices, where you'll listen (driving rules) | — | ✓ | — |
     | Length | Short or Standard | 10 / 20 / 30 min | Overview or In depth |

   - The side panel shows *What the writer gets*, how it's made and the cost estimate, for that format.
3. **+ Format** on a card or in a page's switcher opens the same brief:
   - with the question, topic and goal fixed;
   - with the formats already made shown as "Already made".
4. **Other entry points** (a topic on Loci, Library items, the talk bar) open the same brief with their context filled in. "I'm about to drive" opens a drive edition.

## Telling the formats apart

Each format has one colour, taken from the app's own tokens:

| Format | Colour (token) | Poster |
|---|---|---|
| Watch | accent blue (`--accent`) | Its title slide |
| Listen | amber (`--myfocus-ink`) | The two hosts on a dark cover |
| Read | green (`--entity-work`) | A paper title page with a green spine |
| Live | red (`--warn`) | A talked-through slide |

The colour shows wherever a format is named:
- the flag on the poster;
- the format pills;
- the page switcher (the selected format is tinted);
- the Lumens format filter;
- the Home bar, where the Make button takes the chosen format's colour.

## The dock (talk bar) and live transcription

- **Suggestions are one row.** They're centred when they fit and scroll sideways with faded edges when they don't, so the dock never grows taller.
- **The dock is one card.** A **transcription strip** sits on top of the input:
  - it names who is speaking (Studiolo or You);
  - it shows up to two lines, with words lit as they're said;
  - the input below stays usable, so you can type while it talks.
- **In a live session, live transcription has one home:**
  - **the strip is the caption.** The slide's own caption steps aside; it's for recordings.
  - **The transcript panel keeps the history.**
  - **The card is outlined in red** and its label reads "Live · title" while the line is open.
  - **Between turns** the strip keeps the last line, dimmed, or says "The line is open. Speak, type, or pick a suggestion."
- **Fixed from slice 1:** cutting in during the narrator's opening line now stops it. Before, it carried on to the slide and talked over you.

## Port notes

- **Data.**
  - **Option A:** a `lumens` table (the idea: question, topic, goal, brief snapshot), with each format an `explainers` row carrying `lumen_id`, `format` (`watch | listen | read`) and `edition`.
  - **Option B (minimal):** add `lumen_id` and `format` to `explainers` and group by `lumen_id`.
  - Either way, the existing Lumen pipeline is the Watch format unchanged.
- **Progress** is per format. Continue picks the most recent across formats.
- **Learn lists** group by Lumen. The topic journal and Loci lane show one entry per Lumen with its formats.

## Decisions for the owner

| # | Decision | Recommendation |
|---|---|---|
| LS2-1 | Data model | Option A (`lumens` + format rows). It's the honest shape, and goals, briefs and memory attach to the idea, not to a file. |
| LS2-2 | Default format on Home | Remember the last choice; start new users on Watch |
| LS2-3 | Live sessions | A filter in Lumens and a Resume link on Home, with no tab of their own |
| LS2-4 | Course parts with formats | Yes, later: "Listen to Part 3" on the drive |
| LS2-5 | Moving between formats mid-way | Later: "You stopped at chapter 3. Watch from the matching slide?" It needs each format's sections mapped to the brief's outline. |
