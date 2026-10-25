# IFE Movement registration deployment checklist

The public landing page currently has **registration disabled**. The files in this directory prepare a separate secure API; they do not automatically activate collection.

1. Create a **separate Cloudflare D1 database** for campaign registrations; do not reuse IFE Invest V2's Supabase database.
2. Run `registration/schema.sql` in the D1 console.
3. Create a Cloudflare Turnstile widget for the campaign domain and record its **site key**; keep the **secret key** in Cloudflare encrypted Worker secrets.
4. Deploy `registration/worker.js` as a **separate Worker** with D1 binding named `DB`, secret `TURNSTILE_SECRET_KEY`, and variable `CORS_ORIGIN=https://ife-invest-movement.ltkouture.workers.dev`.
5. Publish an approved privacy notice specifying controller, contact email, purposes, retention, data-subject rights and deletion process before collecting personal data.
6. Add the registration form to the landing page, point it at the new Worker endpoint, embed the Turnstile site key, and test consent, spam rejection, duplicate submissions, and D1 inserts before removing the preview notice.
7. Export registrations only from the Cloudflare D1 dashboard using authorised access. Do not make the database publicly readable.

**Important:** No registration is currently collected. Do not advertise the page as an active waitlist until steps above are complete.
