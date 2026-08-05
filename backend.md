# Innavance Boarding House Backend Documentation

## Overview

Innavance is a comprehensive NestJS backend system designed to manage a boarding house operation. The platform facilitates the complete lifecycle of room bookings—from QR code scanning and reservation requests through approval, check-in, room access via smart door locks, and final checkout with grace periods. The system supports dual-user architecture with separate flows for guests and administrators, including staff role-based access control.

---

## Application Purpose

The backend serves as the central management system for a boarding house with the following core responsibilities:

1. **Room Inventory Management**: Maintain records of available rooms with pricing, capacity, features, and add-ons
2. **Booking Lifecycle Management**: Handle room reservations from request through checkout including approval workflows
3. **Smart Door Integration**: Generate and manage access PINs for room entry via smart locks
4. **User Dashboard**: Provide guests with real-time booking status, notifications, and innkeeper communication
5. **Admin Dashboard**: Enable staff to monitor rooms, manage bookings, approve/reject reservations, and configure system settings
6. **Asynchronous Processing**: Use job queues for automatic check-in/checkout operations based on configurable timers
7. **WhatsApp Notifications**: Send booking confirmations, access credentials, and status updates via WhatsApp service
8. **Payment Tracking**: Store payment method information (currently placeholder for payment gateway integration)

---

## Database Schema

The database is built using Prisma ORM with MySQL/MariaDB and is structured around three main domains:

### Admin Domain Models

**Admin**
- Single central configuration record for the entire system
- Stores global settings like auto-approval configuration, smart door defaults, checkout grace periods, and staff permissions
- Fields:
  - `isAutoApprove`: Boolean to enable automatic booking approval
  - `autoApproveTime`: Minutes to wait before auto-approving (0 = instant)
  - `smartDoorDefaultPin`: Default PIN when no booking is active
  - `checkOutGracePeriod`: Minutes guests have after checkout before door locks
  - `isStaffAllowedToApprove`: Whether staff can approve bookings (only managers by default)
  - `isStaffAllowedToForceCheckout`: Whether staff can force checkout active bookings
  - `isStaffAllowedToDismissCall`: Whether staff can dismiss innkeeper calls

**AdminUsers**
- Staff accounts with role-based access
- Types: `manager` (full permissions) or `staff` (limited permissions based on Admin settings)
- Fields:
  - `name`, `username`: User identification
  - `password`: Bcrypt-hashed password
  - `refreshToken`: UUID used for JWT token refresh mechanism
  - `createdAt`: Account creation timestamp
  - Relations: Belongs to `Admin` record

**AdminNotifications**
- System notifications for administrators
- Types: `info`, `warning`, `important`
- Fields:
  - `title`, `description`: Notification content
  - `createdAt`: Timestamp
  - Relations: Belongs to `Admin` record

### Room Domain Models

**Rooms**
- Core room records representing physical boarding house units
- Fields:
  - `name`, `price`: Room identifier and nightly rate
  - `capacity`, `description`: Room specifications
  - `isAvailable`: Boolean indicating if room can be booked (false when occupied)
  - `accountId`: Unique identifier assigned during check-in, used as authorization token by guests
  - `smartDoorPin`: Current PIN for smart door access (rotates per booking)
  - `smartDoorIsLocked`, `smartDoorIsOpened`: Real-time smart door status
  - `electricityOutput`, `waterOutput`: Utility consumption metrics
  - Relations: Has many `Bookings`, `RoomsFeatures`, `RoomsAddons`

**RoomsFeatures**
- List of amenities/features available in each room (e.g., "WiFi", "Air Conditioning", "Private Bathroom")
- Fields:
  - `feature`: Feature description
  - Relations: Belongs to `Rooms`

**RoomsAddons**
- Junction table linking rooms to available add-on services (e.g., extra towels, laundry service)
- Fields:
  - `borrowMaximum`: Max quantity guest can order of this addon
  - Relations: Links `Rooms` ↔ `Addons` with many-to-many

**Addons**
- Add-on services that can be borrowed/purchased during stay
- Fields:
  - `addon`: Service name (e.g., "extra pillow", "laundry service")
  - `price`: Per-unit cost
  - `borrowMaximum`: Global maximum borrowable quantity
  - Relations: Has many `RoomsAddons`, `BookingsAddons`

### Booking Domain Models

