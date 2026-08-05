# WebSocket Room Metrics API

## Overview
The websocket gateway provides real-time room metrics with authentication support for both users and admins. Metrics are updated every 5 seconds (minimum interval).

## Connection Details
- **Namespace**: `/metrics`
- **URL**: `ws://localhost:3000/metrics`
- **Authentication**: Required via Bearer token in connection headers

## Authentication Methods

### 1. User Authentication (Simple AccountId)
Users connect using their `accountId` as the bearer token:

```javascript
// Connect as user
const socket = io('http://localhost:3000/metrics', {
  auth: {
    token: 'user-account-id-123'  // Plain accountId string
  }
});
```

### 2. Admin Authentication (JWT Token)
Admins connect using JWT tokens obtained from the admin login endpoint:

```javascript
// Connect as admin
const socket = io('http://localhost:3000/metrics', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // JWT token
  }
});
```

## Events

### Server to Client Events

#### `metrics:initial`
Emitted immediately after successful connection with initial room metrics.

**Payload**: Array of MetricsData objects
```typescript
interface MetricsData {
  roomId: number;
  accountId: string | null;
  smartDoorIsLocked: boolean;
  smartDoorIsOpened: boolean;
  electricityOutput: number;
  waterOutput: number;
}
```

#### `metrics:update`
Emitted every 5 seconds with updated room metrics.

**Payload**: Same as `metrics:initial`

#### `metrics:response`
Emitted in response to `metrics:request` message.

**Payload**: Same as `metrics:initial`

### Client to Server Events

#### `metrics:request`
Request specific room metrics (admin only for specific rooms).

**Payload** (optional):
```typescript
{
  accountId?: string;  // Optional: Request specific room by accountId
}
```

## Access Control

### User Access
- Can only access metrics for their own room (by accountId)
- Receives updates only for their specific room
- Cannot request other room metrics

### Admin Access
- Can access metrics for all rooms
- Receives updates for all rooms
- Can optionally request specific room metrics using `accountId` parameter

## Example Usage

### User Client Example
```javascript
const socket = io('http://localhost:3000/metrics', {
  auth: {
    token: 'user-account-id-123'
  }
});

socket.on('metrics:initial', (metrics) => {
  console.log('Initial metrics:', metrics);
});

socket.on('metrics:update', (metrics) => {
  console.log('Updated metrics:', metrics);
});
```

### Admin Client Example
```javascript
const socket = io('http://localhost:3000/metrics', {
  auth: {
    token: 'admin-jwt-token'
  }
});

socket.on('metrics:initial', (metrics) => {
  console.log('All rooms metrics:', metrics);
});

socket.on('metrics:update', (metrics) => {
  console.log('Updated all rooms metrics:', metrics);
});

// Request specific room metrics
socket.emit('metrics:request', { accountId: 'specific-account-id' });
```

## Integration with Existing System

### User Flow
1. User obtains `accountId` from room assignment
2. User connects to websocket using accountId as token
3. Receives real-time metrics for their specific room

### Admin Flow
1. Admin logs in via `/admins/auth/login` endpoint
2. Receives JWT token in response
3. Connects to websocket using JWT token
4. Receives real-time metrics for all rooms

## Security Notes
- All connections require authentication
- Users can only access their own room data
- Admin tokens are validated against JWT_SECRET
- AccountId tokens are validated against database
- Connection is terminated if authentication fails