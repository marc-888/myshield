# MyShield

Lawyer on call, witness capture, and SOS — Gold Coast demo.

- **24/7** — legal hotline
- **Witness** — dual-cam evidence with GPS, hashed encrypted chunks
- **SOS** — alerts emergency contacts and family with live location
- **Connect to attorney** — both cameras on, independent QLD lawyer

Demo only. Not legal advice. End a lawyer call with PIN `1234`.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/marc-888/myshield)

## Live demo on Render

One click from this repo:

**[Deploy MyShield on Render](https://render.com/deploy?repo=https://github.com/marc-888/myshield)**

1. Open that link (sign in to Render with GitHub if asked).
2. Confirm the web service (`myshield`, Node 22, Singapore).
3. Click **Apply** / **Create**. First deploy takes a few minutes.
4. Open the `.onrender.com` URL on your phone. Allow **camera** and **location**.

If `shieldau.onrender.com` is still live, you can point that service at this repo instead.

## Camera note

Dual cameras need a **real phone browser** over **https**. Desktop previews often have no camera, so the app falls back to a simulated rear + front feed.
