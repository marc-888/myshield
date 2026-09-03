# myShield

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

Dual cameras need a **real phone browser** over **https**. Allow camera and microphone when asked.

- Phones that can run two lenses at once (many Androids) record **back + front live**.
- Phones that only allow one lens at a time (iPhone Safari and some Androids) still **record both cameras** by switching lenses and holding the last frame on the other view — both files keep recording.
- A laptop with a single webcam cannot invent a back camera; the app records the camera it has.
