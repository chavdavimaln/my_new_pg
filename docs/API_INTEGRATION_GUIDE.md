 # Jay Ambe PG API Integration Guide

## 1. Where React Reads Data Today

Temporary browser storage helpers are here:

```text
src/pgadmin/Utils/pgRequirementStore.js
src/pgadmin/Utils/allocationHelper.js
src/pgadmin/Utils/paymentHelper.js
src/pgadmin/Utils/adminAuth.js
```

For live server use, replace localStorage reads/writes in these files with API calls. See `docs/DATABASE_API_USAGE_GUIDE.md` for the full table and endpoint map.

## 2. API Base URL

Set this in `.env`:

```text
REACT_APP_API_BASE_URL=https://your-domain.com/api
```

Create an Axios client in:

```text
src/pgadmin/Utils/apiClient.js
```

Recommended client:

```js
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

export default apiClient;
```

The project now includes this client at:

```text
src/pgadmin/Utils/apiClient.js
```

## 3. Required API Routes

Authentication:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Dashboard:

- `GET /dashboard/overview`
- `GET /action-center`

Properties:

- `GET /buildings`
- `POST /buildings`
- `GET /floors?buildingId=`
- `POST /floors`
- `GET /rooms`
- `POST /rooms`
- `PUT /rooms/:id`
- `DELETE /rooms/:id`
- `PUT /rooms/:id/layout`

Students and admissions:

- `GET /students`
- `POST /students`
- `PUT /students/:id`
- `GET /admissions`
- `POST /admissions`
- `PATCH /admissions/:id/approve`
- `PATCH /admissions/:id/reject`

Allocations and transfers:

- `GET /allocations`
- `POST /allocations`
- `PUT /allocations/:id`
- `POST /transfers`
- `GET /transfers`

Payments, income, invoices:

- `GET /payments`
- `POST /payments`
- `GET /payment-settings`
- `PUT /payment-settings`
- `GET /invoices`
- `POST /invoices`
- `GET /invoices/:id/pdf`

Income / Payments full workspace:

- `GET /income/dashboard`
- `GET /income/fee-structures`
- `PUT /income/fee-structures/:id`
- `GET /income/pricing-plans`
- `PUT /income/pricing-plans/:id`
- `POST /income/payment-orders`
- `GET /income/payment-orders`
- `POST /income/collections`
- `GET /income/pending-payments`
- `POST /income/reminders`
- `POST /income/messages/send-email`
- `POST /income/messages/send-whatsapp`
- `GET /income/message-logs`
- `GET /income/security-deposits`
- `POST /income/refunds`
- `GET /income/discounts`
- `POST /income/discounts`
- `POST /income/calculate-payment`
- `GET /income/penalty-rules`
- `GET /income/staff-salaries`
- `PUT /income/staff-salaries/:staffId`
- `POST /income/online-payments`
- `GET /income/reports/payment-method-wise`

See:

```text
docs/INCOME_PAYMENT_API_AND_DATABASE.md
database/mysql/income_payment_schema.sql
```

Expenses:

- `GET /expenses`
- `POST /expenses`
- `DELETE /expenses/:id`

Inquiries:

- `GET /inquiries`
- `POST /inquiries`
- `PUT /inquiries/:id`
- `POST /inquiries/import-csv`

Tickets:

- `GET /tickets`
- `POST /tickets`
- `PUT /tickets/:id`

Calendar:

- `GET /calendar-events`
- `POST /calendar-events`
- `PUT /calendar-events/:id`

Reports:

- `GET /reports/income?format=excel|pdf`
- `GET /reports/expenses?format=excel|pdf`
- `GET /reports/profit?format=excel|pdf`
- `GET /reports/students?format=excel|pdf`
- `GET /reports/occupancy?format=excel|pdf`
- `GET /reports/inquiries?format=excel|pdf`
- `GET /reports/tickets?format=excel|pdf`
- `GET /reports/transfers?format=excel|pdf`

Messages:

- `GET /messages`
- `POST /messages`
- `POST /whatsapp/send`

Settings:

- `GET /settings`
- `PUT /settings`
- `GET /validation-preferences`
- `PUT /validation-preferences`

Admins and history:

- `GET /roles`
- `GET /admins`
- `POST /admins`
- `PUT /admins/:id`
- `DELETE /admins/:id`
- `POST /admins/:id/reset-password`
- `PUT /admins/:id/roles`
- `GET /history`
- `GET /history/:entityType/:entityId`
- `GET /audit-logs`
- `POST /database/backup`

## 4. Which Files To Edit For Each Module

- Dashboard: `src/pgadmin/Pages/Dashboard/Dashboard.jsx`
- Action Center: `src/pgadmin/Pages/Requirements/ActionCenter.jsx`
- Properties: `src/pgadmin/Pages/Requirements/PropertyManagement.jsx`
- Students: `src/pgadmin/Pages/Students/StudentProfiles.jsx`
- Inquiries: `src/pgadmin/Pages/Requirements/Inquiries.jsx`
- Tickets: `src/pgadmin/Pages/Requirements/MaintenanceTickets.jsx`
- Income: `src/pgadmin/Pages/Requirements/PaymentOperations.jsx`
- Expenses: `src/pgadmin/Pages/Requirements/AccountingManagement.jsx`
- Reports: `src/pgadmin/Pages/Requirements/Reports.jsx`
- Transfers: `src/pgadmin/Pages/Requirements/TransferHistory.jsx`
- Calendar: `src/pgadmin/Pages/Requirements/CalendarOperations.jsx`
- Messages: `src/pgadmin/Pages/Requirements/ChatMessageCenter.jsx`
- Routes: `src/pgadmin/PgAdminRoutes.jsx`
- Sidebar: `src/pgadmin/Components/Layout/Sidebar.jsx`

## 5. Validation

Validation is soft by default.

Edit:

```text
src/pgadmin/Utils/pgRequirementStore.js
```

Function:

```text
validateSoft(values, rules)
```

When strict validation is required, enable validation preferences from settings or backend.
