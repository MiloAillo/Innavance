# Innavance Frontend Page Plan

This document serves as a guide for building the frontend based on the Innavance low-fidelity wireframes and the established backend API structure.

## Overview

The application follows a dual-portal architecture:
1. **Guest Portal**: Publicly accessible booking flow (QR-based) and private Room Dashboard (authorized by AccountId).
2. **Admin Portal**: Authenticated management interface for boarding house staff and managers.

---

## 1. Guest Booking Flow

### Page: Room Booking Detail
- **Wireframe**: `After QR Room Booking Detail - Desktop`
- **Goal**: Allow user to preview room details before starting a booking.
- **Content**:
    - Room Image (SVG placeholder)
    - Room Name, Features, Description
    - Price, Capacity, Availability
    - "Reserve Room" button (navigates to form)
- **Logic**: Calls `GET /rooms/:id`.

### Page: Reserve Room Form
- **Wireframe**: `Reserve Room Form - Desktop`
- **Goal**: Capture user booking details.
- **Content**:
    - Full Name input
    - Phone Number input
    - Duration counter
    - Add-ons section with quantity controls
    - Price calculation summary
    - Confirm button
- **Logic**: Calls `POST /bookings`. Validates user inputs via `BookBodyDto`.

### Page: Booking Payment
- **Wireframe**: `Booking Payment Gateway - Desktop`
- **Goal**: Handle payment processing (future placeholder).
- **Content**:
    - Payment methods selection
    - Total price display
    - Countdown timer (for reservation holding)
- **Logic**: Placeholder for future payment gateway integration.

### Page: Booking Success
- **Wireframe**: `Booking Payment Success - Desktop`
- **Goal**: Final confirmation after payment.
- **Content**:
    - Success message
    - Navigation button to Approval Status page

---

## 2. Approval Flow

### Pages: Approval Status (Not Found, Waiting, Approved)
- **Wireframe**: `Approval Status variants - Desktop`
- **Goal**: Guest portal for tracking reservation approval.
- **Content**:
    - Status display (Waiting vs Approved vs Not Found)
    - Auto-approve countdown (if applicable)
    - Redirect button to Room Dashboard (visible when approved)
- **Logic**: Calls `GET /bookings/:id`.

---

## 3. Guest Room Dashboard

### Page: User Dashboard Login
- **Wireframe**: `User Room Dashboard Login - Desktop`
- **Goal**: Authorize guest access using `AccountId`.
- **Content**:
    - Input for `AccountId`
    - Submit button
- **Logic**: Store `AccountId` in localStorage/session, add to `Authorization: Bearer <AccountId>` header for dashboard requests.

### Page: User Dashboard (Various States)
- **Wireframe**: `User Room Dashboard [Normal / Innkeeper Called / etc]`
- **Goal**: Guest hub for monitoring room and calling staff.
- **Common Content**:
    - Room Details & Booking Metrics (Status, Duration)
    - Hardware States (Lock/Open status, Utility usage)
    - Call Innkeeper (Toggle Button)
    - Checkout Button
    - Notifications Feed (Paginated)
- **Dynamic Content per state**:
    - *Innkeeper Called*: Button visual state changes (opacity 0.5)
    - *Duration Alert*: Shows time-left alert
    - *Checkout Confirmation*: Modal or confirmation dialog
    - *Grace Period*: Notification of remaining time after checkout initiation
- **Logic**: Calls `GET /dashboard/:id`, `PATCH /dashboard/:id/call`, `GET /dashboard/:id/notifications`.

---

## 4. Admin Portal

### Pages: Admin Dashboard
- **Wireframes**: `Admin Dashboard Home`, `Rooms`, `History`, `Settings`
- **Goal**: Management interface for boarding house staff.
- **Common Features**:
    - Sidebar navigation (Home, Rooms, History, Settings, Logout)
    - Authentication via JWT (stored in LocalStorage)
- **Home/Rooms**:
    - Overview metrics (Auto-approve status, etc.)
    - Paginated list of room cards.
    - Room cards show status, brief user detail, hardware metrics, and action buttons (Force Checkout, Mark Served, etc.)
- **History**: List of past bookings.
- **Settings**:
    - Global configurations (Auto-approve toggle, PIN rotation, grace period settings).
    - Experimental tab (Force hardware state changes).
- **Users Tab (Manager Only)**:
    - List of admin users with deletion capability.

---

## Frontend Technical Considerations

- **State Management**: Use React Query (or similar) to handle API data fetching, caching, and state synchronization.
- **API Communication**: Create an Axios instance with interceptors:
    - Admin Portal: Inject `Authorization: Bearer <activeToken>`.
    - Guest Portal: Inject `Authorization: Bearer <accountId>` for dashboard requests.
- **Typography/Colors**: Use the defined Figma global variables (Inter/Gloria Hallelujah, specific grays/blues/greens).
- **Validation**: Re-use DTO structure in frontend form validation (e.g., Zod schemas mirroring NestJS DTOs).
- **Asynchronous UI**: Ensure loading and error states are handled for all dashboard metrics.
