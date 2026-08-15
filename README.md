# 9router Config Generator

Generate configuration files and one-command installers for 9router-compatible model gateways.

## Local development

```sh
bun install
bun run dev
```

## Quality checks

```sh
bun run verify
```

`verify` runs the production build, all tests, and ESLint. `bun run deploy` runs this validation before publishing the Worker.

## Deploy to Cloudflare Workers

This project deploys a Cloudflare Worker together with the Vite `dist/` assets. It is not a Cloudflare Pages project.

1. Enable **Workers** for the target Cloudflare account and configure its `workers.dev` subdomain.
2. Authenticate Wrangler locally, or create a least-privilege Cloudflare API token for CI with the **Edit Cloudflare Workers** template, restricted to the deployment account.
3. Run:

   ```sh
   bun run deploy
   ```

4. Open the deployed `https://9router-config-generate.<your-workers-subdomain>.workers.dev` URL and test both `/` and a generated `/i/<token>.sh` install link.

### Optional custom domain

After the first deployment, add a hostname in **Workers & Pages → 9router-config-generate → Settings → Domains & Routes → Add Custom Domain**. The Cloudflare zone must be active and the chosen hostname cannot already have a CNAME record. Cloudflare creates the DNS record and TLS certificate.

Do not protect the app or `/i/*` with Cloudflare Access if users must download install scripts via `curl` or PowerShell without signing in.

## Gateway CORS requirement

Models are requested directly from the Base URL entered by the user at `<gateway>/models`. This app does not proxy gateway requests through Cloudflare, so it works with any reachable gateway that permits cross-origin requests.

Configure each gateway to allow the deployed app origin and request headers:

```txt
Access-Control-Allow-Origin: https://<your-app-domain>
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
```

For a local 9router gateway, allow the deployed app domain in its CORS configuration. Cloudflare cannot access `localhost` on a visitor's computer, but the visitor's browser can when the gateway permits that origin.

## Cloudflare resources used

- Cloudflare Workers
- Workers Static Assets (`ASSETS` binding)
- Optional custom domain

No KV, D1, R2, Queue, Durable Object, or Worker secret is required.
