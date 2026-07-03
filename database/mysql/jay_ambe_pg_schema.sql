-- Jay Ambe PG MySQL schema
-- Import with:
-- mysql -u root -p < database/mysql/jay_ambe_pg_schema.sql

CREATE DATABASE IF NOT EXISTS jay_ambe_pg
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE jay_ambe_pg;

SET FOREIGN_KEY_CHECKS = 0;
DROP VIEW IF EXISTS vw_financial_summary;
DROP VIEW IF EXISTS vw_occupancy_summary;
DROP TABLE IF EXISTS entity_history;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS housekeeping_tasks;
DROP TABLE IF EXISTS kitchen_inventory;
DROP TABLE IF EXISTS food_stock;
DROP TABLE IF EXISTS meal_attendance;
DROP TABLE IF EXISTS food_menus;
DROP TABLE IF EXISTS gate_passes;
DROP TABLE IF EXISTS attendance_records;
DROP TABLE IF EXISTS visitors;
DROP TABLE IF EXISTS inventory_items;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS chat_threads;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS inquiries;
DROP TABLE IF EXISTS whatsapp_messages;
DROP TABLE IF EXISTS whatsapp_templates;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS payment_line_items;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS payment_settings;
DROP TABLE IF EXISTS allocations;
DROP TABLE IF EXISTS admissions;
DROP TABLE IF EXISTS student_documents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS room_items;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS floors;
DROP TABLE IF EXISTS buildings;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS admin_roles;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS calendar_events;
DROP TABLE IF EXISTS validation_preferences;
DROP TABLE IF EXISTS send_action_logs;
DROP TABLE IF EXISTS pg_profiles;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE pg_profiles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    short_name VARCHAR(20) NOT NULL DEFAULT 'JA',
    address TEXT NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(150) NULL,
    logo_path VARCHAR(255) NULL,
    rent_cycle ENUM('Monthly', 'Quarterly', 'Yearly') NOT NULL DEFAULT 'Monthly',
    reminder_days INT NOT NULL DEFAULT 5,
    deposit_rule VARCHAR(255) NULL,
    late_fee_rule VARCHAR(255) NULL,
    whatsapp_provider VARCHAR(80) NOT NULL DEFAULT 'Meta WhatsApp Business API',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    role_key VARCHAR(80) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    permissions JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admins (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NULL UNIQUE,
    mobile VARCHAR(30) NULL,
    password_hash VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE admin_roles (
    admin_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_by BIGINT UNSIGNED NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (admin_id, role_id),
    CONSTRAINT fk_admin_role_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_admin_role_assigned_by FOREIGN KEY (assigned_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE staff (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(150) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_staff_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE buildings (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    address TEXT NULL,
    floors_count INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE floors (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    building_id BIGINT UNSIGNED NOT NULL,
    floor_number INT NOT NULL,
    floor_name VARCHAR(120) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_building_floor (building_id, floor_number),
    CONSTRAINT fk_floor_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE
);

CREATE TABLE rooms (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    building_id BIGINT UNSIGNED NULL,
    floor_id BIGINT UNSIGNED NULL,
    room_number VARCHAR(50) NOT NULL,
    room_name VARCHAR(120) NULL,
    room_type VARCHAR(80) NULL,
    bed_count INT NOT NULL DEFAULT 0,
    rent_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    attached_washroom BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('Available', 'Partially Occupied', 'Occupied', 'Reserved', 'Under Maintenance') NOT NULL DEFAULT 'Available',
    canvas_width INT NOT NULL DEFAULT 720,
    canvas_height INT NOT NULL DEFAULT 480,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_room_number (room_number),
    CONSTRAINT fk_room_building FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE SET NULL,
    CONSTRAINT fk_room_floor FOREIGN KEY (floor_id) REFERENCES floors(id) ON DELETE SET NULL
);

CREATE TABLE room_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    room_id BIGINT UNSIGNED NOT NULL,
    item_type ENUM('bed', 'table', 'cupboard', 'door') NOT NULL,
    label VARCHAR(50) NOT NULL,
    x_position INT NOT NULL DEFAULT 0,
    y_position INT NOT NULL DEFAULT 0,
    width INT NULL,
    height INT NULL,
    status ENUM('Available', 'Occupied', 'Payment Pending', 'Reserved', 'Maintenance') NOT NULL DEFAULT 'Available',
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_item_type (room_id, item_type),
    CONSTRAINT fk_room_item_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NULL,
    address TEXT NULL,
    dob DATE NULL,
    emergency_contact VARCHAR(80) NULL,
    admission_date DATE NULL,
    rent_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('Active', 'Inactive', 'Pending', 'Left') NOT NULL DEFAULT 'Active',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_phone (phone)
);

CREATE TABLE student_documents (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    document_type ENUM('Photo', 'Aadhaar', 'ID Proof', 'Other') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_document_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE admissions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NULL,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    address TEXT NULL,
    dob DATE NULL,
    emergency_contact VARCHAR(80) NULL,
    room_preference VARCHAR(120) NULL,
    expected_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    photo_path VARCHAR(255) NULL,
    aadhaar_path VARCHAR(255) NULL,
    accepted_terms BOOLEAN NOT NULL DEFAULT FALSE,
    digital_signature VARCHAR(255) NULL,
    admission_link VARCHAR(255) NULL,
    status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
    approved_by BIGINT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_admission_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    CONSTRAINT fk_admission_admin FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE allocations (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    room_id BIGINT UNSIGNED NOT NULL,
    bed_item_id BIGINT UNSIGNED NULL,
    table_item_id BIGINT UNSIGNED NULL,
    cupboard_item_id BIGINT UNSIGNED NULL,
    check_in DATE NULL,
    check_out DATE NULL,
    payment_status ENUM('Paid', 'Pending', 'Overdue') NOT NULL DEFAULT 'Pending',
    status ENUM('Active', 'Transferred', 'Vacated') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_allocation_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_allocation_bed FOREIGN KEY (bed_item_id) REFERENCES room_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_allocation_table FOREIGN KEY (table_item_id) REFERENCES room_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_allocation_cupboard FOREIGN KEY (cupboard_item_id) REFERENCES room_items(id) ON DELETE SET NULL
);

CREATE TABLE payment_settings (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    pg_profile_id BIGINT UNSIGNED NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    fee_structure JSON NOT NULL,
    razorpay_key_id VARCHAR(120) NULL,
    upi_id VARCHAR(120) NULL,
    qr_image_path VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_setting_profile FOREIGN KEY (pg_profile_id) REFERENCES pg_profiles(id) ON DELETE CASCADE
);

CREATE TABLE payments (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    allocation_id BIGINT UNSIGNED NULL,
    receipt_number VARCHAR(80) NOT NULL UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    payment_cycle ENUM('Monthly', 'Quarterly', 'Yearly', 'One Time') NOT NULL DEFAULT 'Monthly',
    payment_method ENUM('Cash', 'UPI', 'QR', 'Razorpay', 'Gateway', 'Bank Transfer') NOT NULL DEFAULT 'UPI',
    status ENUM('Paid', 'Pending', 'Overdue', 'Failed') NOT NULL DEFAULT 'Pending',
    due_date DATE NULL,
    paid_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_payment_student_status (student_id, status),
    CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_allocation FOREIGN KEY (allocation_id) REFERENCES allocations(id) ON DELETE SET NULL
);

CREATE TABLE payment_line_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    payment_id BIGINT UNSIGNED NOT NULL,
    label VARCHAR(150) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    rate DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_payment_line_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE CASCADE
);

CREATE TABLE expenses (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    category ENUM('Electricity', 'Water', 'Internet', 'Staff salary', 'Maintenance', 'Cleaning', 'Repairs', 'Marketing', 'Food expenses', 'Other') NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    vendor_name VARCHAR(150) NULL,
    payment_mode ENUM('Cash', 'UPI', 'QR', 'Gateway', 'Bank Transfer') NOT NULL DEFAULT 'UPI',
    invoice_path VARCHAR(255) NULL,
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_expense_date (expense_date),
    CONSTRAINT fk_expense_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE whatsapp_templates (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    template_key VARCHAR(80) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    body TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE whatsapp_messages (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NULL,
    phone VARCHAR(30) NOT NULL,
    template_key VARCHAR(80) NULL,
    message TEXT NOT NULL,
    provider VARCHAR(80) NOT NULL DEFAULT 'Meta WhatsApp Business API',
    status ENUM('Queued', 'Sent', 'Failed') NOT NULL DEFAULT 'Queued',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_message_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE TABLE inquiries (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NULL,
    source VARCHAR(80) NULL,
    requirement ENUM('PG Stay', 'Hostel Stay', 'Library Seat', 'Guest Stay') NOT NULL DEFAULT 'PG Stay',
    status ENUM('New', 'Follow Up', 'Converted', 'Closed') NOT NULL DEFAULT 'New',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE support_tickets (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NULL,
    title VARCHAR(180) NOT NULL,
    category ENUM('Maintenance', 'Cleaning', 'Payment', 'Room Transfer', 'Documents', 'Other') NOT NULL DEFAULT 'Maintenance',
    priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
    raised_by VARCHAR(150) NULL,
    details TEXT NULL,
    status ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE TABLE chat_threads (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NULL,
    contact_name VARCHAR(150) NULL,
    contact_value VARCHAR(150) NOT NULL,
    channel ENUM('WhatsApp', 'SMS', 'Email', 'Internal Note') NOT NULL DEFAULT 'WhatsApp',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_thread_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE TABLE chat_messages (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    thread_id BIGINT UNSIGNED NOT NULL,
    sender_type ENUM('Admin', 'Student', 'Staff', 'System') NOT NULL DEFAULT 'Admin',
    message TEXT NOT NULL,
    status ENUM('Queued', 'Sent', 'Read', 'Failed') NOT NULL DEFAULT 'Queued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_message_thread FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
);

CREATE TABLE invoices (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NULL,
    payment_id BIGINT UNSIGNED NULL,
    invoice_number VARCHAR(80) NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    due_date DATE NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('Draft', 'Sent', 'Paid', 'Cancelled') NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    CONSTRAINT fk_invoice_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL
);

CREATE TABLE invoice_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    invoice_id BIGINT UNSIGNED NOT NULL,
    label VARCHAR(150) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    rate DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_invoice_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE TABLE calendar_events (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(180) NOT NULL,
    event_type ENUM('Rent Due', 'Renewal', 'Admission Follow-up', 'Room Cleaning', 'Maintenance', 'Staff Task', 'Guest Checkout') NOT NULL,
    event_date DATE NOT NULL,
    assigned_to VARCHAR(150) NULL,
    notes TEXT NULL,
    status ENUM('Scheduled', 'Done', 'Cancelled') NOT NULL DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_calendar_date (event_date)
);

CREATE TABLE validation_preferences (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    validation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    require_phone BOOLEAN NOT NULL DEFAULT TRUE,
    require_room BOOLEAN NOT NULL DEFAULT FALSE,
    require_documents BOOLEAN NOT NULL DEFAULT FALSE,
    require_payment_amount BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE send_action_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    action_type VARCHAR(80) NOT NULL,
    module_name VARCHAR(80) NOT NULL,
    target VARCHAR(180) NULL,
    student_name VARCHAR(150) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE visitors (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NULL,
    visitor_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NULL,
    purpose VARCHAR(180) NULL,
    approved_by BIGINT UNSIGNED NULL,
    entry_at TIMESTAMP NULL,
    exit_at TIMESTAMP NULL,
    status ENUM('Waiting', 'Approved', 'Inside', 'Exited', 'Rejected') NOT NULL DEFAULT 'Waiting',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_visitor_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    CONSTRAINT fk_visitor_admin FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE attendance_records (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    person_type ENUM('Student', 'Staff', 'Guest') NOT NULL DEFAULT 'Student',
    person_id BIGINT UNSIGNED NULL,
    person_name VARCHAR(150) NOT NULL,
    attendance_date DATE NOT NULL,
    attendance_type ENUM('Daily', 'Night', 'Meal') NOT NULL DEFAULT 'Daily',
    status ENUM('Present', 'Absent', 'Late', 'Leave') NOT NULL DEFAULT 'Present',
    marked_by BIGINT UNSIGNED NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_attendance_person_date_type (person_type, person_id, attendance_date, attendance_type),
    CONSTRAINT fk_attendance_admin FOREIGN KEY (marked_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE gate_passes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NULL,
    person_name VARCHAR(150) NOT NULL,
    reason VARCHAR(180) NULL,
    out_at TIMESTAMP NULL,
    expected_in_at TIMESTAMP NULL,
    in_at TIMESTAMP NULL,
    approved_by BIGINT UNSIGNED NULL,
    status ENUM('Requested', 'Approved', 'Out', 'Returned', 'Rejected') NOT NULL DEFAULT 'Requested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_gate_pass_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    CONSTRAINT fk_gate_pass_admin FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE food_menus (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    menu_date DATE NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    items TEXT NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_menu_date_meal (menu_date, meal_type),
    CONSTRAINT fk_food_menu_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE meal_attendance (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NULL,
    student_name VARCHAR(150) NOT NULL,
    meal_date DATE NOT NULL,
    meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
    status ENUM('Taken', 'Skipped') NOT NULL DEFAULT 'Taken',
    marked_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_meal_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
    CONSTRAINT fk_meal_admin FOREIGN KEY (marked_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE food_stock (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(150) NOT NULL,
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit VARCHAR(30) NOT NULL DEFAULT 'kg',
    reorder_level DECIMAL(12,2) NOT NULL DEFAULT 0,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_food_stock_admin FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE kitchen_inventory (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    condition_status ENUM('Good', 'Repair Needed', 'Damaged') NOT NULL DEFAULT 'Good',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE housekeeping_tasks (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    room_id BIGINT UNSIGNED NULL,
    task_type ENUM('Cleaning Request', 'Room Cleaning', 'Laundry') NOT NULL DEFAULT 'Room Cleaning',
    assigned_to BIGINT UNSIGNED NULL,
    status ENUM('Open', 'Assigned', 'In Progress', 'Done', 'Cancelled') NOT NULL DEFAULT 'Open',
    requested_by VARCHAR(150) NULL,
    due_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_housekeeping_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    CONSTRAINT fk_housekeeping_staff FOREIGN KEY (assigned_to) REFERENCES staff(id) ON DELETE SET NULL
);

CREATE TABLE inventory_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(80) NULL,
    quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
    unit VARCHAR(30) NULL,
    module_name VARCHAR(80) NULL,
    status ENUM('Available', 'Low Stock', 'Out of Stock', 'Damaged') NOT NULL DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    admin_id BIGINT UNSIGNED NULL,
    action VARCHAR(80) NOT NULL,
    module_name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NULL,
    entity_id VARCHAR(80) NULL,
    entity_name VARCHAR(180) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_module_entity (module_name, entity_type, entity_id),
    INDEX idx_audit_created_at (created_at),
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE entity_history (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    module_name VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    entity_name VARCHAR(180) NULL,
    action VARCHAR(80) NOT NULL,
    previous_data JSON NULL,
    current_data JSON NULL,
    changed_by BIGINT UNSIGNED NULL,
    note TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_history_entity (entity_type, entity_id),
    INDEX idx_history_module_created (module_name, created_at),
    CONSTRAINT fk_history_admin FOREIGN KEY (changed_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE VIEW vw_financial_summary AS
SELECT
    COALESCE((SELECT SUM(total_amount) FROM payments WHERE status = 'Paid'), 0) AS total_income,
    COALESCE((SELECT SUM(amount) FROM expenses), 0) AS total_expenses,
    COALESCE((SELECT SUM(total_amount) FROM payments WHERE status = 'Paid'), 0)
        - COALESCE((SELECT SUM(amount) FROM expenses), 0) AS net_profit;

CREATE VIEW vw_occupancy_summary AS
SELECT
    COUNT(CASE WHEN item_type = 'bed' THEN 1 END) AS total_beds,
    COUNT(CASE WHEN item_type = 'bed' AND status = 'Occupied' THEN 1 END) AS occupied_beds,
    COUNT(CASE WHEN item_type = 'bed' AND status = 'Available' THEN 1 END) AS available_beds,
    COUNT(CASE WHEN item_type = 'bed' AND status = 'Payment Pending' THEN 1 END) AS payment_pending_beds,
    COUNT(CASE WHEN item_type = 'bed' AND status = 'Reserved' THEN 1 END) AS reserved_beds
FROM room_items;

INSERT INTO pg_profiles (name, short_name, address, rent_cycle, reminder_days, deposit_rule, late_fee_rule)
VALUES ('Jay Ambe PG', 'JA', 'Paying Guest & Library', 'Monthly', 5, 'One month rent', '100 per delayed day');

INSERT INTO roles (role_key, name, description, permissions) VALUES
('super-admin', 'Super Admin', 'Full system owner access', JSON_ARRAY('dashboard', 'rooms', 'profiles', 'allocation', 'allotments', 'payments', 'property', 'admissions', 'inquiries', 'tickets', 'messages', 'calendar', 'transfers', 'reports', 'billingSettings', 'hostelSettings', 'systemConfig', 'databaseBackup', 'auditLogs', 'staff', 'visitors', 'attendance', 'mess', 'housekeeping', 'settings', 'adminProfile', 'adminUsers')),
('hostel-admin', 'Hostel Admin', 'Daily hostel operations without system configuration or role management', JSON_ARRAY('dashboard', 'rooms', 'profiles', 'allocation', 'allotments', 'payments', 'property', 'admissions', 'inquiries', 'tickets', 'messages', 'calendar', 'transfers', 'reports', 'visitors')),
('warden', 'Warden / Receptionist', 'Check-in, check-out, attendance, visitor approval, complaint verification', JSON_ARRAY('dashboard', 'profiles', 'allocation', 'admissions', 'inquiries', 'tickets', 'calendar', 'visitors', 'attendance')),
('receptionist', 'Receptionist', 'Admission, registration, bed allocation, availability, inquiries', JSON_ARRAY('dashboard', 'rooms', 'profiles', 'allocation', 'admissions', 'inquiries', 'calendar', 'visitors')),
('accountant', 'Accountant', 'Rent collection, invoices, expenses, refunds, reports', JSON_ARRAY('dashboard', 'payments', 'reports', 'billingSettings')),
('maintenance-manager', 'Maintenance Manager', 'Maintenance tickets, staff assignment, complaint tracking, inventory', JSON_ARRAY('dashboard', 'tickets', 'staff', 'reports')),
('security-guard', 'Security Guard', 'Visitor entry, visitor exit, gate pass, night attendance', JSON_ARRAY('dashboard', 'visitors', 'attendance')),
('mess-manager', 'Mess Manager', 'Food menu, meal attendance, food stock, kitchen inventory', JSON_ARRAY('dashboard', 'mess', 'reports')),
('housekeeping', 'Housekeeping', 'Cleaning requests, room cleaning, laundry status', JSON_ARRAY('dashboard', 'housekeeping', 'tickets'));

INSERT INTO admins (name, username, email, password_hash, active)
VALUES ('Main Administrator', 'superadmin', 'admin@example.com', '$2y$10$replace_with_real_hash', TRUE);

INSERT INTO admin_roles (admin_id, role_id)
SELECT admins.id, roles.id
FROM admins
JOIN roles ON roles.role_key = 'super-admin'
WHERE admins.username = 'superadmin';

INSERT INTO buildings (name, address, floors_count) VALUES
('Building A', 'Jay Ambe PG', 3),
('Library Block', 'Jay Ambe PG', 2);

INSERT INTO floors (building_id, floor_number, floor_name) VALUES
(1, 1, 'Floor 1'),
(1, 2, 'Floor 2'),
(1, 3, 'Floor 3'),
(2, 1, 'Library Floor 1'),
(2, 2, 'Library Floor 2');

INSERT INTO whatsapp_templates (template_key, title, body) VALUES
('admission_form_link', 'Admission Form Link', 'Hello {student}, please submit your Jay Ambe PG admission form here: {link}'),
('admission_confirmation', 'Admission Confirmation', 'Hello {student}, your admission at Jay Ambe PG is approved.'),
('payment_receipt', 'Payment Receipt', 'Hello {student}, receipt {receipt} for {amount} is confirmed.'),
('rent_reminder', 'Rent Reminder', 'Hello {student}, your rent is due on {due_date}.'),
('late_payment_alert', 'Late Payment Alert', 'Hello {student}, your payment is overdue. Please clear it soon.'),
('renewal_confirmation', 'Renewal Confirmation', 'Hello {student}, your stay renewal is confirmed.');

INSERT INTO validation_preferences (validation_enabled, require_phone, require_room, require_documents, require_payment_amount)
VALUES (FALSE, TRUE, FALSE, FALSE, TRUE);
