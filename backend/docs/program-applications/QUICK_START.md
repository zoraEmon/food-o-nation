# Program Application Quick Start Guide

## What Was Implemented

A complete QR code-based program application system where:
- Beneficiaries register for published programs
- Unique QR codes are generated for each application
- QR codes are emailed to beneficiaries
- Admins scan QR codes during relief distribution
- Application status automatically updates (COMPLETED/CANCELLED)

## Files Created/Modified

### Backend
- ✅ **NEW**: `src/services/programApplication.service.ts` - Core business logic
- ✅ **MODIFIED**: `src/controllers/program.controller.ts` - API endpoints
- ✅ **MODIFIED**: `src/routes/program.routes.ts` - Route definitions
- ✅ **MODIFIED**: `prisma/schema.prisma` - Database schema
- ✅ **NEW**: Tests folder with organized test files
- ✅ **NEW**: Docs folder with organized documentation

### Frontend
- ✅ **NEW**: `src/services/programApplicationService.ts` - API client service

## Database Schema Changes

### New Enum
```prisma
enum ApplicationStatus {
  PENDING     // Awaiting delivery
  COMPLETED   // QR scanned by admin
  CANCELLED   // Expired without scan
}
```

### New Models
- `ProgramApplication` - Stores QR code and delivery tracking
- `ProgramApplicationScan` - Audit log of all scans

### Updated Model
- `ProgramRegistration` - Now links to `ProgramApplication`

## API Endpoints

### Beneficiary Endpoints
```
POST   /programs/register
       Register for a program (creates QR code)
       
GET    /programs/application/:applicationId
       Get application details including QR code

GET    /programs/beneficiary/:beneficiaryId/applications
       Get all applications for a beneficiary
```

### Admin Endpoints
```
POST   /programs/scan-qr
       Scan QR code during distribution
       
GET    /programs/:programId/applications
       Get all applications for a program
       
GET    /programs/:programId/applications/stats
       Get statistics (completion rate, etc.)
       
POST   /programs/admin/update-expired
       Mark expired applications as CANCELLED
```

## Testing

### Automated Tests
Located in: `tests/program-applications/`

Run all tests:
```bash
cd backend
npm test -- tests/program-applications/
```

Or run specific test suites:
```bash
node tests/program-applications/service.test.mjs
node tests/program-applications/endpoints.test.mjs
```

### Manual API Testing
Use the HTTP file: `tests/program-applications/api.http`

Set variables and send requests to test endpoints.

## Frontend Integration

### Import Service
```typescript
import { programApplicationService } from '@/services/programApplicationService';
```

### Register for Program
```typescript
const response = await programApplicationService.registerForProgram({
  programId: 'program-id',
  beneficiaryId: 'beneficiary-id'
});

// Show QR code modal
const qrCodeImage = response.data.application.qrCodeImageUrl;
```

### Get Beneficiary Applications
```typescript
const apps = await programApplicationService.getBeneficiaryApplications(
  beneficiaryId
);

// Display list of programs and statuses
```

### Admin: Scan QR Code
```typescript
const result = await programApplicationService.scanQRCode({
  qrCodeValue: scannedQRValue,
  adminId: currentAdminId,
  notes: 'Delivered on time'
});

// Application status is now COMPLETED
```

## Email Notifications

### 1. Application Approved Email
Sent immediately after registration:
- ✅ QR code image (in email)
- ✅ Program details
- ✅ Scheduled delivery date
- ✅ Distribution checklist

### 2. Scan Confirmation Email
Sent when admin scans QR code:
- ✅ Confirmation of distribution
- ✅ Status update notification

## Status Flow

```
Beneficiary Registers
        ↓
Application Created (PENDING)
    QR Code Generated
    Email Sent
        ↓
Distribution Day:
    ├─ Admin Scans QR → COMPLETED ✓
    ├─ No Scan Yet → PENDING
        ↓ (scheduled date passes)
        └─ Auto Marked → CANCELLED ✗
```

## Key Features

### QR Code Management
- Unique UUID per application
- Data URL format for email
- Regeneratable (no file storage needed)
- Scannable by standard QR scanners

### Audit Trail
- Every scan recorded with timestamp
- Admin ID tracked
- Optional notes field
- Full scan history preserved

### Email Integration
- Uses existing EmailService
- HTML formatted emails
- QR code embedded in email
- Beneficiary and admin notifications

### Automatic Status Updates
- COMPLETED: Immediately on admin scan
- CANCELLED: Daily batch job past delivery date
- PENDING: Initial and intermediate state

## Configuration

### Environment Variables
Ensure these are set in `.env`:
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
DATABASE_URL=postgresql://...
```

### Scheduled Jobs
Set up cron to run daily (e.g., midnight):
```bash
POST /programs/admin/update-expired
```

## Performance Tips

1. **QR Code Caching**
   - Store `qrCodeImageUrl` once generated
   - Don't regenerate on each request

2. **Batch Scanning**
   - Process multiple scans in transaction
   - Use scan endpoint in rapid succession

3. **Statistics**
   - Cache stats response for 1 hour
   - Recalculate on demand for real-time

4. **Email Queue**
   - Consider async email jobs for scale
   - Current implementation: synchronous

## Troubleshooting

### QR Code not displaying in email?
- Check `qrCodeImageUrl` is data URL (starts with `data:image`)
- Verify email client supports inline images

### Application not marked as COMPLETED?
- Check `qrCodeValue` is exact match
- Verify admin ID is correct format
- Check admin exists in database

### Status not updating automatically?
- Manually run: `POST /programs/admin/update-expired`
- Set up cron job (if not already)
- Check database timezone settings

### Email not received?
- Check Gmail settings allow less secure apps
- Verify `EMAIL_USER` and `EMAIL_PASS` in `.env`
- Review email service logs

## Next Steps

1. **Frontend UI**
   - Create registration modal with QR display
   - Build application status dashboard
   - Add QR scanner component for admins

2. **Admin Dashboard**
   - Show all applications
   - Display statistics
   - List pending/completed/cancelled

3. **Notifications**
   - SMS backup for QR code
   - Push notifications for admins
   - Status change notifications

4. **Mobile App**
   - Admin scanning app
   - Beneficiary app with QR display
   - Offline capability

5. **Analytics**
   - Distribution rate tracking
   - No-show analysis
   - Program effectiveness metrics

## Support Resources

- Documentation: `docs/program-applications/`
- API Reference: `docs/program-applications/API_REFERENCE.md`
- Test Suite: `tests/program-applications/`
- Service TypeScript: `src/services/programApplication.service.ts`
- Frontend Service: `frontend/src/services/programApplicationService.ts`

## Key Service Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `createProgramApplicationService()` | Create app with QR | Application object |
| `getProgramApplicationService()` | Fetch app details | Full application data |
| `scanApplicationQRCodeService()` | Admin scan | Updated application + scan record |
| `getBeneficiaryApplicationsService()` | Get beneficiary apps | Array of applications |
| `getProgramApplicationsService()` | Get program apps | Array of applications |
| `getProgramApplicationStatsService()` | Get statistics | Stats object |
| `updateExpiredApplicationStatusesService()` | Batch update | Count of updated |

---

**Ready to use!** Start by running tests and reviewing the documentation.
