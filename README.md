# DerivPredictAI

A simple starter landing page and subscription prototype for the DerivPredictAI project.

## Included in this starter

- Landing page with trading-focused branding
- Pricing cards for Starter, Pro, and Elite plans
- Demo premium access toggle
- Stripe-style checkout links ready to replace with your real Stripe URLs
- Clean responsive HTML/CSS/JS structure

## Run locally

From the project root:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Notes for production

- Replace the demo Stripe links in `script.js` with your real Stripe checkout links.
- Add a real authentication provider if you want user-based access control.
- For a real subscription backend, connect to a service like Stripe + Supabase/Firebase.
- If you deploy to GitHub Pages, keep in mind that static hosting cannot provide secure user login by itself unless paired with an auth backend.

## Project files

- `index.html`
- `style.css`
- `script.js`

This is a front-end starter for a subscription-based trading signals product and should be expanded with a real backend before being used in production.
