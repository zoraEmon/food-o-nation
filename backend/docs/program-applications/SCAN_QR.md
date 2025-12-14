# Program Application Scan

- Purpose: Admin scans beneficiary QR to mark delivery complete.
- Updates: `qrCodeScannedAt`, `qrCodeScannedByAdminId`, sets `applicationStatus=COMPLETED`, fills `actualDeliveryDate`.
- Audit: Creates `ProgramApplicationScan` with optional `notes` and relation to `Admin`.

## Endpoint
- POST `/api/programs/scan-qr`
- Body:
```
{
  "qrCodeValue": "...",
  "adminId": "...",
  "notes": "optional"
}
```
- Success 200: returns updated `application` and created `scan`.

## Nightly Expiry
- Service `updateExpiredApplicationStatusesService()` marks PENDING applications as CANCELLED when `scheduledDeliveryDate < now`.
- Route: POST `/api/programs/admin/update-expired`.

## Testing
1. Create or fetch `programId` and `beneficiaryId`.
2. Register via POST `/api/programs/register`.
3. Scan via POST `/api/programs/scan-qr`.
4. Verify application status and scan audit.

### CLI Test
```
set PROGRAM_ID=...
set BENEFICIARY_ID=...
set ADMIN_ID=...
node tests/program-applications/scan-endpoint.test.mjs
```

### Postman
- Import `backend/postman-program-applications.json`.
- Run: Get Beneficiaries → Get Programs → Register → Scan QR.
