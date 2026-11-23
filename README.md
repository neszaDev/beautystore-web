# beautystore-web

Storefront and admin UI for a Thailand-first, Thai/English cosmetics and skincare store (working name **GLOW POP**, provisional).

- **Stack:** Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS v4, pnpm.
- **Backend:** the API, platform infrastructure and project documentation live in [beautystore-api](https://github.com/neszaDev/beautystore-api).

## How it fits together
This app is the only client of the API, acting as a backend-for-frontend:
- **Server Components** read data through `src/lib/api.ts`.
- **Mutations** are Server Actions.
- **The session** (JWT), guest cart and guest order handles live in HttpOnly cookies. The browser never calls the API directly.
- **Two route handlers exist:** a payment-webhook relay (`/api/webhooks/payments/[provider]`) and a media proxy (`/media/*`).

## Features
- **Storefront** (`/th`, `/en`):
  - home, category and search listings with filters, sorting and pagination;
  - product pages with a gallery, shade/size selector and stock status;
  - cart drawer and page, coupons, checkout with Thai address fields;
  - PromptPay QR or card payment, and an order page that polls for confirmed payment;
  - account, addresses, order history with tracking, wishlist, sign-in and registration, password reset;
  - placeholder help and policy pages.
- **SEO:** per-locale metadata, canonical and hreflang, sitemap, robots, Product JSON-LD.
- **Admin** (`/admin`): dashboard, products (Thai/English content, variants, media), categories, inventory, orders (fulfilment and tracking), promotions, shipping methods, customers.

## Quick start
Start the API first (see [beautystore-api](https://github.com/neszaDev/beautystore-api): `make setup && make dev`), then:
```bash
cp .env.local.example .env.local   # API_INTERNAL_URL=http://localhost:8081
pnpm install
pnpm dev                            # http://localhost:3000 · admin: /admin
```
Demo admin login (local only): `admin@example.test` / `local-admin-password`.

## Configuration (server-only; nothing reaches the browser)
| Variable | Purpose |
|---|---|
| `API_INTERNAL_URL` | Base URL of the API (internal network in Azure) |
| `SITE_URL` | Public origin used for canonical URLs, sitemap and robots |
| `APP_ENV` | `local` \| `test` \| `dev` \| `staging` \| `prod`. The mock-payment page exists only in local/test |
| `SESSION_COOKIE_SECURE` | `false` only for plain-http localhost |

## Scripts
| | |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | develop / production build / serve |
| `pnpm lint` / `pnpm typecheck` | ESLint / `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm e2e` | Playwright end-to-end. Needs the API (`make dev` in beautystore-api) and this app running; `E2E_BASE_URL` defaults to `http://localhost:3000` |

## Layout
```
src/app/[locale]/   storefront routes (th/en)
src/app/admin/      admin routes
src/features/       catalog, cart, checkout, order, account, auth, admin
src/lib/            API client, session cookies, env validation, money/date formatting, contract types
src/i18n/           Thai and English dictionaries (key parity tested)
src/components/     shared UI (header/footer, drawer, form fields, starburst, swatches, product image)
public/demo/        mock product photos for the demo data (not real products)
tests/e2e/          Playwright specs
```

## CI/CD
- **`ci`:** lint, type check, unit tests and production build. It then checks out beautystore-api, starts it with demo data, and runs the E2E suite.
- **`deploy`:** manual and approval-gated. It builds the image, pushes it to Azure Container Registry, and updates the Container App. Infrastructure is deployed from beautystore-api.

## Status
The design is **provisional**: there is no approved brand or Stitch design yet. Product photos are mocks. See the launch blockers in [beautystore-api/docs/implementation-plan.md](https://github.com/neszaDev/beautystore-api/blob/main/docs/implementation-plan.md).
