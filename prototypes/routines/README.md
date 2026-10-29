# Routines (version 4): make them by talking to Loci

Version 3 could do everything but showed everything. This version keeps the same powers and shows almost nothing until it's needed:
- **One quiet list:** one sentence per routine, with a switch.
- **Tap any underlined word** to change it.
- **One "Waiting for you" strip** for everything that needs a decision.
- **Loci beside the list.** You make or change a routine by saying it.

UX design: [`docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md`](../../docs/superpowers/specs/2026-10-29-routines-chat-ux-design.md). What routines can do (filing rules, schedules, events, channels, trust): [`2026-10-29-routines-filing-rules-design.md`](../../docs/superpowers/specs/2026-10-29-routines-filing-rules-design.md); its prototype is [`../loci-routines/`](../loci-routines/README.md).

It's built on **Studiolo's real shell and Today screen and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`), and Loci's chat style (serif replies, your messages in bubbles, round answer chips). The sample learner, Layla, is an architect working on a prayer hall in Dubai. "Now" is Monday 26 October, 8:10.

Open `dist/routines-prototype.html`. Links: `#routines` (default), `#today`.

## Try it

1. **Make one with a tap.** In the Loci panel, tap *When I email myself a PDF, sum it up in three lines and put it on its topic*.
   - Loci asks one question (ask first, or just file).
   - Then it shows the routine and what it would have done with your last 20 things.
   - Tap an underlined word in the card to change it, then **Turn it on**. It appears at the top of the list.
2. **Make one by typing.** Try *Every evening, sort what I haven't sorted* (then type *yes*), or *Keep me up to date on AI in architecture*: untick a source, *Use these*, *Every morning*.
3. **Say something that already exists:** *When I send a photo with #site on WhatsApp, put it with the prayer hall project*. Loci points to *Site photos*. Choose *Change "Site photos"*, then type *ask me first and also tell me on WhatsApp*, and use *Undo that*.
4. **What Loci noticed:** *Yes, do that* adds dezeen.com to *Precedents*.
5. **Change a word.** In the list, tap *To read* in *Books* and choose *Reading*. Tap *Asks you first* to switch it. *Stop asking?* appears on a routine that has earned it.
6. **Open a routine** (tap its name): *Lately*, *What would it do?*, *Change it with Loci*, *Move up*, *Delete*.
7. **Waiting for you:** *Look now*. File the book and the voice note, and decide on the To read pile.
8. **Send something…** (prototype controls):
   - a #site photo files on its own (watch the toast);
   - a book cover waits for you;
   - a dezeen.com link files only if you said yes in step 4;
   - an emailed PDF uses your new rule from step 1;
   - a joinery blog fits no routine. Open the waiting card and choose **Make a routine for things like this**: Loci starts the conversation from that item.
9. **Builder** adds a line to each opened routine and draft saying what runs on plain rules and what needs Loci to read the item.
10. **Today** shows one card for what your routines did. **On a phone**, the Loci bar at the foot opens the chat as a sheet.

## Real or simulated

- No model runs. A keyword reader stands in for Loci's understanding (§5 of the UX spec), so common phrasings work; the chips cover the rest.
- *What it would have done* uses the prototype's real matcher on 20 example arrivals.
- Nothing is sent or received; *Send something…* simulates arrivals.
- Book titles are real; links, reels and articles are examples.
- Everything resets on reload.

## Build

```sh
node build.mjs   # writes dist/routines-prototype.html
```
