# Activity Logging Tests

Tests for verifying that user activities are properly logged across donation, stall, and program workflows.

## What Gets Logged

### Donor Activities
- `DONATION_MONETARY_CREATED` - When a donor creates a monetary donation
- `DONATION_PRODUCE_SCHEDULED` - When a donor schedules a produce donation
- `STALL_RESERVATION_CREATED` - When a donor reserves a stall for a program
- `STALL_CLAIMED` - When a donor's stall is scanned and checked in

### Beneficiary Activities
- `PROGRAM_APPLICATION_CREATED` - When a beneficiary is approved for a program
- `PROGRAM_FOOD_CLAIMED` - When a beneficiary scans their QR to claim food

## Running the Tests

### Quick Verification (No Server Required)
```powershell
node tests/activity-logging/test-implementation.mjs
```

This verifies all activity logging code has been implemented correctly and displays the structure and action types.

### In-Memory Mode (No DB)
Start backend with in-memory mode:
```powershell
set TEST_USE_MEMORY=true
npm run dev
```

In another terminal, run integration tests:
```powershell
node tests/activity-logging/test-activity-logging.mjs
```

### Real Database Mode
```powershell
npm run dev
```

Then in another terminal (with real donor/beneficiary IDs):
```powershell
node tests/activity-logging/test-activity-logging.mjs
```

## Test Files

- **`test-implementation.mjs`** - Verifies all activity logging code is in place (no server needed)
- **`test-activity-logging.mjs`** - Integration tests that create donations and verify logging
- **`README.md`** - This documentation

## Implementation Details

All activity logging is implemented via a `logActivity()` helper function that:
1. Checks if user ID exists
2. Creates an `ActivityLog` record in the database
3. Fails gracefully (logs error but doesn't break main flow)

### Files Modified

1. **donation.service.ts** - Logs monetary & produce donation activities
2. **stallReservation.service.ts** - Logs stall reservation & claim activities  
3. **programApplication.service.ts** - Logs program application & food claim activities
4. **prismaMock.ts** - Added ActivityLog support for in-memory testing

## Activity Log Structure

```typescript
{
  id:        string    // UUID
  userId:    string    // User who performed action
  action:    string    // Action type (see above)
  details:   string?   // Optional context
  createdAt: DateTime  // Timestamp
}
```

## Accessing Activity Logs

Activity logs are accessible via the `User.activityLogs` relation in Prisma:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { activityLogs: { orderBy: { createdAt: 'desc' } } }
});

console.log(user.activityLogs); // Array of ActivityLog records
```

## Next Steps

1. ✅ Activity logging implemented across all major user actions
2. Create a `GET /users/:userId/activities` endpoint to retrieve activity history
3. Create an admin dashboard to view user activities
4. Implement activity filtering (by action type, date range, etc.)
5. Add activity analytics/reporting

