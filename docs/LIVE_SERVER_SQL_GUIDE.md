# Jay Ambe PG Live Server + MySQL Setup Guide

## 1. Project Stack

- Frontend: React
- Backend: Node.js + Express
- Database: MySQL 8+
- UI: Bootstrap template styles + Tailwind CSS utilities

## 2. Build React For Live Server

From the `payingguest` folder:

```bash
npm install
npm run build
```

Upload the `build` folder to your hosting server or serve it from Node.js.

## 3. Create MySQL Database

Schema file:

```text
database/mysql/jay_ambe_pg_schema.sql
```

The file is designed for live import and repeat import. It creates the database, drops old PG objects in dependency order, recreates tables/views, and seeds the default roles and super admin.

Import command:

```bash
mysql -u root -p < database/mysql/jay_ambe_pg_schema.sql
```

Database created:

```text
jay_ambe_pg 
```

## 4. Environment Variables

Copy `.env.example` to `.env` on the live server.

Important values:

```text
REACT_APP_API_BASE_URL=https://your-domain.com/api
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_DATABASE=jay_ambe_pg
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
```

## 5. Important Tables

- `pg_profiles`: PG name, settings, logo, reminder rules
- `roles`, `admins`, `admin_roles`: multi-role admin login and permissions
- `buildings`, `floors`, `rooms`, `room_items`: property, room, bed layout
- `students`, `student_documents`, `admissions`: student records and approval
- `allocations`: bed/table/cupboard assignments
- `payments`, `payment_line_items`, `payment_settings`: rent, deposits, late fees, extras
- `expenses`: electricity, salary, repairs, food, cleaning, maintenance
- `invoices`, `invoice_items`: invoice generation
- `inquiries`: lead pipeline
- `support_tickets`: maintenance tickets
- `calendar_events`: followups, renewals, admissions, payments
- `chat_threads`, `chat_messages`, `whatsapp_messages`: message records
- `send_action_logs`: download/send/export logs
- `visitors`, `gate_passes`, `attendance_records`: security, guest, and attendance work
- `food_menus`, `meal_attendance`, `food_stock`, `kitchen_inventory`: mess management
- `housekeeping_tasks`, `inventory_items`: cleaning, laundry, and module inventory
- `audit_logs`, `entity_history`: previous/current history for every important item

## 6. Database-First Rule

For live use, every create/update/delete/read must go through the API and MySQL. The React localStorage helpers are only a browser fallback for demo/development mode.

Use API endpoints for:

- Admins, roles, reset passwords, audit logs
- Students, guests, visitors, admissions, inquiries
- Rooms, beds, tables, cupboards, buildings, floors
- Payments, invoices, expenses, refunds, billing settings
- Maintenance, housekeeping, mess, inventory, attendance
- Reports, settings, database backup, system configuration

Every API write should also insert one row into `entity_history` or `audit_logs` with old values and new values.

## 7. First Login

Frontend route:

```text
/pg/login
```

Default local UI login:

```text
superadmin / admin123
```

For live backend, replace this with Node.js authentication using `admins` and `roles`.

## 8. Deployment Checklist

- Import MySQL schema.
- Configure `.env`.
- Build React.
- Deploy `build`.
- Start Node.js API.
- Point web server reverse proxy to Node API.
- Confirm `/pg/login` opens first.
- Confirm `/pg` dashboard opens after login.
- Confirm admin roles can be assigned with checkboxes.
- Confirm `/pg/admin/history` shows audit/history data.
- Test reports Excel/PDF download.
- Test payment receipt, expenses, inquiries, tickets, and calendar.
