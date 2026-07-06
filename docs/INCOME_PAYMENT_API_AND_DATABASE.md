# Income / Payment API And Database Guide

This guide is the live-server contract for the Income / Payments module.

Use the migration:

```bash
mysql -u your_mysql_user -p < database/mysql/income_payment_schema.sql
```

Import it after:

```bash
mysql -u your_mysql_user -p < database/mysql/jay_ambe_pg_schema.sql
```

## What The New Database Stores

The new Income schema stores every payment operation in normalized tables:

- `payment_fee_structures`: room type charges, rent, deposit, admission, maintenance, electricity, water, WiFi, mess, laundry, parking, GST/tax.
- `payment_pricing_plans`: student fee price, guest price, one-day, two-day, custom-day, monthly and yearly price plans.
- `payment_charge_catalog`: reusable charge definitions for rent, room, bed, table, cupboard, laundry, penalty, discount, tax, and other fees.
- `income_payment_orders`: one student bill/invoice draft for a month or checkout.
- `income_payment_order_items`: line items for every bill, including linked room, bed, table, cupboard and service charges.
- `income_payment_collections`: receipt-level payment collection records with base amount, discount, GST, total payable and balance after payment.
- `payment_gateways`: Razorpay, Stripe, Cashfree, PayU, PhonePe configuration placeholders.
- `online_payment_transactions`: gateway orders, payment links, transaction status, refund IDs and webhook payloads.
- `staff_salary_setups`: staff salary type, monthly salary, per-day salary, contract amount and payout mode.
- `security_deposit_ledger`: deposit received, used, remaining and refund status.
- `refund_requests`: checkout refund calculation and approval flow.
- `discount_rules`: student, festival, corporate, referral and scholarship discounts.
- `payment_penalty_rules`: automatic late-fee rules.
- `payment_reminders`: SMS, WhatsApp, email and push reminder queue.
- `payment_message_templates`: payment receipt, due reminder and overdue templates for email, WhatsApp, SMS and push.
- `payment_message_logs`: delivery log for every email, WhatsApp, SMS and push message.
- `vw_income_payment_summary`: dashboard summary totals.

Existing tables still stay useful:

- `students`
- `rooms`
- `room_items`
- `allocations`
- `staff`
- `admins`
- `expenses`
- `audit_logs`
- `entity_history`

## Payment Object Flow

1. Student gets allocated to a room, bed, table and cupboard in `allocations`.
2. Fee rules are stored in `payment_fee_structures` and `payment_charge_catalog`.
3. API creates an `income_payment_orders` row.
4. API creates related `income_payment_order_items` rows:
   - Monthly Rent
   - Room Charge
   - Bed Charge
   - Table Charge
   - Cupboard Charge
   - Admission Fee
   - Security Deposit
   - Maintenance
   - Electricity
   - Water
   - WiFi
   - Mess
   - Laundry
   - Parking
   - Other Charges
   - Penalty
   - Discount
   - GST / Tax
5. Payment collection inserts `income_payment_collections`.
6. API updates `income_payment_orders.paid_amount`, `balance_amount`, and `status`.
7. Receipt/PDF reads collection + order + line items.

## GST And Discount Calculation Rule

Use this calculation order for every payment order, allotment-time bill and collection-time payment:

1. `subtotal = SUM(line_items.amount)`
2. `discountable_amount = subtotal` for `All`, only service/utility lines for `Services`, guest lines for `Guest`, student lines for `Student`
3. `discount_amount = amount` or `discountable_amount * percent / 100`
4. `taxable_amount = subtotal - discount_amount`
5. `gst_amount = taxable_amount * gst_percent / 100` when GST is enabled
6. `grand_total = taxable_amount + gst_amount`
7. `balance = grand_total - paid_amount`

Store the calculation result in:

- `income_payment_orders.subtotal`
- `income_payment_orders.discount_amount`
- `income_payment_orders.discount_mode`
- `income_payment_orders.discount_scope`
- `income_payment_orders.gst_enabled`
- `income_payment_orders.gst_percent`
- `income_payment_orders.tax_amount`
- `income_payment_orders.grand_total`
- `income_payment_orders.paid_amount`
- `income_payment_orders.balance_amount`

## Required API Endpoints

Fee structure:

- `GET /income/fee-structures`
- `POST /income/fee-structures`
- `PUT /income/fee-structures/:id`
- `GET /income/pricing-plans`
- `POST /income/pricing-plans`
- `PUT /income/pricing-plans/:id`
- `GET /income/charge-catalog`
- `PUT /income/charge-catalog/:id`

Staff salary:

- `GET /income/staff-salaries`
- `POST /income/staff-salaries`
- `PUT /income/staff-salaries/:staffId`
- `GET /income/staff-salaries/payout-preview?month=YYYY-MM`

Student payment/order:

- `GET /income/payment-orders`
- `GET /income/payment-orders/:id`
- `POST /income/payment-orders`
- `PUT /income/payment-orders/:id`
- `PATCH /income/payment-orders/:id/status`
- `DELETE /income/payment-orders/:id`

Payment collection:

