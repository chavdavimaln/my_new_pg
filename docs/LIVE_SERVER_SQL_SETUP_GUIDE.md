# Jay Ambe PG Live Server + MySQL Setup Guide

## Required Stack

- Node.js
- React
- MySQL 8+
- Bootstrap
- Tailwind CSS

## Frontend Build

1. Open terminal in `payingguest`.
2. Install dependencies:
   `npm install`
3. Build React:
   `npm run build`
4. Upload the `build` folder to your live hosting panel or serve it using Node/Nginx/Apache.

## MySQL Setup

1. Create a MySQL database on the live server.
2. Recommended database name: `jay_ambe_pg`.
3. Import this SQL file:
   `database/mysql/jay_ambe_pg_schema.sql`
4. Confirm these important tables exist:
   `students`, `admissions`, `buildings`, `floors`, `rooms`, `room_items`, `allocations`, `payments`, `expenses`, `inquiries`, `support_tickets`, `invoices`, `calendar_events`, `staff`, `roles`, `admins`.

## Environment Variables

Create `.env` from `.env.example`.

Required values:

- `REACT_APP_API_BASE_URL`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_DATABASE`
- `MYSQL_USER`
- `MYSQL_PASSWORD`

Optional payment/message values:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `WHATSAPP_PROVIDER`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

## Login

Frontend local-storage demo login:

- Username: `superadmin`
- Password: `admin123`

Live backend login should use the `admins` table with bcrypt password hashes.

## Important URLs

- `/` redirects to `/pg/login`
- `/pg/login` is the PG login page
- `/pg` is the main dashboard

## Deployment Notes

- Browser React code must not connect directly to MySQL.
- Create a Node.js API between React and MySQL.
- Replace localStorage helper functions in `src/pgadmin/Utils` with API calls when the backend is ready.
- Keep uploaded files outside React source, then save paths in MySQL.
