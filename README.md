# MyShield

Lawyer on call, witness capture, and SOS — Gold Coast demo.

- **24/7** — legal hotline
- **Witness** — dual-cam evidence with GPS, hashed encrypted chunks
- **SOS** — alerts emergency contacts and family with live location
- **Connect to attorney** — both cameras on, independent QLD lawyer

Demo only. Not legal advice. End a lawyer call with PIN `1234`.

## Live demo on Render

This repo is wired for [Render](https://render.com). After the code is on GitHub:

1. Sign in to [Render](https://dashboard.render.com) with the same GitHub account (`marc-888`).
2. **New → Web Service → Connect `marc-888/myshield`**.
3. Render should pick up `render.yaml`:
   - **Name:** `myshield`
   - **Runtime:** Node
   - **Build:** `npm ci && NITRO_PRESET=node-server npm run build`
   - **Start:** `node .output/server/index.mjs`
   - **Region:** Singapore
4. Create the service (free/starter is fine). First deploy takes a few minutes.
5. Open the `.onrender.com` URL on your phone. Allow **camera** and **location** when Witness / Attorney / SOS asks.

If you already have `shieldau.onrender.com`, you can point that service at this repo instead of creating a new one.

## Local (optional)

```bash
npm ci
npm run dev
```

## Camera note

Dual cameras need a **real phone browser** over **https** (Render provides that). Desktop / in-app previews often have no camera, so the app falls back to a simulated rear + front feed.