**Bookings**
- Reservation records representing guest stays
- Status flow: `on_hold` → `checked_in` → `checking_out` → `checked_out` (or rejected)
- Fields:
  - `room_id`: Associated room
  - `status`: Current stage in booking lifecycle
  - `name`, `phoneNumber`: Guest information (masked in API responses)
  - `duration`: Number of days booked
  - `price`: Total cost (room + addons)
  - `paymentMethod`: Placeholder for payment type (currently "e-money")
  - `isAddonServed`: Boolean tracking if all requested addons were delivered
  - `isInnkeeperCalled`: Boolean tracking if guest has called for innkeeper assistance
  - `isAutoApprove`: Copied from Admin settings at booking time
  - `autoApproveTime`: Copied from Admin settings at booking time
  - `checkoutGraceTime`: Minutes remaining in checkout grace period
  - `createdAt`, `updatedAt`: Timestamps
  - Relations: Belongs to `Rooms`, has many `BookingsAddons`, `BookingsNotifications`

**BookingsAddons**
- Junction table linking bookings to ordered addons with quantities
- Fields:
  - `count`: Quantity ordered
  - Relations: Links `Bookings` ↔ `Addons`

**BookingsNotifications**
- Per-booking notifications sent to guests
- Types: `info`, `warning`, `important`
- Fields:
  - `title`, `description`: Notification content
  - `createdAt`: Timestamp
  - Relations: Belongs to `Bookings`

---

## User Data Flow

The guest booking experience follows this flow:

### 1. Room Discovery
- **Endpoint**: `GET /rooms` (paginated)
- Guest retrieves list of available rooms with pagination support
- Response includes: room ID, name, price, capacity, availability status
- Query params: `page`, `limit`, `order_by` (default: name), `order` (asc/desc)

### 2. Room Details
- **Endpoint**: `GET /rooms/:id`
- Guest views specific room including features and available add-ons
- Response includes: room specs, features array, addons with pricing and borrow limits
- Data is cleaned to flatten nested relations for frontend consumption

### 3. Booking Creation (QR Code Trigger)
- **Endpoint**: `POST /bookings`
- Request payload:
  ```json
  {
    "room_id": 1,
    "full_name": "John Doe",
    "phone_number": "+62812345678",
    "duration": 3,
    "addons": [
      { "id": 1, "count": 2 },
      { "id": 2, "count": 1 }
    ]
  }
  ```
- System validates:
  - Room exists and is available (`isAvailable === true`)
  - All requested addons exist in room's addon list
  - Addon quantities don't exceed `borrowMaximum`
- Calculates total price: `(room.price × duration) + sum(addon.price × count for each addon)`
- Checks Admin auto-approval settings to determine initial booking status
- Creates booking record and related addon records
- Marks room as unavailable (`isAvailable = false`)
- Triggers appropriate async workflow based on approval status

### 4a. Approval Queue Path (Manual Approval)
If `Admin.isAutoApprove === false` OR `autoApproveTime > 0`:
- Booking status set to `on_hold`
- WhatsApp notification sent: "Your reservation is being reviewed"
- If `autoApproveTime > 0`, BullMQ job queued to auto-approve after N minutes
- Guest cannot access dashboard yet

### 4b. Instant Approval Path
If `Admin.isAutoApprove === true` AND `autoApproveTime === 0`:
- Booking status set to `checked_in` immediately
- `accountId` generated (unique identifier per booking)
- `smartDoorPin` generated (random 6-digit code)
- Room updated with new accountId and PIN
- WhatsApp sent with PIN and dashboard access URL
- Guest can immediately access dashboard

### 5. Booking Detail Check
- **Endpoint**: `GET /bookings/:id`
- Guest retrieves booking details with masked PII (name and phone partially hidden, price masked)
- Returns: name, phone, duration, price, payment method, room name, auto-approve status, creation time
- No authorization required (designed for QR code link scenarios)

### 6. Guest Dashboard Access
- **Endpoint**: `GET /dashboard/:id` + `GET /dashboard/:id/check`
- **Guard**: `DashboardGuard` validates:
  - URL param `:id` is a valid room ID
  - `Authorization` header contains `Bearer {accountId}`
  - Room has active booking with `checked_in` status
- Returns room info, booking metrics, real-time smart door status, and last 5 notifications
- Response includes: room details, addon served status, innkeeper called status, utility metrics

### 7. Innkeeper Communication
- **Endpoint**: `PATCH /dashboard/:id/call`
- Query: `value=true|false` to toggle innkeeper call state
- Updates `isInnkeeperCalled` in booking
- If toggled to true, creates notification: "Innkeeper has been called"
- Staff receives alert via admin dashboard

