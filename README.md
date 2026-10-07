# BlinkBin

Wheelie-bin sanitisation for Gqeberha (Port Elizabeth). BlinkBin pressure-washes and sanitises household and business bins at the gate, with online booking, sponsor-funded streets for households that cannot pay, and proof of every clean.

**Status:** Beta (October 2026). Prices and projections are working assumptions to be validated in a 12-week pilot.

## Live pages

- **Book a clean (public):** https://clrbrandt.github.io/service-sanitation-hub/book.html
- **Owner app (private use):** https://clrbrandt.github.io/service-sanitation-hub/ (bookings, pricing, inventory and analytics; do not share this link publicly)

## What is in this repo

| File | Purpose |
|---|---|
| `index.html` | Owner app (PWA): bookings, pricing, inventory, analytics, online-request sync |
| `book.html` | Client booking page; opens a pre-filled WhatsApp message, or posts to the backend once configured |
| `Code.gs` | Optional backend (Google Apps Script): saves bookings to a Google Sheet and alerts a Telegram group |
| `manifest.json`, `sw.js` | PWA install and offline support |
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | App icons |
| `og-image.png` | Social preview image for Facebook and WhatsApp links |

## Setup

### 1. WhatsApp bookings (works immediately)
1. In `book.html`, replace `27XXXXXXXXX` in `const WA` with your WhatsApp number (country code, no plus sign or spaces).
2. Commit the file. Share the booking link.

### 2. Automated bookings (optional, when volume grows)
1. Create a Telegram bot with @BotFather and add it to a group with your partner.
2. Create a Google Sheet, then Extensions > Apps Script, and paste in `Code.gs`.
3. Under Project Settings > Script Properties, add `BOT` (bot token), `CHAT` (group ID) and `TOKEN` (a password you invent). **Never commit these values to the repo.**
4. Deploy as a web app (access: Anyone) and copy the URL.
5. In `book.html`, set `const API` to that URL.
6. Register the webhook: `https://api.telegram.org/bot<BOT>/setWebhook?url=<web app URL>`
7. In the owner app, Prices tab: enter the URL and token, then tap **Publish prices**.

### 3. Updating the app
After changing files, bump the cache name in `sw.js` (for example `blinkbin-v5`) so phones load the new version.

## Privacy (POPIA)

Bookings collect a name, cell number and address, used only to arrange and confirm the service. The booking page requires consent. Keep the Google Sheet private and share the token with no one outside the business.

## Ownership

BlinkBin is being registered as its own company. The BlinkBin name, logo, app and customer data belong to that company, subject to the written shareholders agreement. All rights reserved.
