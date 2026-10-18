# Puts the bundled app Map and its scoped styles between the "app map" markers of the prototype.
import sys, re
page, js, css = sys.argv[1], sys.argv[2], sys.argv[3]
s = open(page).read()
a, b = '<!-- app map: begin -->', '<!-- app map: end -->'
i, j = s.index(a) + len(a), s.index(b)
block = ('\n<!-- Studiolo\'s own Map, bundled from ahmedste/studiolo at d6e510e (src/components/graph/graph-map.tsx, '
         'src/features/topics/layout.ts, use-frame-tween.ts) with React 19. The explainer player\'s code, maths and diagram slides are '
         'stubbed (posters on the map never draw them). Its styles are the app\'s (src/styles/tokens.css, graph.css, explainer.css and '
         'the rules they need), kept to the classes the map draws and scoped to #mapView; the last rules recolour it like the Palace. -->\n'
         '<style id="appmap-css">\n' + open(css).read() + '\n</style>\n<script id="appmap-js">\n' + open(js).read() + '\n</script>\n')
open(page, 'w').write(s[:i] + block + s[j:])
print(len(s[:i] + block + s[j:]))
