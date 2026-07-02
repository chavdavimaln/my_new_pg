# Jay Ambe PG MySQL Database

Use `jay_ambe_pg_schema.sql` for MySQL 8+.

Recommended backend:

- Node.js + Express
- MySQL database name: `jay_ambe_pg`
- Auth: bcrypt password hashing + JWT/session cookies
- File uploads: store photo, Aadhaar, invoice, QR images on disk/S3 and save paths in MySQL
- Payments: Razorpay order/payment IDs should be added to the `payments` table when gateway integration is enabled

Suggested API mapping:

- `GET /api/dashboard/overview`
- `GET|POST /api/buildings`, `GET|POST /api/rooms`
- `GET|POST /api/students`
- `GET|POST /api/admissions`, `PATCH /api/admissions/:id/approve`
- `GET|POST /api/allocations`
- `GET|POST /api/payments`
- `GET|POST /api/expenses`
- `GET /api/reports/:type`
- `GET|POST /api/whatsapp/messages`
- `GET|PUT /api/settings`

The current React implementation keeps data in `localStorage` so the project can run immediately. When the backend is ready, replace the helper calls in `src/pgadmin/Utils` with API calls that read/write these tables.
