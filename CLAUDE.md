# עלווה – two static sites

- `src/portfolio.dc.html` → `portfolio/` → https://alva.segalautomations.cloud
  (also the Claude Design artifact https://claude.ai/artifact/6S6NMcbMRyYbbqxtfjhUEz)
- `src/sales.dc.html` → `sales/` → https://alva-sales.segalautomations.cloud
  (also the artifact https://claude.ai/artifact/A8tvCjqLkygcFMw3UVAYpg)

## Making a change
1. Edit the source in `src/` (for the portfolio, keep the Design artifact in sync: publish the same file to it).
2. Run `python3 tools/build.py` — rebuilds `portfolio/` and `sales/`.
3. Commit and push to `main`. The VPS (Hostinger, Docker project `alva`) pulls `main` every 60 seconds
   and serves `portfolio/` and `sales/` via nginx behind Traefik. No manual upload.

A change asked for "both" versions must be made in both `src/` files.
New images: upload to the artifact, add `<blob id>: <name>.webp` to `tools/blobmap.json`
and the file to `tools/assets/img/`.
