# Media server — deployment checklist (same VPS as the app)

This puts the Maalkhana media server on the VPS that already runs the Next.js app.
After this, every photo and document uploaded in the app is saved on the VPS like this:

```
/var/www/maalkhana-media/
└── bulandshahr-3f9a1c/                 ← district  (_info.json holds the real name)
    ├── district-office/                ← uploads made by the district login itself
    └── kotwali-nagar-8b21e0/           ← police station
        ├── photos/2026/11/…png
        └── documents/2026/11/…pdf
```

Folder names are the English part of the name plus a short id. Hindi-only names become
`district-xxxxxx` / `ps-xxxxxx`; the `_info.json` in each folder holds the real Hindi name.

**How it fits together**

```
Browser ──1. "may I upload?"──▶ Next.js app  (checks the login, signs a 10-minute ticket
   │                                           for that district/station folder only)
   └──2. file + ticket────────▶ nginx ─▶ media server (127.0.0.1:4100) ─▶ /var/www/maalkhana-media
Anyone with the link ◀── CDN ◀── nginx serves /files/… straight from disk
```

Until steps 8–9 are done, the app keeps uploading to ImageKit exactly as today, so you can
deploy the code first and switch over when the media server is ready.

Replace these placeholders everywhere below:

| Placeholder | Meaning |
|---|---|
| `media.example.com` | new sub-domain for the media server, e.g. `media.yourdomain.in` |
| `app.example.com` | the address the Malkhana app is opened at |
| `cdn.example.com` | only if you use a separate CDN (option B in step 2) |
| `deploy` | the Linux user that runs the app on the VPS |

---

## 1. Check the VPS

```bash
node -v          # must be v20.6 or newer (the server uses --env-file)
nginx -v
pm2 -v           # if missing: sudo npm i -g pm2
df -h /var       # free disk space — photos/documents will live here
```

If Node is older than 20.6, upgrade it first (nvm or NodeSource), then restart the app.

## 2. Choose the CDN setup (decide once — the URL is saved in the database)

The full file URL is stored with each entry, so pick the public address before going live.

- **A. Cloudflare in front of the same sub-domain (simplest).**
  `media.example.com` DNS record is *proxied* (orange cloud). Uploads and files use the same
  name, Cloudflare caches `/files/*`.
  → `PUBLIC_BASE_URL=https://media.example.com/files`
- **B. Separate CDN (BunnyCDN, CloudFront, Cloudflare on another name…).**
  Create a pull zone whose origin is `https://media.example.com`, attach `cdn.example.com`.
  → `PUBLIC_BASE_URL=https://cdn.example.com/files`
- **C. No CDN.** → `PUBLIC_BASE_URL=https://media.example.com/files`

## 3. DNS

Add an **A record**: `media` → your VPS IP (and `cdn` CNAME to the CDN if you chose B).
For Cloudflare (A): keep it **DNS only (grey cloud)** until the certificate in step 7 is issued,
then switch it to **Proxied**, and set SSL/TLS mode to **Full (strict)**.

## 4. Copy the media server to the VPS

First, on the VPS, create the folder and give it to the `deploy` user:

```bash
sudo mkdir -p /opt/maalkhana-media
sudo chown deploy:deploy /opt/maalkhana-media
```

Then, from your computer, in the `my-app` folder:

```bash
cd media-server
scp -r server.mjs package.json ecosystem.config.cjs .env.example deploy \
    deploy@YOUR_VPS_IP:/opt/maalkhana-media/
cd ..
```

The files are listed one by one on purpose: `scp` cannot skip files, and copying the whole
folder would also send your local `.env` and any test uploads in `storage/`.
(The `deploy` in the file list is the folder holding the nginx config; the second `deploy` is
the Linux user.)

There is nothing to `npm install` — it has no dependencies.

To update the server later, copy only the changed file and restart:

```bash
scp media-server/server.mjs deploy@YOUR_VPS_IP:/opt/maalkhana-media/
ssh deploy@YOUR_VPS_IP 'pm2 restart maalkhana-media'
```

## 5. Storage folder

```bash
sudo mkdir -p /var/www/maalkhana-media
sudo chown deploy:deploy /var/www/maalkhana-media
sudo chmod 755 /var/www/maalkhana-media
```

