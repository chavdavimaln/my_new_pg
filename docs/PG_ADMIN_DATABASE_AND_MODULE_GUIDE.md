# PG Admin Database And Module Guide

All PG admin modules should use MySQL through the API in live server mode. Browser `localStorage` helpers in `src/pgadmin/Utils` are fallback/demo storage only. Keep the same entity names so React pages can swap helper calls for service calls cleanly.

## Core Tables

- `admins`: `id`, `name`, `username`, `email`, `mobile`, `password_hash`, `active`, `last_login_at`, `created_at`, `updated_at`
- `roles`: `id`, `role_key`, `name`, `description`, `permissions`, `created_at`
- `admin_roles`: `admin_id`, `role_id`, `assigned_by`, `assigned_at`
- `buildings`: `id`, `name`, `address`, `created_at`, `updated_at`
- `floors`: `id`, `building_id`, `name`, `level`, `created_at`, `updated_at`
- `rooms`: `id`, `building_id`, `floor_id`, `room_number`, `room_type`, `status`, `width_feet`, `height_feet`, `canvas_width`, `canvas_height`, `layout_json`, `created_at`, `updated_at`
- `students`: `id`, `name`, `photo_url`, `phone`, `email`, `address`, `emergency_contact`, `id_proof_type`, `id_proof_number`, `joining_date`, `notes`, `created_at`, `updated_at`
- `allocations`: `id`, `student_id`, `room_id`, `bed_id`, `table_id`, `cupboard_id`, `check_in`, `check_out`, `status`, `created_at`, `updated_at`
- `payments`: `id`, `allocation_id`, `receipt_number`, `payment_type`, `payment_mode`, `status`, `due_date`, `paid_date`, `partial_amount`, `amount`, `charges_json`, `notes`, `created_at`, `updated_at`
- `expenses`: `id`, `category`, `vendor`, `amount`, `date`, `payment_mode`, `status`, `recurring`, `notes`, `created_at`, `updated_at`
- `maintenance_tickets`: `id`, `title`, `raised_by`, `category`, `priority`, `status`, `details`, `created_at`, `updated_at`
- `inquiries`: `id`, `name`, `phone`, `source`, `room_preference`, `budget`, `follow_up`, `status`, `requirement`, `created_at`, `updated_at`
- `chat_threads`: `id`, `contact_name`, `phone`, `channel`, `created_at`, `updated_at`
- `chat_messages`: `id`, `thread_id`, `sender`, `text`, `status`, `attachment_url`, `attachment_name`, `created_at`, `updated_at`
- `calendar_events`: `id`, `title`, `type`, `date`, `assigned_to`, `notes`, `status`, `google_event_id`, `created_at`, `updated_at`
- `transfer_history`: `id`, `student_id`, `student_name`, `action`, `from_room`, `to_room`, `reason`, `date`, `created_at`
- `visitors`, `gate_passes`, `attendance_records`: security, visitor approval, entry/exit, night attendance
- `food_menus`, `meal_attendance`, `food_stock`, `kitchen_inventory`: mess manager workflows
- `housekeeping_tasks`: cleaning requests, room cleaning, laundry status
- `audit_logs`, `entity_history`: old/new snapshots and admin action logs for every module

## API Mapping

- Replace `getBuildings/saveBuildings` with `GET/POST/PUT/DELETE /api/buildings` and `/api/buildings/:id/floors`.
- Replace room helpers with `/api/rooms`; store beds, tables, cupboards, and doors in `layout_json`.
- Replace payment helpers with `/api/payments` and `/api/payment-settings`.
- Replace requirement store helpers with module endpoints: `/api/expenses`, `/api/tickets`, `/api/inquiries`, `/api/messages`, `/api/calendar-events`, `/api/transfers`.
- Store message attachments on the backend or object storage and save only metadata plus URL in `chat_messages`.
- For every API write, insert previous/current JSON into `entity_history` and admin action metadata into `audit_logs`.

## Google Calendar

The UI opens Google Calendar's event creation page with prefilled data. For real sync, add OAuth, store `google_event_id`, and call Google Calendar API on create/update/delete.