### 8. Notification Retrieval
- **Endpoint**: `GET /dashboard/:id/notifications`
- Paginated list of notifications for current booking
- Query params: `page`, `limit`, `order_by` (default: createdAt), `order`, `filter_type` (array of notification types)
- Returns notifications with type, title, description, timestamp

### 9. Checkout Initiation
- **Endpoint**: `POST /bookings/:id/checkout`
- **Guard**: `RoomGuard` validates `Authorization` header contains correct `accountId`
- Checks admin `checkOutGracePeriod` setting:
  - If 0: Immediate checkout → room restored to available, PIN reset, door unlocked
  - If > 0: Grace period applied → booking status set to `checking_out`, BullMQ job queued
- Notification sent with grace period duration
- Booking status transitions from `checked_in` → `checking_out` or directly → `checked_out`

### 10. Checkout Grace Period
- If grace period > 0, guest has N minutes to vacate after initiating checkout
- After grace expires, automatic job:
  - Updates booking status to `checked_out`
  - Resets room PIN to default (`Admin.smartDoorDefaultPin`)
  - Clears `accountId` from room
  - Sets `isAvailable = true`
  - Sends final WhatsApp: "You have checked out, thank you for staying"

### Guest Data Protection
- Phone numbers and names masked in API responses using `maskdata` library
- Phone: First 3 and last 3 digits visible
- Name: First character and last 2 characters visible
- Price returned as masked string
- `accountId` serves as temporary authorization token (no persistent session needed)

---

## Admin Data Flow

Administrators access a separate authenticated portal with role-based restrictions:

### 1. Admin Authentication
- **Endpoint**: `POST /admins/auth`
- Credentials: `username`, `password`
- System:
  - Finds `AdminUsers` record by username
  - Validates password using bcrypt comparison
  - Generates UUID `refreshToken` and stores in database
  - Signs JWT token with payload: `{ id, username, type }`
  - Returns both `refreshToken` and `activeToken`
