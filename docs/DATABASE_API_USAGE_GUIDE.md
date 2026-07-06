# Jay Ambe PG Database And API Usage Guide

## Goal

For production/live server use, the whole project must store and read data from MySQL through an API. Browser `localStorage` is only a fallback for demo mode while the backend is not running.

## Import SQL

Use this file:

```text
database/mysql/jay_ambe_pg_schema.sql
```

For the complete Income / Payments workspace, also import:

```text
database/mysql/income_payment_schema.sql
```

Command:

```bash
mysql -u your_mysql_user -p < database/mysql/jay_ambe_pg_schema.sql
mysql -u your_mysql_user -p < database/mysql/income_payment_schema.sql
```

The schema creates:

- Multi-role admins: `roles`, `admins`, `admin_roles`
- PG modules: rooms, students, guests, payments, invoices, expenses, tickets, messages, calendar, reports
- Operational modules: visitors, gate passes, attendance, mess, housekeeping, inventory
- History: `audit_logs`, `entity_history`

## React API Client

Use:

```text
src/pgadmin/Utils/apiClient.js
```

Set this in `.env`:

```text
REACT_APP_API_BASE_URL=https://your-domain.com/api
```

## Replace Local Helpers With API Calls

Current fallback helpers:

```text
src/pgadmin/Utils/adminAuth.js
src/pgadmin/Utils/allocationHelper.js
src/pgadmin/Utils/paymentHelper.js
src/pgadmin/Utils/pgRequirementStore.js
```

Production APIs should replace these helper reads/writes.

## Required API Modules

Admins and roles:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /roles`
- `GET /admins`
- `POST /admins`
- `PUT /admins/:id`
- `DELETE /admins/:id`
- `POST /admins/:id/reset-password`
- `PUT /admins/:id/roles`
- Tables: `admins`, `roles`, `admin_roles`, `audit_logs`, `entity_history`

Properties and rooms:

- `GET /buildings`
- `POST /buildings`
- `PUT /buildings/:id`
- `DELETE /buildings/:id`
- `GET /rooms`
- `POST /rooms`
- `PUT /rooms/:id`
- `DELETE /rooms/:id`
- `PUT /rooms/:id/layout`
- Tables: `buildings`, `floors`, `rooms`, `room_items`, `entity_history`

Students, guests, admissions:

- `GET /students`
- `POST /students`
- `PUT /students/:id`
- `DELETE /students/:id`
- `GET /admissions`
- `POST /admissions`
- `PATCH /admissions/:id/approve`
- `PATCH /admissions/:id/reject`
- `GET /inquiries`
- `POST /inquiries`
- `PUT /inquiries/:id`
- Tables: `students`, `student_documents`, `admissions`, `inquiries`, `entity_history`

Allocations and transfers:

- `GET /allocations`
- `POST /allocations`
- `PUT /allocations/:id`
- `POST /transfers`
- `GET /transfers`
- Tables: `allocations`, `entity_history`

Payments, billing, invoices:

- `GET /payment-settings`
- `PUT /payment-settings`
- `GET /payments`
- `POST /payments`
- `PUT /payments/:id`
- `GET /invoices`
- `POST /invoices`
- `GET /invoices/:id/pdf`
- Tables: `payment_settings`, `payments`, `payment_line_items`, `invoices`, `invoice_items`, `entity_history`

Income / Payments full module:

- `GET /income/dashboard`
- `GET /income/fee-structures`
- `PUT /income/fee-structures/:id`
- `GET /income/pricing-plans`
- `POST /income/payment-orders`
- `GET /income/payment-orders`
- `POST /income/collections`
- `GET /income/pending-payments`
- `POST /income/reminders`
- `POST /income/messages/send-email`
- `POST /income/messages/send-whatsapp`
- `GET /income/security-deposits`
- `POST /income/refunds`
- `GET /income/discounts`
- `POST /income/discounts`
- `POST /income/calculate-payment`
- `GET /income/penalty-rules`
- `GET /income/staff-salaries`
- `PUT /income/staff-salaries/:staffId`
- `POST /income/online-payments`
- `GET /income/reports/monthly`
- Tables: `payment_fee_structures`, `payment_pricing_plans`, `payment_charge_catalog`, `income_payment_orders`, `income_payment_order_items`, `income_payment_collections`, `payment_gateways`, `online_payment_transactions`, `staff_salary_setups`, `security_deposit_ledger`, `refund_requests`, `discount_rules`, `payment_penalty_rules`, `payment_reminders`, `payment_message_templates`, `payment_message_logs`
- Full docs: `docs/INCOME_PAYMENT_API_AND_DATABASE.md`

Expenses and reports:

- `GET /expenses`
- `POST /expenses`
- `PUT /expenses/:id`
- `DELETE /expenses/:id`
- `GET /reports/:type?format=pdf|excel|json`
- Tables: `expenses`, reporting views, `entity_history`

Operations:

- `GET /tickets`, `POST /tickets`, `PUT /tickets/:id`
- `GET /visitors`, `POST /visitors`, `PUT /visitors/:id`
- `GET /gate-passes`, `POST /gate-passes`, `PUT /gate-passes/:id`
- `GET /attendance`, `POST /attendance`
- `GET /mess/menu`, `POST /mess/menu`
- `GET /mess/stock`, `POST /mess/stock`, `PUT /mess/stock/:id`
- `GET /housekeeping`, `POST /housekeeping`, `PUT /housekeeping/:id`
- Tables: `support_tickets`, `visitors`, `gate_passes`, `attendance_records`, `food_menus`, `meal_attendance`, `food_stock`, `kitchen_inventory`, `housekeeping_tasks`

Settings, backup, history:

- `GET /settings`
- `PUT /settings`
- `GET /history`
- `GET /history/:entityType/:entityId`
- `GET /audit-logs`
- `POST /database/backup`
- Tables: `pg_profiles`, `validation_preferences`, `audit_logs`, `entity_history`

## History Rule

For every create, update, delete, approval, rejection, transfer, payment status change, password reset, role assignment, settings change, and backup action:

1. Read the old row before changing it.
2. Save the new row.
3. Insert old/new JSON into `entity_history`.
4. Insert action metadata into `audit_logs` for admin/system actions.

This is how old/previous history remains visible for students, guests, persons, admins, staff, rooms, payments, settings, and all other PG/Hostel records.
