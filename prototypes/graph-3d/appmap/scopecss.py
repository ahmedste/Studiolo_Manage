# Keeps the app CSS rules whose classes the map draws, and scopes them to .loci-appmap.
import re, json, sys, os
SRC = os.environ.get('STUDIOLO_SRC', 'src')
used = set(json.load(open(sys.argv[1])))
# Classes the map adds in states the run may not reach (hover, play, ripple, pick, glow, pan, focus marks).
for f in ['components/graph/graph-map.tsx', 'components/graph/map-node.tsx', 'components/graph/explainer-peek.tsx', 'components/explainers/poster.tsx']:
    t = open(f'{SRC}/{f}').read()
    for m in re.finditer(r'className=\{?[`"]([^`"]*)[`"]', t):
        for tok in re.findall(r'[a-z][a-z0-9-]+', re.sub(r'\$\{[^}]*\}', ' ', m.group(1))): used.add(tok)
    for m in re.finditer(r'"\s?(is-[a-z-]+|gdim|gfocus|hl|on|cov-grow)"', t): used.add(m.group(1).strip())
used |= {'gdim', 'gfocus', 'hl', 'on', 'is-hot', 'is-playing', 'is-panning', 'is-picked', 'is-glow', 'is-suggested', 'cov-grow', 'is-loaded', 'is-hover-label', 'is-explainers'}

def strip_comments(s): return re.sub(r'/\*.*?\*/', '', s, flags=re.S)
def blocks(s):
    """Top-level (prelude, body) pairs."""
    out, i, n = [], 0, len(s)
    while i < n:
        j = s.find('{', i)
        if j < 0: break
        pre = s[i:j].strip(); depth, k = 1, j + 1
        while depth and k < n:
            if s[k] == '{': depth += 1
            elif s[k] == '}': depth -= 1
            k += 1
        out.append((pre, s[j + 1:k - 1])); i = k
    return out
def split_sel(pre):
    parts, depth, cur = [], 0, ''
    for ch in pre:
        if ch in '([': depth += 1
        if ch in ')]': depth -= 1
        if ch == ',' and depth == 0: parts.append(cur.strip()); cur = ''
        else: cur += ch
    parts.append(cur.strip()); return [p for p in parts if p]
def keep_sel(sel):
    classes = re.findall(r'\.([a-zA-Z][\w-]*)', re.sub(r':(not|is|where|has)\([^)]*\)', '', sel))
    if not classes or any(c not in used for c in classes): return None
    if re.match(r'^(html|body|:root)\b', sel): return None
    # The Lumen peek is portalled to <body> (explainer-peek.tsx): its own unique classes, unprefixed.
    if sel.startswith('.graph-xpeek'): return sel
    return '.loci-appmap ' + sel
def walk(s):
    out = []
    for pre, body in blocks(s):
        if pre.startswith('@keyframes') or pre.startswith('@font-face'): out.append(f'{pre} {{{body}}}')
        elif pre.startswith('@media') or pre.startswith('@supports') or pre.startswith('@container'):
            inner = walk(body)
            if inner: out.append(f'{pre} {{\n' + '\n'.join(inner) + '\n}')
        elif pre.startswith('@'): continue
        else:
            sels = [x for x in (keep_sel(p) for p in split_sel(pre)) if x]
            if sels: out.append(', '.join(sels) + ' {' + re.sub(r'\s+', ' ', body).strip() + '}')
    return out
files = ['graph.css', 'explainer.css', 'foundation.css', 'shared.css', 'courses.css', 'learn.css', 'library.css', 'copilot.css', 'shell.css', 'touch.css']
rules = []
for f in files: rules += walk(strip_comments(open(f'{SRC}/styles/{f}').read()))
# Keep only the keyframes the kept rules use.
text = '\n'.join(r for r in rules if not r.startswith('@keyframes'))
kf = [r for r in rules if r.startswith('@keyframes') and re.search(r'\b' + re.escape(r.split()[1]) + r'\b', text)]
# Tokens: the app's own, on the map's box, so light-dark() follows the prototype's theme through color-scheme.
tok = strip_comments(open(f'{SRC}/styles/tokens.css').read())
tokens = []
for pre, body in blocks(tok):
    if pre == ':root':
        body = re.sub(r'\s*--(ui|read):[^;]*;', '', body).replace('color-scheme: light dark;', '')
        tokens.append('.loci-appmap, .graph-xpeek {' + re.sub(r'\s+', ' ', body).strip() + '}')
    elif pre.startswith('@media (prefers-reduced-motion'):
        tokens.append(pre + ' { .loci-appmap, .graph-xpeek {' + re.sub(r'\s+', ' ', blocks(body)[0][1]).strip() + '} }')
theme = ('.loci-appmap, .graph-xpeek { color-scheme: light; }\n:root[data-theme="dark"] :is(.loci-appmap, .graph-xpeek) { color-scheme: dark; }\n'
         '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) :is(.loci-appmap, .graph-xpeek) { color-scheme: dark; } }')
print('\n'.join(tokens) + '\n' + theme + '\n' + '\n'.join(kf) + '\n' + text)
sys.stderr.write(f'{len(rules)} rules, {len(kf)} keyframes\n')
