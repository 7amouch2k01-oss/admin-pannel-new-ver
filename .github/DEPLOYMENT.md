# Deploying the Styly Admin Console

The console is a **static Vite SPA**. It has no server of its own — it is served by nginx on
the same VPS as the Styly API, at `https://admin.styly.tn`, and nginx proxies `/api` and
`/files` through to the API so the browser sees a single origin.

That same-origin arrangement is load-bearing: it is why the build ships **no `VITE_API_BASE_URL`**,
why the stored `/files/<uuid>` media paths work as relative URLs, and why the API needs no
`CORS_ORIGIN` entry for this console.

---

## Pipeline

`.github/workflows/deploy.yml` — triggered by a push to `main`, or manually via
**Actions → Deploy Admin Console → Run workflow**.

```
push to main
  → pnpm install --frozen-lockfile
  → pnpm build                      ← the gate: a failed build never reaches the server
  → scp dist/public → /tmp/admin-<sha>
  → ssh: mv into $WEB_ROOT/releases/<sha>, flip the `current` symlink, prune to 5 releases
  → smoke test against https://admin.styly.tn
```

It mirrors the backend's pipeline (`Wrapped-Tn/stylyServer`) — same `appleboy/scp-action` and
`appleboy/ssh-action`, same `deploy` Environment convention — with one structural difference:
the backend has the *server* pull the code and build in place, which suits a Node service. A
static site is built on the runner and only the artifact is shipped, so the box needs no Node,
no pnpm and no PM2.

### Secrets

Repo → **Settings → Environments → New environment → `deploy`**, then add:

| Secret | Value |
|---|---|
| `SERVER_HOST` | same as the backend repo's |
| `SERVER_USER` | same as the backend repo's |
| `SERVER_SSH_KEY` | same as the backend repo's (private key) |
| `SERVER_PORT` | same as the backend repo's |
| `WEB_ROOT` | `/var/www/styly/admin` |
| `SITE_URL` | *optional* — smoke-test target, defaults to `https://admin.styly.tn` |

There are no application secrets: a static SPA has none to keep.

---

## One-time server setup

Required **before** the first deploy — otherwise the workflow goes green while the site 404s.

```bash
# 1. DNS: an A record for admin.styly.tn pointing at the VPS.

# 2. Directory, owned by the deploy user
sudo mkdir -p /var/www/styly/admin/releases
sudo chown -R "$USER":"$USER" /var/www/styly/admin

# 3. nginx site + certificate
sudo cp deploy/nginx/admin.styly.tn.conf /etc/nginx/sites-available/admin.styly.tn
sudo ln -s /etc/nginx/sites-available/admin.styly.tn /etc/nginx/sites-enabled/
sudo certbot --nginx -d admin.styly.tn
sudo nginx -t && sudo systemctl reload nginx
```

Check that the `proxy_pass` port in the nginx config matches the backend's `PORT` secret.

---

## Releases and rollback

Each deploy lands in its own directory and `current` is flipped atomically, so no visitor ever
sees a half-copied release:

```
/var/www/styly/admin/
├── current -> releases/<sha>
└── releases/
    ├── <sha>/     ← last 5 kept
    └── ...
```

**Rollback** is a symlink flip — no rebuild, no pipeline run:

```bash
cd /var/www/styly/admin
ls -1dt releases/*/                     # newest first
ln -sfn "$PWD/releases/<previous-sha>" current.tmp && mv -Tf current.tmp current
```

---

## Local development

```bash
pnpm install
pnpm dev      # http://localhost:3000, proxies /api and /files to 127.0.0.1:4000
```

Start the Styly API first. To point the dev proxy elsewhere, set `VITE_API_PROXY_TARGET`.

Node version is pinned in `.nvmrc` (`nvm use`), and CI reads the same file, so local and CI
cannot drift.

---

## Troubleshooting

| Symptom | Cause |
|---|---|
| Deploy green, site 404 | Server setup above not done, or `WEB_ROOT` doesn't match the nginx `root` |
| Deep link 404s, `/` works | `try_files ... /index.html` missing from the nginx `location /` |
| Blank page, console "Unexpected token '<'" | An asset request fell through to the SPA fallback — check `location /assets/` has `try_files $uri =404` |
| Stale UI after a deploy | `index.html` is being cached — it must respond `no-store` |
| Login works, then every call 401s | API unreachable through `/api` — check the proxy and the upstream port |
| Images broken | `/files/` proxy missing; see `client/src/lib/media.ts` for how media URLs are resolved |
