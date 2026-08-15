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

## Production model proxy

The browser first requests `<gateway>/models` directly. If that gateway does not allow CORS, the app falls back to `/api/fetch-models` on the Worker.

The Worker proxy is disabled by default and only accepts HTTPS gateway origins explicitly allowlisted through `MODEL_PROXY_ALLOWED_ORIGINS`. This prevents the public endpoint from becoming an open proxy.

Configure it in **Workers & Pages → 9router-config-generate → Settings → Variables and Secrets** as a plaintext variable:

```txt
MODEL_PROXY_ALLOWED_ORIGINS=https://router.example.com,https://backup-router.example.com
```

Each value must be an HTTPS origin only: no path, query string, credentials, or wildcard. Deploy again after changing the variable.

> A Cloudflare Worker cannot reach `localhost` on a visitor's computer. For a local 9router gateway, configure that gateway's CORS policy to allow the deployed app origin instead. Use the Worker proxy only for publicly reachable HTTPS gateways.

The proxy forwards the API key supplied by the user for the single `/models` request. It does not store, log, or cache the key. Do not configure a shared 9router API key as a Worker variable or secret.

## Cloudflare resources used

- Cloudflare Workers
- Workers Static Assets (`ASSETS` binding)
- Optional custom domain
- Optional plaintext variable: `MODEL_PROXY_ALLOWED_ORIGINS`

No KV, D1, R2, Queue, Durable Object, or Worker secret is required.
