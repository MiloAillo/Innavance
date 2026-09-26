# HTTP Polling Implementation

## Overview
Implemented smart HTTP polling for the admin dashboard to auto-refresh data every 5 seconds without requiring WebSocket connections.

## Implementation Date
2026-08-30

## Changes Made

### 1. New Files Created

#### `frontend/src/hooks/useViewPolling.ts`
- Custom React hook for view-aware polling
- Features:
  - Configurable polling interval (default: 5000ms)
  - Automatic pause when browser tab is inactive (Page Visibility API)
  - Prevents overlapping requests
  - Auto-cleanup on unmount
  - Immediate fetch on view switch + dependency changes
  - Error handling with console logging

### 2. Modified Files

#### `frontend/src/components/admin-sidebar.tsx`
- Added `isPolling` prop to display live status indicator
- Visual feedback: Green pulsing dot + "LIVE" badge
- Shows when polling is active (all views except settings)

#### `frontend/src/pages/admin-dashboard/adminDashboard.tsx`
- Imported and integrated `useViewPolling` hook
- Created separate data loading functions:
  - `loadHomeData()` - Polls approval queue, attention items, active bookings
  - `loadRoomsData()` - Polls room status and occupancy
  - `loadHistoryData()` - Polls completed/rejected bookings
  - `loadUsersData()` - Polls staff list (managers only)
- Replaced manual `useEffect` chains with polling hooks
- Each view has independent 5-second polling when active
- Settings view has no polling (configuration data)

## Polling Strategy

### View-Based Polling
| View | Polling Enabled | Data Refreshed | Interval |
|------|----------------|----------------|----------|
| Home | Yes | Approvals, Attention, Active Bookings | 5s |
| Rooms | Yes | Room status, occupancy | 5s |
| History | Yes | Completed/rejected bookings | 5s |
| Users | Yes (managers only) | Staff list | 5s |
| Settings | No | N/A | N/A |

### Smart Behavior
1. **On tab switch**: Immediate fetch + start 5-second interval
2. **On filter/pagination change**: Immediate fetch + reset interval
3. **On user action** (approve, reject, etc.): Full refresh via `refreshAfterAction()`
4. **On tab blur**: Pause all polling (saves bandwidth)
5. **On tab focus**: Resume polling with immediate fetch

## Benefits

### User Experience
- Real-time updates without manual refresh
- Admin sees new bookings within 5 seconds
- Visual "LIVE" indicator for confidence
- No disruption during user interactions

### Technical
- No WebSocket complexity or connection management
- Works with existing REST endpoints
- Minimal backend changes (none required)
- Automatic cleanup prevents memory leaks
- Tab visibility optimization saves resources

### Performance
- Polls only active view (not all data)
- Pauses when tab is inactive
- Prevents duplicate requests with `isPollingRef`
- Respects existing pagination limits

## Testing Checklist

- [ ] Admin dashboard loads without errors
- [ ] "LIVE" indicator appears in sidebar (except Settings)
- [ ] New bookings appear within 5 seconds on Home view
- [ ] Room status updates within 5 seconds on Rooms view
- [ ] Polling pauses when switching to another browser tab
- [ ] Polling resumes when returning to the tab
- [ ] Switching between views triggers immediate data fetch
- [ ] Filter/pagination changes trigger immediate refresh
- [ ] Manual actions (approve/reject) trigger full refresh
- [ ] No memory leaks after extended use
- [ ] No console errors related to polling

## Configuration

To change the polling interval, modify the `interval` parameter in `useViewPolling` calls in `adminDashboard.tsx`:

```typescript
useViewPolling({
  enabled: !loading && view === "home",
  interval: 3000, // Change from 5000 to 3000 for 3-second polling
  onPoll: loadHomeData,
  dependencies: [/* ... */],
});
```

## Future Enhancements

1. **Adaptive polling**: Slow down when no changes detected
2. **Manual refresh button**: Allow admin to force refresh
3. **Last updated timestamp**: Show when data was last refreshed
4. **Notification sound**: Alert on new bookings requiring attention
5. **WebSocket migration**: If needed for true real-time updates

## Rollback

To disable polling and revert to manual refresh:
1. Remove `useViewPolling` hook calls from `adminDashboard.tsx`
2. Restore original `useEffect` chains for data loading
3. Remove `isPolling` prop from `AdminSidebar` component

## Notes

- Polling only affects frontend; backend endpoints unchanged
- Compatible with existing admin authentication flow
- Gracefully handles API errors without crashing
- ESLint warnings suppressed where intentional (spread dependencies)
