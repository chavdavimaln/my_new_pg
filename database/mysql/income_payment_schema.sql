-- Jay Ambe PG Income / Payment module schema
-- Non-destructive migration for the full Income workspace.
-- Import after jay_ambe_pg_schema.sql:
-- mysql -u root -p < database/mysql/income_payment_schema.sql

CREATE DATABASE IF NOT EXISTS jay_ambe_pg
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE jay_ambe_pg;

CREATE TABLE IF NOT EXISTS payment_fee_structures (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    pg_profile_id BIGINT UNSIGNED NULL,
    room_type VARCHAR(80) NOT NULL DEFAULT 'Standard',
    monthly_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
    room_charge DECIMAL(12,2) NOT NULL DEFAULT 0,
    bed_charge DECIMAL(12,2) NOT NULL DEFAULT 0,
    table_charge DECIMAL(12,2) NOT NULL DEFAULT 0,
    cupboard_charge DECIMAL(12,2) NOT NULL DEFAULT 0,
    student_fee_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    guest_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    one_day_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    two_day_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    set_days_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    yearly_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    festival_discount_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    scholarship_discount_price DECIMAL(12,2) NOT NULL DEFAULT 0,
    security_deposit DECIMAL(12,2) NOT NULL DEFAULT 0,
    admission_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    maintenance_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
    electricity_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    water_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    wifi_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    mess_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    laundry_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    parking_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    other_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    gst_tax_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fee_structure_room_type (room_type),
    CONSTRAINT fk_income_fee_profile FOREIGN KEY (pg_profile_id) REFERENCES pg_profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_pricing_plans (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    fee_structure_id BIGINT UNSIGNED NULL,
    plan_key VARCHAR(80) NOT NULL,
    plan_name VARCHAR(150) NOT NULL,
    applies_to ENUM('Student', 'Guest', 'Staff', 'Room', 'Bed', 'Table', 'Cupboard', 'Service', 'Other') NOT NULL DEFAULT 'Student',
    billing_cycle ENUM('One Time', 'One Day', 'Two Day', 'Custom Days', 'Monthly', 'Yearly', 'Manual') NOT NULL DEFAULT 'Manual',
    days_count INT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    description VARCHAR(255) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_pricing_plan_key (plan_key),
    CONSTRAINT fk_pricing_plan_fee FOREIGN KEY (fee_structure_id) REFERENCES payment_fee_structures(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_charge_catalog (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    fee_structure_id BIGINT UNSIGNED NULL,
    charge_key VARCHAR(80) NOT NULL,
    label VARCHAR(150) NOT NULL,
    category ENUM('rent', 'allocation', 'deposit', 'one_time', 'utility', 'service', 'penalty', 'discount', 'tax', 'refund', 'other') NOT NULL DEFAULT 'other',
    default_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    taxable BOOLEAN NOT NULL DEFAULT FALSE,
    required_asset_type ENUM('room', 'bed', 'table', 'cupboard') NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_charge_catalog_key (charge_key),
    CONSTRAINT fk_charge_catalog_fee FOREIGN KEY (fee_structure_id) REFERENCES payment_fee_structures(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS income_payment_orders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    allocation_id BIGINT UNSIGNED NULL,
    room_id BIGINT UNSIGNED NULL,
    bed_item_id BIGINT UNSIGNED NULL,
    table_item_id BIGINT UNSIGNED NULL,
    cupboard_item_id BIGINT UNSIGNED NULL,
    bill_month CHAR(7) NULL,
    invoice_number VARCHAR(80) NULL UNIQUE,
    due_date DATE NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_mode ENUM('Amount', 'Percent') NOT NULL DEFAULT 'Amount',
    discount_scope ENUM('All', 'Student', 'Guest', 'Services') NOT NULL DEFAULT 'All',
    gst_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    gst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status ENUM('Draft', 'Pending', 'Partial', 'Paid', 'Overdue', 'Cancelled', 'Refunded') NOT NULL DEFAULT 'Pending',
    remarks TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_income_order_student_month (student_id, bill_month),
    INDEX idx_income_order_status_due (status, due_date),
    CONSTRAINT fk_income_order_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_income_order_allocation FOREIGN KEY (allocation_id) REFERENCES allocations(id) ON DELETE SET NULL,
    CONSTRAINT fk_income_order_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL,
    CONSTRAINT fk_income_order_bed FOREIGN KEY (bed_item_id) REFERENCES room_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_income_order_table FOREIGN KEY (table_item_id) REFERENCES room_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_income_order_cupboard FOREIGN KEY (cupboard_item_id) REFERENCES room_items(id) ON DELETE SET NULL,
    CONSTRAINT fk_income_order_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS income_payment_order_items (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    payment_order_id BIGINT UNSIGNED NOT NULL,
    charge_catalog_id BIGINT UNSIGNED NULL,
    charge_key VARCHAR(80) NOT NULL,
    label VARCHAR(150) NOT NULL,
    category ENUM('rent', 'allocation', 'deposit', 'one_time', 'utility', 'service', 'penalty', 'discount', 'tax', 'refund', 'other') NOT NULL DEFAULT 'other',
    linked_asset_type ENUM('room', 'bed', 'table', 'cupboard') NULL,
    linked_asset_id BIGINT UNSIGNED NULL,
    linked_asset_label VARCHAR(80) NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    rate DECIMAL(12,2) NOT NULL DEFAULT 0,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    taxable BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_income_order_item_key (charge_key),
    CONSTRAINT fk_income_item_order FOREIGN KEY (payment_order_id) REFERENCES income_payment_orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_income_item_catalog FOREIGN KEY (charge_catalog_id) REFERENCES payment_charge_catalog(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS income_payment_collections (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    payment_order_id BIGINT UNSIGNED NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    allocation_id BIGINT UNSIGNED NULL,
    receipt_number VARCHAR(80) NOT NULL UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    base_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_mode ENUM('Amount', 'Percent') NOT NULL DEFAULT 'Amount',
    discount_scope ENUM('All', 'Student', 'Guest', 'Services') NOT NULL DEFAULT 'All',
    gst_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    gst_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    gst_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_payable DECIMAL(12,2) NOT NULL DEFAULT 0,
    balance_after_payment DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_date DATE NOT NULL,
    payment_mode ENUM('Cash', 'QR Code', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque') NOT NULL,
    transaction_id VARCHAR(150) NULL,
    collected_by BIGINT UNSIGNED NULL,
    status ENUM('Received', 'Pending Verification', 'Failed', 'Reversed', 'Refunded') NOT NULL DEFAULT 'Received',
    remarks TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_income_collection_date_mode (payment_date, payment_mode),
    CONSTRAINT fk_income_collection_order FOREIGN KEY (payment_order_id) REFERENCES income_payment_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_income_collection_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_income_collection_allocation FOREIGN KEY (allocation_id) REFERENCES allocations(id) ON DELETE SET NULL,
    CONSTRAINT fk_income_collection_admin FOREIGN KEY (collected_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_gateways (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    provider ENUM('Razorpay', 'Stripe', 'Cashfree', 'PayU', 'PhonePe') NOT NULL,
    display_name VARCHAR(120) NOT NULL,
    api_key VARCHAR(255) NULL,
    api_secret_encrypted VARCHAR(255) NULL,
    webhook_secret_encrypted VARCHAR(255) NULL,
    active BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_payment_gateway_provider (provider)
);

CREATE TABLE IF NOT EXISTS staff_salary_setups (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    staff_id BIGINT UNSIGNED NOT NULL,
    salary_type ENUM('Monthly', 'Daily', 'Contract') NOT NULL DEFAULT 'Monthly',
    monthly_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
    per_day_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
    contract_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    payment_mode ENUM('Cash', 'QR Code', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer', 'Credit Card', 'Debit Card', 'Cheque') NOT NULL DEFAULT 'Cash',
    status ENUM('Active', 'Paused', 'Closed') NOT NULL DEFAULT 'Active',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_staff_salary_staff (staff_id),
    CONSTRAINT fk_staff_salary_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS online_payment_transactions (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    gateway_id BIGINT UNSIGNED NULL,
    payment_order_id BIGINT UNSIGNED NULL,
    collection_id BIGINT UNSIGNED NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    provider ENUM('Razorpay', 'Stripe', 'Cashfree', 'PayU', 'PhonePe') NOT NULL,
    provider_order_id VARCHAR(150) NULL,
    provider_payment_id VARCHAR(150) NULL,
    provider_refund_id VARCHAR(150) NULL,
    amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) NOT NULL DEFAULT 'INR',
    status ENUM('Created', 'Pending', 'Paid', 'Failed', 'Refunded', 'Cancelled') NOT NULL DEFAULT 'Created',
    payment_link VARCHAR(500) NULL,
    webhook_payload JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_online_txn_provider_status (provider, status),
    CONSTRAINT fk_online_txn_gateway FOREIGN KEY (gateway_id) REFERENCES payment_gateways(id) ON DELETE SET NULL,
    CONSTRAINT fk_online_txn_order FOREIGN KEY (payment_order_id) REFERENCES income_payment_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_online_txn_collection FOREIGN KEY (collection_id) REFERENCES income_payment_collections(id) ON DELETE SET NULL,
    CONSTRAINT fk_online_txn_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS security_deposit_ledger (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    allocation_id BIGINT UNSIGNED NULL,
    payment_order_id BIGINT UNSIGNED NULL,
    collection_id BIGINT UNSIGNED NULL,
    deposit_received DECIMAL(12,2) NOT NULL DEFAULT 0,
    deposit_used DECIMAL(12,2) NOT NULL DEFAULT 0,
    deposit_remaining DECIMAL(12,2) NOT NULL DEFAULT 0,
    refund_status ENUM('Not Refunded', 'Pending', 'Approved', 'Refunded', 'Adjusted') NOT NULL DEFAULT 'Not Refunded',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_deposit_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_deposit_allocation FOREIGN KEY (allocation_id) REFERENCES allocations(id) ON DELETE SET NULL,
    CONSTRAINT fk_deposit_order FOREIGN KEY (payment_order_id) REFERENCES income_payment_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_deposit_collection FOREIGN KEY (collection_id) REFERENCES income_payment_collections(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS refund_requests (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT UNSIGNED NOT NULL,
    allocation_id BIGINT UNSIGNED NULL,
    deposit_ledger_id BIGINT UNSIGNED NULL,
    security_deposit DECIMAL(12,2) NOT NULL DEFAULT 0,
    damage_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    pending_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
    cleaning_charges DECIMAL(12,2) NOT NULL DEFAULT 0,
    refund_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    refund_mode ENUM('Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Gateway') NULL,
    transaction_id VARCHAR(150) NULL,
    status ENUM('Pending', 'Approved', 'Refunded', 'Rejected') NOT NULL DEFAULT 'Pending',
    requested_by BIGINT UNSIGNED NULL,
    approved_by BIGINT UNSIGNED NULL,
    refunded_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_refund_status (status),
    CONSTRAINT fk_refund_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_refund_allocation FOREIGN KEY (allocation_id) REFERENCES allocations(id) ON DELETE SET NULL,
    CONSTRAINT fk_refund_deposit FOREIGN KEY (deposit_ledger_id) REFERENCES security_deposit_ledger(id) ON DELETE SET NULL,
    CONSTRAINT fk_refund_requested_by FOREIGN KEY (requested_by) REFERENCES admins(id) ON DELETE SET NULL,
    CONSTRAINT fk_refund_approved_by FOREIGN KEY (approved_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS discount_rules (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    discount_type ENUM('Student Discount', 'Festival Offer', 'Corporate Discount', 'Referral Discount', 'Scholarship') NOT NULL,
    applies_to ENUM('All', 'Student', 'Guest', 'Services') NOT NULL DEFAULT 'All',
    discount_mode ENUM('Amount', 'Percent') NOT NULL DEFAULT 'Amount',
    student_id BIGINT UNSIGNED NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    percent_value DECIMAL(5,2) NULL,
    reason VARCHAR(255) NULL,
    valid_from DATE NULL,
    valid_till DATE NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_discount_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_discount_admin FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_penalty_rules (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    rule_name VARCHAR(120) NOT NULL,
    min_days_late INT NOT NULL DEFAULT 1,
    max_days_late INT NULL,
    penalty_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_reminders (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    payment_order_id BIGINT UNSIGNED NULL,
    student_id BIGINT UNSIGNED NOT NULL,
    due_date DATE NOT NULL,
    status ENUM('Upcoming Due', 'Due Today', 'Overdue') NOT NULL,
    channel ENUM('SMS', 'WhatsApp', 'Email', 'Push Notification') NOT NULL,
    recipient_phone VARCHAR(30) NULL,
    recipient_email VARCHAR(150) NULL,
    message TEXT NULL,
    send_status ENUM('Queued', 'Sent', 'Failed') NOT NULL DEFAULT 'Queued',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payment_reminder_due_status (due_date, status),
    CONSTRAINT fk_reminder_order FOREIGN KEY (payment_order_id) REFERENCES income_payment_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_reminder_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_message_templates (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    template_key VARCHAR(80) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    channel ENUM('Email', 'WhatsApp', 'SMS', 'Push Notification') NOT NULL,
    subject VARCHAR(180) NULL,
    body TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_message_logs (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    template_id BIGINT UNSIGNED NULL,
    payment_order_id BIGINT UNSIGNED NULL,
    collection_id BIGINT UNSIGNED NULL,
    student_id BIGINT UNSIGNED NULL,
    channel ENUM('Email', 'WhatsApp', 'SMS', 'Push Notification') NOT NULL,
    recipient VARCHAR(180) NOT NULL,
    subject VARCHAR(180) NULL,
    message TEXT NOT NULL,
    provider VARCHAR(80) NULL,
    provider_message_id VARCHAR(180) NULL,
    status ENUM('Queued', 'Sent', 'Delivered', 'Read', 'Failed') NOT NULL DEFAULT 'Queued',
    error_message TEXT NULL,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payment_message_status (channel, status),
    CONSTRAINT fk_payment_msg_template FOREIGN KEY (template_id) REFERENCES payment_message_templates(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_msg_order FOREIGN KEY (payment_order_id) REFERENCES income_payment_orders(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_msg_collection FOREIGN KEY (collection_id) REFERENCES income_payment_collections(id) ON DELETE SET NULL,
    CONSTRAINT fk_payment_msg_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL
);

CREATE OR REPLACE VIEW vw_income_payment_summary AS
SELECT
    COALESCE((SELECT SUM(amount) FROM income_payment_collections WHERE status = 'Received' AND payment_date = CURRENT_DATE()), 0) AS todays_collection,
    COALESCE((SELECT SUM(amount) FROM income_payment_collections WHERE status = 'Received' AND DATE_FORMAT(payment_date, '%Y-%m') = DATE_FORMAT(CURRENT_DATE(), '%Y-%m')), 0) AS monthly_collection,
    COALESCE((SELECT SUM(balance_amount) FROM income_payment_orders WHERE status IN ('Pending', 'Partial', 'Overdue')), 0) AS pending_amount,
    COALESCE((SELECT SUM(amount) FROM income_payment_collections WHERE status = 'Received'), 0) AS total_income,
    COALESCE((SELECT SUM(amount) FROM expenses), 0) AS total_expenses,
    COALESCE((SELECT SUM(amount) FROM income_payment_collections WHERE status = 'Received'), 0) - COALESCE((SELECT SUM(amount) FROM expenses), 0) AS profit,
    COALESCE((SELECT SUM(deposit_remaining) FROM security_deposit_ledger), 0) AS security_deposits,
    COALESCE((SELECT SUM(refund_amount) FROM refund_requests WHERE status = 'Refunded'), 0) AS refund_amount;

INSERT IGNORE INTO payment_penalty_rules (rule_name, min_days_late, max_days_late, penalty_amount) VALUES
('1-5 Days Late', 1, 5, 100),
('6-10 Days Late', 6, 10, 250),
('More Than 10 Days Late', 11, NULL, 500);

INSERT IGNORE INTO payment_gateways (provider, display_name, active) VALUES
('Razorpay', 'Razorpay', FALSE),
('Stripe', 'Stripe', FALSE),
('Cashfree', 'Cashfree', FALSE),
('PayU', 'PayU', FALSE),
('PhonePe', 'PhonePe', FALSE);

INSERT IGNORE INTO payment_pricing_plans (plan_key, plan_name, applies_to, billing_cycle, days_count, price, description) VALUES
('student_fee', 'Student Fee Price', 'Student', 'Manual', NULL, 0, 'Base student fee before optional charges'),
('guest_price', 'Guest Price', 'Guest', 'Manual', NULL, 0, 'Default guest stay price'),
('one_day_price', 'One Day Price', 'Guest', 'One Day', 1, 0, 'Single day stay price'),
('two_day_price', 'Two Day Price', 'Guest', 'Two Day', 2, 0, 'Two day stay package'),
('set_days_price', 'Set Days Price', 'Guest', 'Custom Days', NULL, 0, 'Manual custom-day package price'),
('monthly_price', 'Monthly Price', 'Student', 'Monthly', NULL, 0, 'Monthly student rent'),
('yearly_price', 'Yearly Price', 'Student', 'Yearly', NULL, 0, 'Annual student plan');

INSERT IGNORE INTO payment_message_templates (template_key, title, channel, subject, body) VALUES
('payment_receipt_email', 'Payment Receipt Email', 'Email', 'Payment receipt {receipt_number}', 'Hello {student_name}, your payment of {amount} is received. Receipt: {receipt_number}.'),
('payment_receipt_whatsapp', 'Payment Receipt WhatsApp', 'WhatsApp', NULL, 'Hello {student_name}, payment received: {amount}. Receipt: {receipt_number}.'),
('payment_due_email', 'Payment Due Email', 'Email', 'Payment due on {due_date}', 'Hello {student_name}, your payment of {amount} is due on {due_date}.'),
('payment_due_whatsapp', 'Payment Due WhatsApp', 'WhatsApp', NULL, 'Hello {student_name}, your payment of {amount} is due on {due_date}.'),
('payment_overdue_whatsapp', 'Payment Overdue WhatsApp', 'WhatsApp', NULL, 'Hello {student_name}, your payment is overdue. Due amount: {amount}.');
