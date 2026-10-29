# Loci routines (version 3)

**Simple to send, sorted your way.** Routines are small automations for a Commonplace, in three families by what starts them:
- **When something arrives:** your filing rules. Everything you send, from WhatsApp, a phone share, email, the browser or Studiolo itself, comes through one door and meets your rules from the top.
- **On a schedule:** tidy, bring in, bring back.
- **When something happens:** small follow-ups to what you do.

Design: [`docs/superpowers/specs/2026-10-29-routines-filing-rules-design.md`](../../docs/superpowers/specs/2026-10-29-routines-filing-rules-design.md). The scheduled routines are from [`2026-10-25-loci-routines-design.md`](../../docs/superpowers/specs/2026-10-25-loci-routines-design.md).

It's built on **Studiolo's real shell, Today, Library and Loci screens and styles**, captured read-only from `studiolo` (`../live-lumens/capture/snap.json`), with the Settings and memory prototype's form styles. The sample learner, Layla, is the architect working on a prayer hall in Dubai. "Now" is Monday 26 October, 8:10.

Open `dist/loci-routines-prototype.html`. Links: `#routines`, `#inbox`, `#today`, `#runs`, `#loci`.

## Try it

1. **Routines › When something arrives.**
   - Eight filing rules, each one a sentence. **Dotted** parts are where Loci reads the item; the rest are plain rules that cost nothing.
   - Each card shows whether it files on its own or asks first, and how often it's been right.
   - *Books* has earned **Let it file on its own** (right 9 of 10).
   - Two **suggestions from what you do** at the top: *Add it*, or *Make it a rule*.
   - **Try it** on any rule shows what it would have filed from your last 20 arrivals, and when an earlier rule gets something first.
   - **Move up / down** changes the order.
   - **Anything else** is the last line: suggest a place, or leave it in Unsorted.
2. **Inbox** (prototype bar, or *Open the Inbox*). Send things on the left and watch the rules act on the right:
   - **WhatsApp:** a #site photo (files on its own and is described), a link from archdaily.com, a book cover (*Books* asks, with the book found), a voice note (written out, titled, a @question found, and a reply on WhatsApp), a **#explain** voice note (Studiolo asks on WhatsApp before making a Lumen: say **Yes**), and a book you already have (caught).
   - **Phone share:** a reel (the links in its caption are saved) and a recipe reel (*keep just the recipe*, on Home & family).
   - **Email:** a specification PDF (text pulled out, three-line summary, filed on Precast and the project).
   - **Browser:** a joinery blog that no rule fits. Loci suggests a new sub-topic; try **Make a rule from this**.
   - On every item: **File it**, or choose another topic, **Undo**, **Why**. Turn on **Builder** to see which steps used a model.
3. **New rule › Say it.** Write a sentence, or tap an example, then **Make it a rule**. Check the parts, then **Try it on your last 20 arrivals**. New rules go to the top.
4. **Routines › On a schedule.** The 25 Oct routines, grouped Store / Manage / Learn, plus three new Manage ones:
   - **Tidy Unsorted:** last night's run shows what your rules filed, what Loci suggests (*Place all*) and what's left for you. **Run now** picks up anything left in the Inbox.
   - **Clear the To read pile.**
   - **Keep sources alive.**
5. **When something happens.** Five follow-ups, each on or off.
6. **Today:** the Inbox since yesterday, then what's waiting from routines. **In Loci** is as in version 2.

## Real or simulated

- Nothing is sent or received: WhatsApp, the phone share and email are simulated panels, with no branding.
- No model runs. *Say it* uses a keyword reader in place of the model call. Descriptions, transcripts and summaries are written by hand.
- Book titles are real; links, reels, articles and the blog are examples.
- Costs are example figures. Everything resets on reload.

## Build

```sh
node build.mjs   # writes dist/loci-routines-prototype.html
```
