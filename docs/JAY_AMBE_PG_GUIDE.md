# Jay Ambe PG Implementation Guide

## Stack

- Frontend: React
- UI: existing Bootstrap template styles plus Tailwind utility classes for the imported PG admin
- Backend target: Node.js + Express
- Database: MySQL

## Main Entry Points

- `src/jsx/index.js`: existing Paying Guest app routes. The PG admin is mounted at `/pg/*`.
- `src/pgadmin/PgAdminRoutes.jsx`: all Jay Ambe PG routes.
- `src/pgadmin/Components/Layout/Sidebar.jsx`: PG admin menu links.
- `src/pgadmin/Utils/pgBrand.js`: PG name, short logo text, and `/pg` route helper.
- `src/pgadmin/Utils/pgRequirementStore.js`: temporary localStorage data layer. Replace this file with Node API calls when backend is ready.

## Modules

- Dashboard: `src/pgadmin/Pages/Dashboard/Dashboard.jsx`
- Property/building/floor/bed color guide: `src/pgadmin/Pages/Requirements/PropertyManagement.jsx`
- Rooms and room designer imported from pgadmin: `src/pgadmin/Pages/Rooms/*` and `src/pgadmin/Components/Rooms/*`
- Student profiles: `src/pgadmin/Pages/Students/StudentProfiles.jsx`
- Admissions: `src/pgadmin/Pages/Requirements/AdmissionManagement.jsx`
- Payment setup from imported pgadmin: `src/pgadmin/Pages/Payments/PaymentManagement.jsx`
- Hostel/PG payment operations and invoices: `src/pgadmin/Pages/Requirements/PaymentOperations.jsx`
- Accounting and expenses: `src/pgadmin/Pages/Requirements/AccountingManagement.jsx`
- Reports/export: `src/pgadmin/Pages/Requirements/Reports.jsx`
- WhatsApp automation: `src/pgadmin/Pages/Requirements/WhatsAppAutomation.jsx`
- Chat/message center: `src/pgadmin/Pages/Requirements/ChatMessageCenter.jsx`
- Inquiries and tickets: `src/pgadmin/Pages/Requirements/InquiryTicketCenter.jsx`
- Calendar operations: `src/pgadmin/Pages/Requirements/CalendarOperations.jsx`
- Staff roles: `src/pgadmin/Pages/Requirements/StaffManagement.jsx`
- Settings and soft validation preferences: `src/pgadmin/Pages/Requirements/SettingsPanel.jsx`

## Validation

Validation is intentionally soft. Forms call `validateSoft` from `src/pgadmin/Utils/pgRequirementStore.js`.

- Default: validation disabled.
- Enable later by setting `validation_enabled` in MySQL or `enabled` in localStorage preferences.
- Add strict checks in one place: `validateSoft`.

## MySQL

- Schema: `database/mysql/jay_ambe_pg_schema.sql`
- Database guide: `database/mysql/README.md`
- Environment example: `.env.example`

Important tables:

- `students`, `student_documents`, `admissions`
- `buildings`, `floors`, `rooms`, `room_items`, `allocations`
- `payments`, `payment_line_items`, `payment_settings`
- `expenses`, `invoices`, `invoice_items`
- `inquiries`, `support_tickets`
- `chat_threads`, `chat_messages`, `whatsapp_messages`
- `calendar_events`, `roles`, `admins`, `staff`

## Backend Replacement Plan

When Node.js API is ready:

1. Keep React components.
2. Replace localStorage functions in `src/pgadmin/Utils/pgRequirementStore.js`, `allocationHelper.js`, `paymentHelper.js`, and `adminAuth.js` with Axios calls.
3. Use `.env` value `REACT_APP_API_BASE_URL`.
4. Keep MySQL schema as the source of truth.

## Where To Change Common Items

- PG name/logo text: `src/pgadmin/Utils/pgBrand.js`
- Sidebar/menu: `src/pgadmin/Components/Layout/Sidebar.jsx`
- Add a new page route: `src/pgadmin/PgAdminRoutes.jsx`
- Add a database table: `database/mysql/jay_ambe_pg_schema.sql`
- Add a new local data collection: `src/pgadmin/Utils/pgRequirementStore.js`
- Payment methods/types: `src/pgadmin/Pages/Requirements/PaymentOperations.jsx`
- Expense categories: `src/pgadmin/Pages/Requirements/AccountingManagement.jsx`
- WhatsApp templates: MySQL `whatsapp_templates` table and `WhatsAppAutomation.jsx`
