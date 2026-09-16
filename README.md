# Nestro

Nestro is a furniture storefront and commerce dashboard built with Next.js, Express and MongoDB. It supports guest and account carts, inventory-aware checkout, Razorpay payments, order management, customer support and transactional email.

## Implemented

- Real product-detail quantity, add-to-cart and buy-now actions; image gallery; wishlist; material/colour filters; variant links; delivery pincode check.
- Persistent guest cart, authenticated server cart, idempotent guest merge, revision conflict detection, session cleanup, consistent sale-price calculation and removable unavailable products.
- Server-calculated checkout totals, configurable shipping and included tax, coupon limits, physical stock reservations and order idempotency.
- Razorpay signature verification plus provider capture verification, signed webhook, repeat-payment protection, recovery of missing local gateway bindings, expired reservation cleanup and late-capture review.
- Customer order list/detail, resume payment, tracking, cancellation before shipment, return requests, reorder and printable order receipt. Shipping and billing details are saved as order snapshots.
- Admin order workflow, courier tracking entry, return approval/receipt, full online refunds and reconciliation, recorded manual COD refunds.
- Real admin dashboard, low-stock list, product edit and image removal, coupon management, review moderation, customer blocking/roles, support replies, business/shipping/policy settings.
- Hashed passwords with legacy Cryptr login migration; email OTP resend/attempt limits; password reset; verified email changes; session invalidation and authenticated admin routes.
- Verified-purchase reviews, contact tickets, newsletter confirmation/unsubscribe and stored marketing preferences. Order/support mail uses an outbox with retries.
- Dynamic policies/contact details, corrected links, sitemap/robots, mobile catalog filtering and one root HTML layout.

## Requirements

Use Node.js 22 LTS or later supported by the installed dependencies, npm, and **MongoDB Atlas or a MongoDB replica set**. Checkout and several account operations use MongoDB transactions. A standalone MongoDB server is not sufficient.

External accounts: Razorpay for online payment, Brevo for transactional mail, and Cloudinary for catalog uploads. Courier tracking is entered by an administrator; no courier API account is assumed.

## Local setup

1. Keep a separate database backup and your original ZIP. Do not point the updated API at an active production database while migrating.
2. In each of `backend` and `frontend`, run `npm ci`.
3. Copy `backend/.env.example` to `backend/.env`, and `frontend/.env.example` to `frontend/.env.local`. Enter your own configuration. Real environment credentials are excluded from this delivery.
4. Keep the **original CRYPTR_SECRET_KEY** if existing customers have encrypted passwords. Set a separate random JWT_SECRET (32+ characters) and OTP_SECRET. Successful legacy logins migrate passwords to scrypt. Customers whose old key is unavailable must reset their passwords through email.
5. Set MONGO_URI, Brevo and Cloudinary values. Keep FRONTEND_URL as your actual frontend origin. Browser API calls use Next's same-origin `/api` rewrite; API_BASE_URL points to the Express API and includes `/api`.
6. With API instances stopped, run `npm run migrate` in backend for a read-only report. After inspecting it and confirming your database backup, run `npm run migrate -- --apply`.
7. Start backend using `npm run dev`, and frontend in a second terminal using `npm run dev`.
8. Register and verify your account. Promote it locally: `node scripts/admin.js you@example.com superAdmin` from backend. Sign in again.
9. Open `/admin/products`. Enter **actual physical stock counts**. Legacy boolean stock flags cannot reliably tell how many units exist; the migration sets missing counts to zero.
10. Open `/admin/settings`. Set business/address/support details, shipping charges, included tax rate, delivery/return windows and serviceable pincodes. Blank pincodes mean all Indian pincodes. Supply and review your real policies, publish them, then enable “Accept new orders”.

## Migration behaviour

The migration defaults to dry-run. Apply mode requires a replica set. It creates required collections and indexes; legacy orders are marked with inventoryState=legacy so historical sales do not incorrectly restock new inventory. It adds missing cart revisions and physical stock fields.