- Response:
  ```json
  {
    "refreshToken": "550e8400-e29b-41d4-a716-446655440000",
    "activeToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

### 2. Token Refresh
- **Endpoint**: `POST /admins/auth/refresh`
- Payload: `{ "refresh_token": "..." }`
- System validates refresh token in database and issues new `activeToken`
- No new refresh token issued

### 3. Admin Logout
- **Endpoint**: `DELETE /admins/auth`
- **Guard**: `JwtAuthGuard` validates JWT
- Clears `refreshToken` from AdminUsers record
- Subsequent refresh attempts fail

### 4. Get User Info
- **Endpoint**: `GET /admins/dashboard`
- **Guard**: `JwtAuthGuard` validates JWT token from header
- Returns current admin user: `id`, `name`, `type`, `username`

### 5. Rooms Management
- **Endpoint**: `GET /admins/dashboard/rooms`
- Query params:
  - `page`, `limit`: Pagination
  - `order_by`, `order`: Sort by name/id/availability
  - `filter_available_room`: "true" | "false" | "both"
  - `include_booking`: Boolean to include active booking details
  - `filter_booking_status`: Array of statuses to include
  - `room_name`: Search by room name
  - `filter_call`: Boolean to filter by innkeeper called status
  - `filter_addon_served`: Boolean to filter by addon served status
- Returns paginated rooms with optional active booking details
- Metadata includes staff permission flags (whether staff can approve, force checkout, dismiss calls)
- **Use Case**: Staff views all rooms, filters for those with active bookings or pending calls

### 6. Bookings Management
- **Endpoint**: `GET /admins/dashboard/bookings`
- Query params:
  - `page`, `limit`: Pagination
  - `order_by`, `order`: Sort by createdAt, name, room name, etc.
  - `filter_booking_status`: Array of booking statuses
  - `booking_name`, `booking_phone_number`: Search filters
  - `room_name`: Search by room name
  - `payment_method`: Filter by payment type
  - `include_room`: Boolean to include room details
  - `filter_call`, `filter_addon_served`, `filter_auto_approve`: Boolean filters
- Returns paginated bookings with related room data
- **Use Case**: Admin views all bookings, searches by guest name/phone, filters by status (e.g., on_hold bookings pending approval)

### 7. Admin Users Management
- **Endpoint**: `GET /admins/dashboard/users`
- Query params:
  - `page`, `limit`: Pagination
  - `filter_type`: Array of user types (manager, staff)
  - `filter_admin_id`: Filter by admin ID
  - `name`, `username`: Search filters
  - `include_admin`: Include Admin settings in response
  - `order_by`, `order`: Sort
- Returns paginated admin user accounts
- **Use Case**: Manager views staff accounts, creates/manages permissions

### 8. System Settings
- **Endpoint**: `GET /admins/dashboard/settings`
- **Guard**: `JwtAuthGuard`
- Returns Admin record:
  - `is_auto_approve`: Auto-approval toggle
  - `auto_approve_time`: Minutes before auto-approval
  - `smart_door_default_pin`: Default lock PIN
  - `checkout_grace_period`: Grace period in minutes
  - `is_staff_allowed_to_approve`: Staff approval permission
  - `is_staff_allowed_to_force_checkout`: Force checkout permission
  - `is_staff_allowed_to_dismiss_call`: Dismiss innkeeper call permission
- **Use Case**: Managers configure system behavior

### 9. Booking Approval
- **Endpoint**: `PATCH /admins/dashboard/bookings/approve`
- Payload: `{ "booking_id": 1 }`
- **Guard**: `JwtAuthGuard` + permission check (only if `isStaffAllowedToApprove === true` for staff)
- For `on_hold` booking:
  - Generates `accountId` and `smartDoorPin`
  - Updates room with new credentials
  - Changes booking status to `checked_in`
  - Sends WhatsApp with PIN and dashboard URL
  - Creates notification in BookingsNotifications
- **Use Case**: Staff approves pending reservations

### 10. Dismiss Innkeeper Call
- **Endpoint**: `PATCH /admins/dashboard/bookings/dismiss`
- Payload: `{ "booking_id": 1 }`
- **Guard**: Permission check (only if `isStaffAllowedToDismissCall === true` for staff)
- Sets `isInnkeeperCalled = false` in booking
- **Use Case**: After attending to guest, staff dismisses the call

### 11. Force Checkout
- **Endpoint**: `PATCH /admins/dashboard/bookings/checkout`
- Payload: `{ "booking_id": 1 }`
- **Guard**: Permission check (only if `isStaffAllowedToForceCheckout === true` for staff)
- For active booking:
  - Resets room PIN to default
  - Clears `accountId`
  - Sets `isAvailable = true`
  - Changes booking status to `checked_out`
  - Sends WhatsApp notification
- **Use Case**: Remove guest immediately (e.g., for rule violation)

### 12. Mark Addon Served
- **Endpoint**: `PATCH /admins/dashboard/bookings/served`
- Payload: `{ "booking_id": 1 }`
- Sets `isAddonServed = true` in booking
- **Use Case**: Staff confirms all ordered addons were delivered

---

## System Architecture & Integration

### Technology Stack
- **Framework**: NestJS with TypeScript
- **Database**: MySQL/MariaDB via Prisma ORM
- **Job Queue**: BullMQ (Redis-based) for async operations
- **Authentication**: JWT (Bearer tokens) + UUID refresh tokens
- **External Service**: WhatsApp gateway (configurable via `WHATSAPP_SERVICE_URL` env var)
- **Security**: Bcrypt for password hashing, data masking for PII

### Request/Response Flow

```
User/Admin Request → Controller → Guard (validation) → Service (business logic) 
  → Prisma (database) → Response

