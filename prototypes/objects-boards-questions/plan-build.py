"""Builds plan.html: the programme and the three designs it orders, full length, as one page (Boards last).

Run: python3 plan-build.py   (reads ../../docs/superpowers/specs/*.md, writes plan.html)
A small Markdown subset: headings, paragraphs, lists, tables, code and mermaid fences, bold, italic, code, links.
Links to other files in the repo keep their text; links to artifacts stay links.
"""
import html, re, pathlib

HERE = pathlib.Path(__file__).parent
SPECS = HERE / "../../docs/superpowers/specs"
PARTS = [
    ("programme", "The programme: order and where they meet", "2026-10-28-objects-questions-boards-programme.md"),
    ("objects", "Part 1 · Objects: build phases", "2026-10-25-objects-build-phases.md"),
    ("questions", "Part 2 · Questions and goals: the roadmap", "2026-10-25-questions-and-goals-roadmap-design.md"),
    ("questions-design", "Part 3 · Questions and goals: the design", "2026-10-25-questions-and-goals-inside-items-design.md"),
    ("long-notes", "Part 4 · Long notes and connections", "2026-10-28-long-notes-and-connections-design.md"),
    ("collections", "Part 5 · Collections and linking", "2026-10-28-collections-and-linking-design.md"),
    ("boards", "Part 6 · Boards", "2026-10-24-boards-design.md"),
]
ARTIFACTS = {
    "prototypes/objects-boards-questions": "https://claude.ai/artifact/U95rk7ZKi3c2wsFvqsiS1b",
    "prototypes/objects-phases": "https://claude.ai/artifact/3sJpPHVcPMUJiDgA7MpCTH",
    "prototypes/objects-any-field": "https://claude.ai/artifact/XLHqoBxTXgaCoarmpUmo59",
    "prototypes/boards": "https://claude.ai/artifact/CVVpm4kM6pshfmURATKXvi",
}


def inline(t):
    t = html.escape(t, quote=False)
    def link(m):
        text, href = m.group(1), m.group(2)
        if href.startswith("https://"):
            return f'<a href="{href}" target="_blank" rel="noopener">{text}</a>'
        for k, v in ARTIFACTS.items():
            if k in href:
                return f'<a href="{v}" target="_blank" rel="noopener">{text}</a>'
        return text
    t = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", link, t)
    t = re.sub(r"`([^`]+)`", r"<code>\1</code>", t)
    t = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"<em>\1</em>", t)
    return t


def convert(md, prefix):
    lines = md.split("\n")
    out, i, toc = [], 0, []
    para = []

    def flush():
        if para:
            out.append("<p>" + inline(" ".join(para)) + "</p>")
            para.clear()

    # line 1 is the tier line
    if lines and re.match(r"^(HIGH|MEDIUM|LOW)\b", lines[0]):
        out.append(f'<p class="tier">{inline(lines[0])}</p>')
        lines = lines[1:]
    while i < len(lines):
        ln = lines[i]
        if ln.startswith("```"):
            flush()
            lang = ln[3:].strip()
            body = []
            i += 1
            while i < len(lines) and not lines[i].startswith("```"):
                body.append(lines[i]); i += 1
            i += 1
            if lang == "mermaid":
                out.append('<div class="diagram"><pre class="mermaid">' + html.escape("\n".join(body)) + "</pre></div>")
            else:
                out.append('<pre class="code"><code>' + html.escape("\n".join(body)) + "</code></pre>")
            continue
        m = re.match(r"^(#{1,4})\s+(.*)$", ln)
        if m:
            flush()
            level = len(m.group(1)) + 1
            text = m.group(2)
            hid = prefix + "-" + re.sub(r"[^a-z0-9]+", "-", re.sub(r"<[^>]+>", "", text.lower())).strip("-")
            if level == 2:
                out.append(f'<h2 id="{prefix}" class="part-title">{inline(text)}</h2>')
            else:
                out.append(f'<h{level} id="{hid}">{inline(text)}</h{level}>')
                if level == 3:
                    toc.append((hid, re.sub(r"[*`]", "", text)))
            i += 1
            continue
        if ln.startswith("|"):
            flush()
            rows = []
            while i < len(lines) and lines[i].startswith("|"):
                rows.append(lines[i]); i += 1
            cells = lambda r: [c.strip() for c in re.split(r"(?<!\\)\|", r.strip().strip("|"))]
            head = cells(rows[0])
            body = [cells(r) for r in rows[2:]]
            t = '<div class="tbl"><table><thead><tr>' + "".join(f"<th>{inline(c)}</th>" for c in head) + "</tr></thead><tbody>"
            t += "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in body)
            out.append(t + "</tbody></table></div>")
            continue
        m = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", ln)
        if m:
            flush()
            ordered = m.group(2)[0].isdigit()
            items, depth0 = [], len(m.group(1))
            while i < len(lines):
                mm = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", lines[i])
                if mm:
                    items.append((len(mm.group(1)) > depth0, mm.group(3))); i += 1
                elif lines[i].startswith("  ") and lines[i].strip() and items:
                    items[-1] = (items[-1][0], items[-1][1] + " " + lines[i].strip()); i += 1
                else:
                    break
            tag = "ol" if ordered else "ul"
            h, open_sub = f"<{tag}>", False
            for sub, text in items:
                if sub and not open_sub:
                    h = h[: -len("</li>")] if h.endswith("</li>") else h
                    h += "<ul>"; open_sub = True
                if not sub and open_sub:
                    h += "</ul></li>"; open_sub = False
                h += f"<li>{inline(text)}" + ("</li>" if not sub else "</li>")
            if open_sub:
                h += "</ul></li>"
            out.append(h + f"</{tag}>")
            continue
        if not ln.strip():
            flush(); i += 1; continue
        if ln.startswith("**") and para:
            flush()
        para.append(ln.strip())
        i += 1
    flush()
    return "\n".join(out), toc


def main():
    build(PARTS, "plan.html", None)
    build([("collections", "Collections and linking", "2026-10-28-collections-and-linking-design.md")], "linking.html",
          ("Commonplace Linking and Collections", "How Commonplace links, and how collections are shaped",
           "The linking model drawn out (what can link to what, which link to use, two sides of one link, links of links), the problems thought through, backlinks on every entry, and the collection studio. Proposed, 28 October 2026."))


def build(parts, out, head):
    sections, nav = [], []
    for pid, label, fname in parts:
        md = (SPECS / fname).read_text()
        body, toc = convert(md, pid)
        sections.append(f'<section class="part" aria-labelledby="{pid}"><p class="eyebrow">{html.escape(label)}</p>{body}</section>')
        nav.append(f'<li><a href="#{pid}">{html.escape(label)}</a></li>')
    page = (HERE / "plan.src.html").read_text()
    page = page.replace("<!--NAV-->", "\n".join(nav)).replace("<!--PARTS-->", "\n".join(sections))
    if head:
        title, h1, intro = head
        page = page.replace("<title>Objects, Questions and Boards Programme</title>", f"<title>{title}</title>")
        page = page.replace(page[page.index('<header class="top">'):page.index("</header>") + 9], f'<header class="top"><h1>{h1}</h1><p>{intro}</p></header>')
    (HERE / out).write_text(page)
    print(out, "written")


main()