- `GET /income/collections`
- `POST /income/collections`
- `GET /income/collections/:id/receipt`
- `GET /income/collections/:id/receipt.pdf`
- `POST /income/collections/:id/reverse`

Payment modes accepted by collections:

- `Cash`
- `QR Code`
- `UPI`
- `Google Pay`
- `PhonePe`
- `Paytm`
- `Bank Transfer`
- `Credit Card`
- `Debit Card`
- `Cheque`

Pending and reminders:

- `GET /income/pending-payments`
- `POST /income/reminders`
- `GET /income/reminders`
- `PATCH /income/reminders/:id/status`
- `GET /income/message-templates`
- `PUT /income/message-templates/:id`
- `POST /income/messages/send-email`
- `POST /income/messages/send-whatsapp`
- `GET /income/message-logs`

Security deposit and refunds:

- `GET /income/security-deposits`
- `POST /income/security-deposits`
- `PATCH /income/security-deposits/:id`
- `GET /income/refunds`
- `POST /income/refunds`
- `PATCH /income/refunds/:id/approve`
- `PATCH /income/refunds/:id/paid`

Discount and penalty:

- `GET /income/discounts`
- `POST /income/discounts`
- `PUT /income/discounts/:id`
- `DELETE /income/discounts/:id`
- `POST /income/calculate-payment`
- `GET /income/penalty-rules`
- `PUT /income/penalty-rules/:id`
- `POST /income/calculate-penalty`

Invoices and receipts:

- `GET /income/invoices`
- `POST /income/invoices`
- `GET /income/invoices/:id.pdf`
- `GET /income/receipts`
- `GET /income/receipts/:id.pdf`

Online payment:

- `GET /income/payment-gateways`
- `PUT /income/payment-gateways/:id`
- `POST /income/online-payments`
- `GET /income/online-payments`
- `GET /income/online-payments/:id/status`
- `POST /income/online-payments/:id/refund`
- `POST /webhooks/payments/:provider`

Registered and manual payers:

- `GET /students?search=`
- `POST /students`
- `POST /income/online-payments` should accept either `studentId` for registered people or `manualName` for one-off/manual payers.

Reports:

- `GET /income/dashboard`
- `GET /income/history`
- `GET /income/reports/daily`
- `GET /income/reports/weekly`
- `GET /income/reports/monthly`
- `GET /income/reports/yearly`
- `GET /income/reports/student-wise`
- `GET /income/reports/room-wise`
- `GET /income/reports/payment-method-wise`
- `GET /income/reports/financial-dashboard`

## POST /income/payment-orders

Request:

```json
{
  "studentId": 12,
  "allocationId": 7,
  "billMonth": "2026-07",
  "dueDate": "2026-07-10",
  "discountAmount": 250,
  "discountMode": "Amount",
  "discountScope": "Services",
  "gstEnabled": true,
  "gstPercent": 18,
  "taxAmount": 180,
  "remarks": "July bill",
  "items": [
    {
      "chargeKey": "monthly_rent",
      "label": "Monthly Rent",
      "category": "rent",
      "quantity": 1,
      "rate": 5000,
      "amount": 5000
    },
    {
      "chargeKey": "bed_charge",
      "label": "Bed Charge",
      "category": "allocation",
      "linkedAssetType": "bed",
      "linkedAssetId": 101,
      "linkedAssetLabel": "B1",
      "quantity": 1,
      "rate": 500,
      "amount": 500
    },
    {
      "chargeKey": "laundry_charges",
      "label": "Laundry",
      "category": "service",
      "quantity": 1,
      "rate": 300,
      "amount": 300
    }
  ]
}
```

Response:

```json
{
  "id": 33,
  "invoiceNumber": "INV-202607-0033",
  "subtotal": 5800,
  "discountAmount": 250,
  "discountMode": "Amount",
  "discountScope": "Services",
  "gstEnabled": true,
  "gstPercent": 18,
  "taxAmount": 180,
  "grandTotal": 5730,
  "paidAmount": 0,
  "balanceAmount": 5730,
  "status": "Pending"
}
```

## PUT /income/fee-structures/:id

Request:

```json
{
  "roomType": "Standard",
  "roomCharge": 1000,
  "bedCharge": 500,
  "tableCharge": 150,
  "cupboardCharge": 200,
  "studentFeePrice": 5000,
  "guestPrice": 800,
  "oneDayPrice": 500,
  "twoDayPrice": 900,
  "setDaysPrice": 2500,
  "monthlyRent": 5000,
  "yearlyPrice": 55000,
  "discountPrice": 250,
  "securityDeposit": 5000,
  "admissionFee": 1000,
  "maintenanceFee": 500,
  "electricityCharges": 700,
  "waterCharges": 150,
  "wifiCharges": 300,
  "messCharges": 2500,
  "laundryCharges": 300,
  "parkingCharges": 400,
  "gstTaxPercent": 18
}
```

Backend mapping:

- Store fixed columns in `payment_fee_structures`.
- Store flexible rows in `payment_pricing_plans` when price types can vary by room type, guest type or custom day count.
- Write `entity_history` and `audit_logs`.

## PUT /income/staff-salaries/:staffId