Async Operations → BullMQ Queue → Processor → Service methods → Database + WhatsApp
```

### Guards (Authorization/Validation)

1. **JwtAuthGuard** (`src/admins/guard/jwt-auth-guard.guard.ts`)
   - Validates JWT token from `Authorization: Bearer {token}` header
   - Extracts and verifies JWT signature
   - Attaches decoded payload to request for use in controllers/services
   - Used by all `/admins/` endpoints

2. **DashboardGuard** (`src/dashboard/guard/dashboard.guard.ts`)
   - Validates guest dashboard access
   - Checks room ID in URL params
   - Validates `accountId` in Authorization header matches room's current accountId
   - Confirms room has active `checked_in` booking
   - Fetches and attaches full room data with active booking to request
   - Used by `/dashboard/:id` endpoints

3. **RoomGuard** (`src/bookings/guard/rooms.guard.ts`)
   - Validates checkout requests
   - Confirms `accountId` matches the room being checked out from

### Async Job Processing (BullMQ)

**booking-queue**
- `auto-checkin` job: Triggered when booking created with approval delay
  - Runs after `Admin.autoApproveTime` minutes
  - Calls `BookingsService.checkedIn()` to generate credentials and send WhatsApp
- `auto_checkout` job: Triggered when guest initiates checkout with grace period
  - Runs after `Admin.checkOutGracePeriod` minutes
  - Calls `BookingsService.checkedOut()` to reset room and mark booking complete

**admin-booking-queue**
- Same jobs but can be triggered by admin force operations

### WhatsApp Integration

The system sends WhatsApp messages at key points:

1. **On Hold Notification** (if booking approval is delayed)
   - Message: "Reservation is being reviewed, we will notify you"
   - Sent via: `BookingsService.onHold()`

2. **Check-In Confirmation** (booking approved)
   - Message: Includes PIN, dashboard URL, accountId
   - Example: "Your request approved. PIN: 157359. Access: http://... AccountId: ..."
   - Sent via: `BookingsService.checkedIn()`

3. **Checkout Grace Period** (if grace period > 0)
   - Message: "You checked out. You have X minutes to pack before door locks"
   - Sent via: `BookingsService.checkingOut()`

4. **Checkout Complete** (after grace period OR instant checkout)
   - Message: "You have checked out. PIN and dashboard are now unusable"
   - Sent via: `BookingsService.checkedOut()`

All messages sent to `booking.phoneNumber` via `axios` POST to `WHATSAPP_SERVICE_URL`

### Data Masking

Privacy is enforced via `maskdata` library in booking detail responses:
- Phone: 3 visible digits on each end, middle obscured
- Name: First char + last 2 chars visible
- Price: Fully masked

---

## Core Business Logic Flows

### Complete Booking Flow (Instant Approval)

```
1. Guest scans QR → POST /bookings with room_id, name, phone, duration, addons
2. System validates room availability, addons, calculates price
3. Checks Admin.isAutoApprove (true) + autoApproveTime (0)
4. Creates Booking with status="checked_in"
5. Generates accountId (e.g., "ACC-2024-08-05-001")
6. Generates smartDoorPin (e.g., "157359")
7. Updates Room: isAvailable=false, accountId="ACC-...", smartDoorPin="157359"
8. Sends WhatsApp: "PIN: 157359, Access dashboard at: http://..., AccountId: ACC-..."
9. Guest uses PIN to unlock door
10. Guest accesses dashboard via GET /dashboard/:id with Bearer ACC-... token
11. Innkeeper communication via PATCH /dashboard/:id/call
12. Checkout via POST /bookings/:id/checkout
    - If grace_period=0: immediate status=checked_out, room reset
    - If grace_period>0: status=checking_out, BullMQ job queued for auto-reset
```

### Approval Queue Flow (Manual Approval)

```
1. Guest POST /bookings → status="on_hold" (Admin.autoApproveTime > 0 OR isAutoApprove=false)
2. BullMQ "auto-checkin" job queued (if autoApproveTime > 0)
3. Sends WhatsApp: "Reservation under review, we'll notify you"
4. Guest waits for approval notification
5. After N minutes (or staff approval):
   - Generate accountId and PIN
   - Update Room with credentials
   - Change Booking status to "checked_in"
   - Send WhatsApp with access details
6. Guest receives credentials and can now check in
```

### Grace Period Checkout Flow

```
1. Guest POST /bookings/:id/checkout (status=checked_in)
2. Admin.checkOutGracePeriod = 30 minutes
3. Booking status changed to "checking_out"
4. BullMQ "auto_checkout" job queued for 30 minutes later
5. Guest has 30 minutes to pack and leave
6. WhatsApp: "You have 30 minutes before door PIN expires"
7. After 30 minutes, auto_checkout job runs:
   - Updates Booking status to "checked_out"
   - Resets Room PIN to default
   - Clears Room accountId
   - Sets Room isAvailable=true
   - Sends WhatsApp: "Checkout complete, thank you for staying"
