# Link Marketing Services Website

Production marketing site for Link Marketing Services. The app is a Vite/React single-page application with route-specific SEO, PPC attribution, consent-gated measurement, and a secure Vercel lead-intake relay.

## Local development

```bash
npm install
npm run dev
```

Before handoff or deployment:

```bash
npm run build
npm run lint
```

## Vercel setup

The public brand is **Link Marketing Services**, operated as a DBA of **Link Marketing Solutions**. The production website is intended to run at `https://linkmarketingservices.com`.

Connect the GitHub repository to Vercel and keep the standard Vite build settings:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

The included `vercel.json` provides canonical-host redirects, exact SPA route rewrites, long-lived asset caching, real server 404s for unknown paths, and baseline security headers.

Copy `.env.example` into Vercel Environment Variables. Server-only values must never use the `VITE_` prefix.

Required before accepting production leads:

- `LEAD_WEBHOOK_URL`: private server-to-server destination for validated lead JSON
- `LEAD_WEBHOOK_TOKEN`: optional bearer token expected by that destination
- `ALLOWED_ORIGINS`: comma-separated production origins

Optional marketing configuration:

- `VITE_SITE_URL`: canonical production origin
- `VITE_GOOGLE_TAG_ID`: GA4 or Google tag ID
- `VITE_GOOGLE_ADS_CONVERSION_ID`: Google Ads conversion ID
- `VITE_GOOGLE_ADS_LEAD_LABEL`: lead conversion label
- `VITE_CUSTOMER_PORTAL_SIGN_IN_URL`: customer sign-in page
- `VITE_AGENT_PORTAL_SIGN_IN_URL`: agent/CRM sign-in page

## SEO controls

- Route metadata, canonical tags, robots directives, Open Graph, Twitter cards, Organization/WebSite/Service/Breadcrumb/FAQ schema: `src/components/site/SEO.jsx`
- XML sitemap: `public/sitemap.xml`
- Crawler rules: `public/robots.txt`
- Branded social image and favicons: `public/brand/`
- Public marketing routes do not wait for authentication checks.
- Campaign query parameters are excluded from canonical URLs.

When adding a public route, add it to all three places: `src/App.jsx`, the metadata map in `SEO.jsx`, and `public/sitemap.xml`. Add a matching exact rewrite in `vercel.json`.

## PPC and conversion measurement

`src/lib/marketing.js` captures first- and last-touch UTM parameters and supported click IDs. The program-review form includes attribution in its server payload. Optional Google measurement loads only after consent. CTA clicks, page views, and successful lead submissions emit vendor-neutral data-layer events.

The form posts to `/api/lead` by default. The server function validates method, origin, content type, payload size, required fields, email format, form age, honeypot status, and request rate before forwarding data. It never exposes the webhook URL or token to the browser and never reports success unless the delivery endpoint accepts the lead.

## Launch checklist

1. Confirm the canonical production domain in `VITE_SITE_URL` and Vercel Domains.
2. Set the required lead-delivery variables and send a real internal test lead.
3. Set portal production sign-in URLs.
4. Add Google tag and Ads conversion values, then verify in Tag Assistant and Google Ads diagnostics.
5. Verify `/robots.txt`, `/sitemap.xml`, a valid route, and an invalid route on the production hostname.
6. Submit the sitemap in Google Search Console.
7. Test desktop and mobile navigation, images, form validation, consent choices, and the thank-you state.
8. Complete legal review of privacy, communications, and advertising claims before launch.
