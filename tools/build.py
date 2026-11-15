"""Build the static sites from the design sources.

    python3 tools/build.py            # builds portfolio/ and sales/

src/portfolio.dc.html -> portfolio/   (alva.segalautomations.cloud)
src/sales.dc.html     -> sales/       (alva-sales.segalautomations.cloud)

Images referenced as /_blob/<id> are mapped through tools/blobmap.json to
tools/assets/img/<name>.webp. A new image needs an entry there.
"""
import json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
A = os.path.join(ROOT, 'tools', 'assets')
BLOBS = json.load(open(os.path.join(ROOT, 'tools', 'blobmap.json')))
SITES = {'portfolio': ('src/portfolio.dc.html', 'alva.segalautomations.cloud'),
         'sales': ('src/sales.dc.html', 'alva-sales.segalautomations.cloud')}
TITLE = 'עלווה – כפר נופש בטבע'
DESC = 'עלווה – כפר נופש בגליל העליון: 18 יחידות אירוח בין העצים, מפלים, שבילי פריחה ובריכה. בדקו מחיר לתאריכים.'


def build(name, src_rel, host):
    out = os.path.join(ROOT, name)
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out + '/img')
    src = open(os.path.join(ROOT, src_rel), encoding='utf-8').read()
    used = set(re.findall(r'/_blob/([0-9a-f]{32})', src))
    missing = [b for b in used if b not in BLOBS]
    if missing:
        raise SystemExit(f'{src_rel}: unmapped images {missing} - add them to tools/blobmap.json')
    for b in used:
        shutil.copy(f'{A}/img/{BLOBS[b]}', f'{out}/img/{BLOBS[b]}')
        src = src.replace('/_blob/' + b, 'img/' + BLOBS[b])
    helmet = re.search(r'<helmet>(.*?)</helmet>', src, re.S).group(1)
    body = re.search(r'</helmet>(.*?)</x-dc>', src, re.S).group(1)
    script = re.search(r'<script type="text/x-dc"[^>]*>(.*?)</script>', src, re.S).group(1)
    for f in ['favicon.ico', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'og.jpg', 'runtime.js', 'morphdom.min.js']:
        shutil.copy(f'{A}/{f}', f'{out}/{f}')
    open(out + '/page.js', 'w', encoding='utf-8').write(script.strip() + '\nmountPage(Component);\n')
    hero = BLOBS.get('4870b714d52861fac08da6127cebeb10')
    preload = f'<link rel="preload" as="image" href="img/{hero}">\n' if hero else ''
    html = f'''<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITLE}</title>
<meta name="description" content="{DESC}">
<meta name="theme-color" content="#1f4d2b">
<meta property="og:type" content="website">
<meta property="og:locale" content="he_IL">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:image" content="https://{host}/og.jpg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
{preload}{helmet.strip()}
</head>
<body>
<div id="app"></div>
<template id="page-tpl">{body}</template>
<script src="morphdom.min.js"></script>
<script src="runtime.js"></script>
<script src="page.js"></script>
</body>
</html>
'''
    open(out + '/index.html', 'w', encoding='utf-8').write(html)
    print(f'{name}: {len(used)} images -> {out}')


if __name__ == '__main__':
    for n, (s, h) in SITES.items():
        build(n, s, h)