Request:

```json
{
  "salaryType": "Monthly",
  "monthlySalary": 18000,
  "perDaySalary": 700,
  "contractAmount": 0,
  "paymentMode": "Bank Transfer",
  "status": "Active",
  "notes": "Night shift allowance handled separately"
}
```

Response:

```json
{
  "staffId": 5,
  "salaryType": "Monthly",
  "monthlySalary": 18000,
  "perDaySalary": 700,
  "paymentMode": "Bank Transfer",
  "status": "Active"
}
```

## POST /income/collections

Request:

```json
{
  "paymentOrderId": 33,
  "studentId": 12,
  "allocationId": 7,
  "receiptNumber": "RCPT-202607-0045",
  "baseAmount": 5500,
  "discountAmount": 250,
  "discountMode": "Amount",
  "discountScope": "All",
  "gstEnabled": true,
  "gstPercent": 18,
  "gstAmount": 945,
  "totalPayable": 6195,
  "amount": 5730,
  "paymentDate": "2026-07-06",
  "paymentMode": "UPI",
  "transactionId": "UPI123456",
  "collectedBy": 2,
  "remarks": "Full July rent received"
}
```

Backend rule:

- Insert into `income_payment_collections`.
- Recalculate `paid_amount` and `balance_amount` on `income_payment_orders`.
- Mark order as `Paid`, `Partial`, or `Pending`.
- If line item category is `deposit`, update `security_deposit_ledger`.
- If `paymentMode` is `QR Code`, generate or return a QR payload that can accept UPI/Google Pay/PhonePe/Paytm-compatible payment for the calculated payable amount.
- If `paymentMode` is a gateway/app mode, return the configured payment API redirect/link when gateway credentials exist.
- Write `entity_history` and `audit_logs`.

## POST /income/discounts

Request:

```json
{
  "discountType": "Festival Offer",
  "appliesTo": "Services",
  "discountMode": "Percent",
  "amount": 10,
  "studentId": null,
  "reason": "Festival service discount",
  "validFrom": "2026-07-01",
  "validTill": "2026-07-31"
}
```

Discount `appliesTo` values:

- `All`
- `Student`
- `Guest`
- `Services`

Use these rules both at allotment-time billing and collection-time payment calculation.

## GET /income/dashboard

Recommended response:

```json
{
  "todaysCollection": 18500,
  "monthlyCollection": 482000,
  "pendingAmount": 78000,
  "totalIncome": 920000,
  "totalExpenses": 310000,
  "profit": 610000,
  "securityDeposits": 240000,
  "refundAmount": 12000,
  "collectionRate": 92,
  "averageMonthlyIncome": 460000
}
```

## Online Payment Gateway Rule

Do not store plain API secrets. Store encrypted values in:

- `payment_gateways.api_secret_encrypted`
- `payment_gateways.webhook_secret_encrypted`

Webhook flow:

1. Provider calls `POST /webhooks/payments/:provider`.
2. API validates signature.
3. API updates `online_payment_transactions`.
4. If paid, API inserts or links `income_payment_collections`.
5. API updates order balance/status.

For manual payer names:

- If `studentId` is present, link the transaction to the registered student/person.
- If `manualName` is present and admin confirms registration, create a `students` row first, then link the transaction.
- If admin does not confirm registration, store the payer name on `online_payment_transactions.metadata` or the API response record as a manual payer and do not create a student row.

## Email And WhatsApp Payment Messages

Use templates in `payment_message_templates`.

Available template placeholders:

- `{student_name}`
- `{room_number}`
- `{bed_label}`
- `{receipt_number}`
- `{invoice_number}`
- `{amount}`
- `{balance}`
- `{due_date}`
- `{payment_mode}`
- `{payment_link}`

Send email request:

```json
{
  "templateKey": "payment_receipt_email",
  "paymentOrderId": 33,
  "collectionId": 45,
  "studentId": 12,
  "to": "student@example.com"
}
```

Send WhatsApp request:

```json
{
  "templateKey": "payment_due_whatsapp",
  "paymentOrderId": 33,
  "studentId": 12,
  "phone": "919999999999"
}
```

Backend rule:

- Render the template with order, collection, student and allocation data.
- Insert into `payment_message_logs` with `Queued`.
- Send through SMTP/email provider or WhatsApp Business provider.
- Update `payment_message_logs.status` to `Sent`, `Delivered`, `Read` or `Failed`.
- For due reminders, also insert/update `payment_reminders`.

## Audit Rule

Every payment order, collection, reversal, refund, discount, penalty, fee setting and gateway change must write:

- `entity_history.previous_data`
- `entity_history.current_data`
- `audit_logs.action`
- `audit_logs.module_name = Income / Payments`

## React Integration Points

Income UI:

```text
src/pgadmin/Pages/Requirements/PaymentOperations.jsx
```

Temporary local fallback helpers:

```text
src/pgadmin/Utils/paymentHelper.js
src/pgadmin/Utils/allocationHelper.js
src/pgadmin/Utils/pgRequirementStore.js
```

For live server, replace localStorage persistence in the Income page with the endpoints above.