nginx must be able to read it (755 folders / 644 files — the server creates them that way).

## 6. Configure and start the media server

```bash
cd /opt/maalkhana-media
cp .env.example .env
openssl rand -hex 32          # copy this value — it is the shared secret
nano .env
```

Fill in:

```
MEDIA_ROOT=/var/www/maalkhana-media
PUBLIC_BASE_URL=https://media.example.com/files      # from step 2
MEDIA_UPLOAD_SECRET=<the openssl value>
ALLOWED_ORIGINS=https://app.example.com               # add more, comma-separated, if the app has several addresses
MAX_UPLOAD_MB=20
SERVE_FILES=0
```

Start it and make it survive reboots:

```bash
chmod 600 .env
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup          # run the command it prints (once per server)
curl http://127.0.0.1:4100/health      # → {"ok":true,"root":true}
```

## 7. nginx + HTTPS

```bash
sudo cp /opt/maalkhana-media/deploy/nginx-media.conf /etc/nginx/sites-available/maalkhana-media
sudo nano /etc/nginx/sites-available/maalkhana-media     # replace media.example.com (and the path if MEDIA_ROOT differs)
sudo ln -s /etc/nginx/sites-available/maalkhana-media /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d media.example.com
curl https://media.example.com/health                     # → {"ok":true,"root":true}
```

Port 4100 stays private (the server listens on 127.0.0.1 only). If you use `ufw`, you only
need `sudo ufw allow 'Nginx Full'` — do **not** open 4100.

## 8. Point the Next.js app at the media server

Add to the **app's** `.env` on the VPS:

```
MEDIA_SERVER_URL=https://media.example.com       # the upload address — the origin, not the CDN name
MEDIA_UPLOAD_SECRET=<same value as in step 6>
```

Then rebuild and restart the app the way you normally do (e.g. `pnpm build && pm2 restart <app>`).

## 9. CDN settings (options A/B)

- Cache everything under `/files/*` (nginx already sends `Cache-Control: public, max-age=31536000, immutable`).
- Do **not** cache `/upload` or `/health` (Cloudflare does not cache POST anyway).
- Cloudflare free plan accepts uploads up to 100 MB, so the 20 MB limit is fine.

## 10. Test in the app

1. Log in as a police station → **Entry → Malkhana**, add a photo, save.
2. On the VPS: `find /var/www/maalkhana-media -type f | tail` — the file is under that district/station.
3. Open the entry in the report and click the photo — it should load from the CDN address.
4. Also try a PDF in **Release** or **Destroy** (goes to `documents/`).
5. Log in as the district, pick a police station in the header, upload — it lands in that station's folder.
6. Watch for errors: `pm2 logs maalkhana-media`.

## 11. Backups (important — files are no longer on ImageKit)

The app's database backup (profile → Backup) does **not** include these files.
Back up `/var/www/maalkhana-media` regularly to somewhere outside the VPS, e.g. nightly:

```bash
# crontab -e
30 2 * * * rsync -a /var/www/maalkhana-media/ backup-host:/backups/maalkhana-media/
```

(or `restic` / `rclone` to cloud storage). Also keep an eye on disk space: `df -h /var`.

## 12. Good to know

- **Rolling back:** remove `MEDIA_SERVER_URL` and `MEDIA_UPLOAD_SECRET` from the app's `.env`
  and restart — uploads go back to ImageKit. Files already on the media server keep working.
- **Old files:** photos already on ImageKit stay there and keep working; nothing is moved.
- **Privacy:** file links are public but random and unguessable (same as ImageKit today).
  Do not share the secret; anyone with it could upload files.
- **Allowed files:** photos — jpg, jpeg, png, gif, webp, heic. Documents — pdf, doc, docx,
  xls, xlsx, plus images (scans). Max 20 MB (`MAX_UPLOAD_MB`; also `client_max_body_size` in nginx).
  The server checks the actual file contents, not just the name.
- **Changing the domain later:** saved URLs keep the old address. Keep the old name working
  or update the URL columns in the database with an SQL `replace(...)`.
- **Updating the media server:** copy the new `server.mjs` with `scp` (see step 4) and run
  `pm2 restart maalkhana-media`.
