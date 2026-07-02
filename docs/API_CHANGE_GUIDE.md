# Jay Ambe PG API Change Guide

## Where API Calls Will Be Added

Current demo data is stored in localStorage. Replace these files first:

- `src/pgadmin/Utils/pgRequirementStore.js`
- `src/pgadmin/Utils/allocationHelper.js`
- `src/pgadmin/Utils/paymentHelper.js`
- `src/pgadmin/Utils/adminAuth.js`

## Recommended Node.js API Routes

Authentication:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Dashboard:

- `GET /api/dashboard/overview`
- `GET /api/action-center`

Properties:

- `GET /api/buildings`
- `POST /api/buildings`
- `POST /api/buildings/:id/floors`
- `GET /api/rooms`
- `POST /api/rooms`
- `PUT /api/rooms/:id`
- `DELETE /api/rooms/:id`
- `PUT /api/rooms/:id/layout`

Students and admissions:

- `GET /api/students`
- `POST /api/students`
- `PUT /api/students/:id`
- `GET /api/admissions`
- `POST /api/admissions`
- `PATCH /api/admissions/:id/approve`
- `PATCH /api/admissions/:id/reject`

Inquiries:

- `GET /api/inquiries`
- `POST /api/inquiries`
- `PUT /api/inquiries/:id`
- `PATCH /api/inquiries/:id/status`
- `POST /api/inquiries/import-csv`

Tickets:

- `GET /api/tickets`
- `POST /api/tickets`
- `PUT /api/tickets/:id`
- `PATCH /api/tickets/:id/status`

Payments and income:

- `GET /api/payments`
- `POST /api/payments`
- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/:id/pdf`
- `POST /api/payments/razorpay/order`
- `POST /api/payments/razorpay/verify`

Expenses:

- `GET /api/expenses`
- `POST /api/expenses`
- `DELETE /api/expenses/:id`

Reports:

- `GET /api/reports/income?format=excel|pdf`
- `GET /api/reports/expenses?format=excel|pdf`
- `GET /api/reports/profit?format=excel|pdf`
- `GET /api/reports/students?format=excel|pdf`
- `GET /api/reports/occupancy?format=excel|pdf`
- `GET /api/reports/inquiries?format=excel|pdf`
- `GET /api/reports/tickets?format=excel|pdf`
- `GET /api/reports/transfers?format=excel|pdf`

Calendar and messages:

- `GET /api/calendar/events`
- `POST /api/calendar/events`
- `GET /api/messages`
- `POST /api/messages/send`
- `POST /api/whatsapp/send-template`

Transfers:

- `GET /api/transfers`
- `POST /api/transfers`

Settings:

- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/validation-preferences`
- `PUT /api/validation-preferences`

## Frontend Files By Module

- Dashboard: `src/pgadmin/Pages/Dashboard/Dashboard.jsx`
- Action Center: `src/pgadmin/Pages/Requirements/ActionCenter.jsx`
- Properties: `src/pgadmin/Pages/Requirements/PropertyManagement.jsx`
- Calendar: `src/pgadmin/Pages/Requirements/CalendarOperations.jsx`
- Inquiries: `src/pgadmin/Pages/Requirements/Inquiries.jsx`
- Tickets: `src/pgadmin/Pages/Requirements/MaintenanceTickets.jsx`
- Income: `src/pgadmin/Pages/Requirements/PaymentOperations.jsx`
- Expenses: `src/pgadmin/Pages/Requirements/AccountingManagement.jsx`
- Reports: `src/pgadmin/Pages/Requirements/Reports.jsx`
- Transfers: `src/pgadmin/Pages/Requirements/TransferHistory.jsx`

## Validation

Validation is soft by default. Enable stricter validation from:

- React helper: `validateSoft` in `pgRequirementStore.js`
- MySQL table: `validation_preferences`

## Live Server Rule

React calls Node.js API only. Node.js API connects to MySQL.
