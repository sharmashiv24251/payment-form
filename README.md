# Payment UI

A clean, interactive payment form built with Next.js 16, React 19, and Tailwind CSS. It handles card validation, real-time visual feedback, and keeps a persistent transaction history — all in the browser.

Built by [Shivansh Sharma](https://www.shivansh.pro).

---

## Setup

Make sure you have Node.js 18+ installed, then:

```bash
# Clone and install
git clone <repo-url>
cd test
bun install        # or npm install / yarn install

# Start dev server
bun dev            # runs on http://localhost:3000
```

That's it. No `.env` file needed, no database, no external services — everything runs locally.

**Other commands:**

```bash
bun run build      # production build
bun run start      # serve the production build
bun run lint       # run eslint
```

---

## What's in here

The project is split into a few folders, each with a clear job:

```
app/               → Next.js App Router entry points (layout, page, API routes)
components/        → All the UI pieces
constants/         → Config values that shouldn't be magic numbers in the code
store/             → Global state (Zustand)
types/             → TypeScript types shared across the app
utils/             → Pure helper functions
public/            → Static assets (card brand images, SVGs)
```

### components/

This is where most of the interesting stuff lives:

- **PaymentApp.tsx** — the root component, wires everything together
- **PaymentForm.tsx** — the main form with card number, expiry, CVV, and name fields. Handles real-time formatting and validation as you type
- **CardPreview.tsx** — the animated card that flips and updates live while you fill out the form
- **PaymentSection.tsx** — wraps the form and card preview side by side
- **TransactionHistory.tsx** — shows past transactions, pulled from the Zustand store

### constants/

Instead of scattering magic values everywhere, they live here:

- **card.ts** — card type patterns, lengths, CVV sizes
- **validation.ts** — regex patterns and rules for form fields
- **gateway.ts** — retry limits, timeout durations for the simulated gateway
- **currency.ts** — supported currencies and formatting config

### store/

Just one file: `transactionStore.ts`. Uses Zustand to keep transaction history alive across navigation without needing a backend.

### types/

TypeScript interfaces for cards, form state, payment results, and transactions. Nothing fancy, just keeps things from going sideways silently.

### utils/

- **card.ts** — detect card type from number, format the card number with spaces, validate Luhn
- **format.ts** — currency formatting, date helpers

---

## Stack

- **Next.js 16** + **React 19** — App Router, server components where it makes sense
- **TypeScript** — strict mode, no `any` escapes
- **Tailwind CSS v4** — utility classes, no custom CSS files except `globals.css`
- **Zustand** — lightweight global state for transactions

---

Made by Shivansh — [shivansh.pro](https://www.shivansh.pro)