```

---

## Key Features & Considerations

### Smart Door Integration
- Room PIN rotates per booking (no guest reuse of credentials)
- Default PIN set for unoccupied rooms
- PIN stored in Room record, allows hardware integration via future endpoint

### Role-Based Access Control
- **Manager**: Full admin access (approve, force checkout, dismiss calls, settings)
- **Staff**: Limited based on Admin configuration flags

### Flexible Auto-Approval
- `isAutoApprove=false`: All bookings require manual staff approval
- `isAutoApprove=true, autoApproveTime=0`: Instant approval, immediate PIN generation
- `isAutoApprove=true, autoApproveTime>0`: Delayed approval via job queue

### Add-on System
- Per-room addon availability with quantity limits
- Track which addons delivered per booking
- Separate pricing from room nightly rate

### Real-Time Metrics
- Smart door lock/unlock status
- Electricity and water consumption per room
- Innkeeper call status per booking
- Addon served status

### Payment Placeholder
- Currently stores `paymentMethod` as string (default: "e-money")
- Ready for payment gateway integration (await frontend implementation)

---

## Modules & Project Structure

```
src/
├── admins/
│   ├── admins-auth/          # Login, token refresh, logout
│   ├── dashboard/            # Booking/room/user/settings management
│   ├── dto/                  # Data transfer objects for validation
│   └── guard/                # JWT authentication guard
├── bookings/
│   ├── bookings.service      # Core booking logic (create, checkout)
│   ├── bookings.processor    # BullMQ job processor (auto-checkin/checkout)
│   ├── dto/                  # Booking payload validation
│   └── guard/                # Room access guard
├── dashboard/                # Guest booking dashboard
│   ├── guard/                # Dashboard authorization guard
│   └── dto/                  # Query/notification DTOs
├── rooms/                    # Room inventory
│   └── dto/                  # Pagination DTOs
├── helper/                   # Utility functions
│   ├── generate-account-id.ts
│   └── generate-room-pin.ts
├── prisma/                   # Database service
├── generated/                # Prisma client (auto-generated)
└── app.module.ts             # Root module
```

### Modules Overview
- **AdminsAuthModule**: Authentication & token management
- **AdminsDashboardModule**: Admin portal with management features
- **BookingsModule**: Booking creation, checkout, queue processing
- **DashboardModule**: Guest-facing booking dashboard
- **RoomsModule**: Room listing and details
- **PrismaModule**: Database access layer
- **BullModule**: Job queue configuration
- **ScheduleModule**: Scheduled task support

---

## Environment Variables

Required in `.env`:
- `DATABASE_URL`: MySQL/MariaDB connection string
- `JWT_SECRET`: Secret key for signing JWT tokens
- `WHATSAPP_SERVICE_URL`: URL to WhatsApp notification service (default: http://localhost:3001)
- `REDIS_HOST`, `REDIS_PORT`: BullMQ Redis connection

---

## Missing Components (For Future Implementation)

1. **Payment Gateway Integration**
   - Replace `paymentMethod: "e-money"` placeholder with actual payment processing
   - Add payment verification before checkout
   - Store transaction IDs and payment status

2. **WebSocket Real-Time Updates**
   - Framework already has `@nestjs/websockets` installed
   - Can emit real-time notifications to connected clients (staff/guests)

3. **Smart Door Hardware API**
   - PIN generation exists, but actual door control API calls needed
   - Lock/unlock endpoint triggering

4. **Advanced Reporting**
   - Revenue analytics per room/period
   - Occupancy rate tracking
   - Guest analytics

5. **Rate Limiting & Validation**
   - Additional input validation for edge cases
   - Rate limiting on booking endpoint to prevent abuse

---

## Frontend Integration Points

Frontend should implement:

1. **Guest Flow**
   - Room browsing UI (GET /rooms, GET /rooms/:id)
   - Booking form (POST /bookings)
   - Dashboard with innkeeper call button (GET/PATCH /dashboard/:id)
   - Notification center (GET /dashboard/:id/notifications)
   - Checkout confirmation (POST /bookings/:id/checkout)
   - QR code generation for room links

2. **Admin Flow**
   - Login screen (POST /admins/auth)
   - Admin dashboard with metrics
   - Room management (GET /admins/dashboard/rooms)
   - Booking queue with approve/reject/force-checkout buttons
   - Settings page to configure auto-approval, grace periods, staff permissions
   - Admin users management (GET /admins/dashboard/users)

3. **Authentication**
   - Store `refreshToken` and `activeToken` from login response
   - Attach `activeToken` as Bearer token in Authorization header for admin requests
   - Attach `accountId` as Bearer token in Authorization header for guest dashboard

---

## Summary

The Innavance backend is a production-ready NestJS application implementing a complete boarding house management system. It handles the full lifecycle of guest stays from room discovery through checkout, with flexible approval workflows, real-time smart door integration, and comprehensive admin controls. The architecture separates guest and admin concerns with appropriate security guards, uses BullMQ for reliable async processing, and integrates WhatsApp for customer communication. The system is extensible for payment gateway integration and real-time features, with a well-organized module structure ready for frontend development.