Duplicate carts are backed up inside `nestro_migration_backup` before merging. The most recently updated cart wins for duplicate product quantities; distinct products are preserved. Invalid quantities are omitted from the merged cart and remain in the backup. More than 100 distinct merged products stops migration for manual resolution. Duplicate payment IDs or other unique-index conflicts also stop migration; investigate the data instead of removing uniqueness constraints.

Historical orders may lack titles, business snapshots, tax, delivery dates or gateway amounts. They remain visible with the information that exists. Do not guess historical tax/payment data. Review old pending orders manually. Pending OTPs from the old application should be replaced by requesting a new code.

Old browser cart data may belong to a previous signed-in account. It is preserved under a legacy backup storage key and is not automatically imported into another account. New guest carts merge on login.

## Payment configuration and operation

Set backend RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET and RAZORPAY_WEBHOOK_SECRET. Set frontend NEXT_PUBLIC_RAZORPAY_KEY_ID to the same public key. Use test credentials first.

Configure the provider webhook to `https://YOUR-API-HOST/api/order/webhook` (or the frontend proxy URL if it reliably preserves raw bytes). Configure captured/order-paid and refund events and automatic capture according to your provider settings. The handler validates the raw-body signature before processing.

An authorized payment is not treated as paid until capture is confirmed. Do not ship unpaid online orders. If payment initialization times out, look up the existing order before trying again. A background job checks expired 30-minute reservations every minute. During a gateway outage it keeps inventory reserved rather than making an unsupported assumption about payment state.

Payment captured after cancellation or stock release becomes “needs review” and requires a refund; it does not trigger fulfilment. Refunds are for the full order. A timeout leaves refund state “processing”; reconcile before any further provider action. Failed/ambiguous refunds require provider-side investigation. Partial refunds and item-by-item returns are not implemented.

If the customer changes the cart after starting payment, successful payment does not clear the changed cart. The order contains the original purchased snapshot.

## Email and support

Set `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (a verified sender in Brevo), and optionally `BREVO_SENDER_NAME` for registration, reset and newsletter confirmation. Run `npm run mail:verify` in backend to check API authentication; this does not send an email or verify the sender. The outbox retries order/support messages up to eight times. Admin dashboard shows exhausted jobs; inspect configuration and resolve delivery issues before launch.

Support replies are queued by an explicit administrator action in the application. Store marketing preference and newsletter double opt-in are implemented; a bulk marketing campaign sender is not included. Transactional order email remains enabled irrespective of marketing preference.

## Validation and remaining launch work

Automated checks cover the core backend services, frontend linting, production compilation and browser accessibility flows. They are not a substitute for staging acceptance with real provider sandbox accounts.

Before taking real orders, validate against your staging replica set and Razorpay test account: registration/email delivery, guest/account cart merge, two customers competing for the last item, duplicate checkout requests, failed/cancelled/captured payments and signed webhook delivery, status/returns/refunds, stock restoration and role restrictions. Verify desktop/mobile flows and accessibility in a real browser. Configure HTTPS, trusted proxy hops, backups, database monitoring and provider dashboards.

The printable document is an **order receipt**, not a legally certified GST tax invoice. The configured included tax rate is a single store rate; product-specific HSN/tax slabs, invoice numbering, e-invoicing and statutory/accounting integrations require your real business requirements.

Optional systems not assumed or fabricated: Google/Apple OAuth, SMS/WhatsApp, loyalty points, automatic shipping labels/courier booking, ERP/POS, multi-vendor, multi-currency, subscriptions and partial refunds. Dead social-login, rating and demo controls were removed or replaced with functional core flows. Existing About/marketing content should be checked by the store owner before publication.

## Production commands

Backend: `npm start` with NODE_ENV=production and managed process restart.
Frontend: `npm run build`, then `npm start`.
Set NEXT_PUBLIC_SITE_URL to the public HTTPS storefront URL before building.
Run migrations before starting production API instances; production automatic index creation is disabled.

Keep configuration private. If an original ZIP containing credentials was shared publicly, rotate those credentials with the respective provider.
