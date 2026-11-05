# PPO Services AG website

The site is built with Next.js App Router and TypeScript. Localized pages are
available in German, English, French, Italian and Spanish under `/{locale}`.
The source content and locally stored PPO photography are in
[`src/data/ppo-content.json`](./src/data/ppo-content.json) and `public/ppo/`.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run typecheck` and `npm run build` to validate the application.

## Contact form delivery

The contact form validates submissions and optional attachments on the server,
then forwards them to the configured Formspree endpoint. Successful confirmation
is shown only after Formspree accepts the submission. Users are informed that
Formspree processes form data and linked to its privacy policy.

The endpoint is currently `https://formspree.io/f/mgaapzjr`, configured in
`src/app/api/contact/route.ts`.

Optional `CONTACT_HR_EMAIL` and `CONTACT_PROCUREMENT_EMAIL` environment variables
enable routing for submissions that include `department=hr` or
`department=procurement`. If the department is omitted or its destination is
not configured, the submission continues to use Formspree's default recipient.
The Formspree endpoint remains the delivery endpoint in either case.

Users can also contact PPO directly at `info@ppo.ch` or `+41 62 207 54 54`.

## Source fidelity

Product images remain associated with their original product records. The
captured catalogue, staff, news, company pages and translations reflect the
official PPO website when the local content snapshot was collected. Where the
official site has no published catalogue content or translation, the page
states that limitation and links to the source rather than inventing details.
