# Innavance Frontend Page Plan

This document serves as a guide for building the frontend based on the Innavance low-fidelity wireframes and the established backend API structure.

## Overview

The application follows a dual-portal architecture:
1. **Guest Portal**: Publicly accessible booking flow (QR-based) and private Room Dashboard (authorized by AccountId).
2. **Admin Portal**: Authenticated management interface for boarding house staff and managers.

---

## Look and Feel

The application should feel modern and minimalistic. The color should lean toward white with an addition of colors like red, green, blue for smaller status cards or such so it pops out from the rest.

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
- **Look**: One cards in the middle, splitted by two, on the left there is a placeholder room image, and the right is the actual content with a button and text. The border radius should be medium and the card should emit a shadow behind it. There is a logo and a tagline above the main card.

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
- **Logic**: A bridge from the Room Booking Detail to Booking Payment.
- **Look**: Same as Room Booking Detail, The page shouldn't change, instead it should be state driven. One cards in the middle, splitted by two, on the left instead of image, it is the content of the left side of the card from the Room Booking Detail, and the right is the new content with some inputs, button, trust element, and text. The border radius should be medium and the card should emit a shadow behind it. There is a logo and a tagline above the main card.

### Page: Booking Payment
- **Wireframe**: `Booking Payment Gateway - Desktop`
- **Goal**: Handle payment processing.
- **Content**:
    - Payment methods selection
    - Total price display
- **Logic**: Calls `POST /bookings`. Validates user inputs via `BookBodyDto`.
- **Look**: Same as Reserve Room Form, The page shouldn't change, instead it should be state driven. One cards in the middle, splitted by two, on the left, its there is a  room name, the full name, phone number, booking duration, extra addons, and the final price. On the right, there is some a payment method button and the user have to choose one of them.

### Page: Booking Success
- **Wireframe**: `Booking Payment Success - Desktop`
- **Goal**: Final confirmation after payment.
- **Content**:
    - Success message
    - Navigation button to Approval Status page
- **Look**: a logo with a tittle, description, and button that shows the payment is a success or failed. The button should redirect user to the approval status page, or to retry the Booking Payment

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
- **Look**: One card in the middle with an application logo in the top left corner. The card shows the room name, status, the auto approve countdown if the auto approve is true, and a notice to tell the user to check for incoming whatsapp message confirming its been approved or rejected. And it should show the price, payment method, phone number, and the user full name too. Below the card, it should have a small hyperlink to the Room Dashboard page.

---

## 3. Guest Room Dashboard

### Page: User Dashboard Login
- **Wireframe**: `User Room Dashboard Login - Desktop`
- **Goal**: Authorize guest access using `AccountId`.
- **Content**:
    - Input for `AccountId`
    - Submit button
- **Logic**: Store `AccountId` in localStorage/session, add to `Authorization: Bearer <AccountId>` header for dashboard requests.
-  **Look**: One card in the middle with an application logo in the top left corner. The card have a sign in tittle with a description below it. There is an input for accountId and a sign in button. Below the card, there is a small hyperlink to go to the approval status page.

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
- **Logic**: Calls `GET /dashboard/:id`, `PATCH /dashboard/:id/call`, `GET /dashboard/:id/notifications`, `POST /bookings/:id/checkout`.
- **Look**: There is an application logo in the top left corner along with the logout button in the top right corner. In the middle, there is 3 main cards along with two buttons. The first card is filled with welcome string and the user full name, duration left of the booking or the grace period left with a notice, the room extra addon that the user order. The second card is filled with the room detail tittle with the smart door locked and opened state, electricity output, and water output. The third card is filled with a notification tittle with some notifications below, each notification has an icon in the left and a tittle with a description in the right along with a small time in the bottom right. There is a show all button for the third card that will generate a pop up of all the notitications paginated with a filter and sorting ability. There is a button to call of Innkeeper and checkout. If the user pressed call for Innkeeper, it will produce a pop up that has the call Innkeeper confirmation title, a description for what it does, and a cancel or call button. The checkout button will produce two different popup according to the time left, if the time left of the booking is still has 1 day or more, the pop up will have the duration left and a warning description with a trust element that the user have to click to agree, also a cancel and checkout confirm button. If the time left is below 1 day, then the warning description is gone but its still has a trust element that the user have to check before confirming. The UI consist of all the cards and button in the middle with a distinct split in the middle. In the left, there is a first and second card stacked, in the right, there is two buttons beside each other stacked with the third card.
---

## 4. Admin Portal

### Pages: Admin Dashboard
- **Wireframes**: `Admin Dashboard Home`, `Rooms`, `History`, `Settings`
- **Goal**: Management interface for boarding house staff.
- **Common Features**:
    - Sidebar navigation (Home, Rooms, History, Users, Settings, Logout)
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
- **Look**: A sidebar with a logo and a string that says admin panel below it, and a buttons 'home', 'rooms', 'history', 'users' (manager only), 'settings' in the midde with a 'logout' in the bottom. 

---

## Frontend Technical Considerations

- **State Management**: Use React Query (or similar) to handle API data fetching, caching, and state synchronization.
- **API Communication**: Create an Axios instance with interceptors:
    - Admin Portal: Inject `Authorization: Bearer <activeToken>`.
    - Guest Portal: Inject `Authorization: Bearer <accountId>` for dashboard requests.
- **Typography/Colors**: Refer to the look and feel with a font of Inter.
- **Validation**: Re-use DTO structure in frontend form validation (e.g., Zod schemas mirroring NestJS DTOs).
- **Asynchronous UI**: Ensure loading and error states are handled for all dashboard metrics.
