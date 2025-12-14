# Program Applications - API Reference

Complete reference for all program application endpoints with request/response formats, examples, and error codes.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Currently no authentication enforced. In production, add:
- JWT token in `Authorization: Bearer <token>` header
- Role-based access control (admin vs regular user)

## Endpoints

---

## 1. Register for Program

**Register a beneficiary for a program and create a QR code application.**

```
POST /programs/register
```

### Request

```json
{
  "programId": "string (UUID)",
  "beneficiaryId": "string (UUID)"
}
```

### Response (201 Created)

```json
{
  "success": true,
  "message": "Successfully registered for program",
  "data": {
    "registration": {
      "id": "uuid-1234",
      "programId": "uuid-5678",
      "beneficiaryId": "uuid-9012",
      "status": "PENDING",
      "registeredAt": "2025-12-14T10:30:00Z"
    },
    "application": {
      "id": "uuid-app-001",
      "applicationStatus": "PENDING",
      "qrCodeValue": "uuid-qr-12345",
      "qrCodeImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQ...",
      "scheduledDeliveryDate": "2025-12-24T10:00:00Z",
      "actualDeliveryDate": null,
      "qrCodeScannedAt": null,
      "qrCodeScannedByAdminId": null,
      "createdAt": "2025-12-14T10:30:00Z",
      "updatedAt": "2025-12-14T10:30:00Z"
    }
  }
}
```

### Error Responses

**400 - Invalid Input**
```json
{
  "success": false,
  "error": "Missing required fields: programId, beneficiaryId"
}
```

**404 - Program Not Found**
```json
{
  "success": false,
  "error": "Program not found"
}
```

**404 - Beneficiary Not Found**
```json
{
  "success": false,
  "error": "Beneficiary not found"
}
```

**409 - Duplicate Registration**
```json
{
  "success": false,
  "error": "Beneficiary is already registered for this program"
}
```

### cURL Example

```bash
curl -X POST http://localhost:5000/api/programs/register \
  -H "Content-Type: application/json" \
  -d '{
    "programId": "550e8400-e29b-41d4-a716-446655440000",
    "beneficiaryId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

---

## 2. Get Application by ID

**Retrieve a specific application with all details including QR code.**

```
GET /programs/application/:applicationId
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| applicationId | UUID | Yes | ID of the application |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "uuid-app-001",
    "applicationStatus": "PENDING",
    "qrCodeValue": "uuid-qr-12345",
    "qrCodeImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQ...",
    "scheduledDeliveryDate": "2025-12-24T10:00:00Z",
    "actualDeliveryDate": null,
    "qrCodeScannedAt": null,
    "qrCodeScannedByAdminId": null,
    "createdAt": "2025-12-14T10:30:00Z",
    "updatedAt": "2025-12-14T10:30:00Z",
    "programRegistration": {
      "id": "uuid-reg-001",
      "status": "PENDING",
      "registeredAt": "2025-12-14T10:30:00Z",
      "program": {
        "id": "uuid-prog-001",
        "title": "Emergency Food Relief",
        "description": "Distribution of food items to affected families",
        "date": "2025-12-24T10:00:00Z",
        "place": {
          "id": "uuid-place-001",
          "name": "Community Center",
          "address": "123 Main St, City"
        }
      },
      "beneficiary": {
        "id": "uuid-ben-001",
        "firstName": "John",
        "lastName": "Doe",
        "activeEmail": "john@example.com"
      }
    },
    "scans": [
      {
        "id": "uuid-scan-001",
        "scannedAt": "2025-12-24T14:30:00Z",
        "scannedByAdminId": "admin-uuid-001",
        "notes": "Distribution completed at community center",
        "scannedByAdmin": {
          "id": "admin-uuid-001",
          "firstName": "Jane",
          "lastName": "Smith"
        }
      }
    ]
  }
}
```

### Error Responses

**404 - Not Found**
```json
{
  "success": false,
  "error": "Application not found"
}
```

### cURL Example

```bash
curl -X GET http://localhost:5000/api/programs/application/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json"
```

---

## 3. Get Beneficiary Applications

**Get all applications for a specific beneficiary.**

```
GET /programs/beneficiary/:beneficiaryId/applications
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| beneficiaryId | UUID | Yes | ID of the beneficiary |

### Query Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| skip | number | 0 | Pagination skip |
| take | number | 10 | Pagination limit |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-app-001",
      "applicationStatus": "COMPLETED",
      "qrCodeValue": "uuid-qr-12345",
      "qrCodeImageUrl": "data:image/png;base64,...",
      "scheduledDeliveryDate": "2025-12-24T10:00:00Z",
      "actualDeliveryDate": "2025-12-24T14:30:00Z",
      "qrCodeScannedAt": "2025-12-24T14:30:00Z",
      "createdAt": "2025-12-14T10:30:00Z",
      "programRegistration": {
        "program": {
          "id": "uuid-prog-001",
          "title": "Emergency Food Relief"
        }
      }
    },
    {
      "id": "uuid-app-002",
      "applicationStatus": "PENDING",
      "qrCodeValue": "uuid-qr-12346",
      "scheduledDeliveryDate": "2026-01-15T10:00:00Z",
      "createdAt": "2025-12-10T08:00:00Z",
      "programRegistration": {
        "program": {
          "id": "uuid-prog-002",
          "title": "Winter Relief Program"
        }
      }
    }
  ]
}
```

### cURL Example

```bash
curl -X GET "http://localhost:5000/api/programs/beneficiary/550e8400-e29b-41d4-a716-446655440001/applications?skip=0&take=10" \
  -H "Content-Type: application/json"
```

---

## 4. Scan QR Code

**Admin scans QR code during distribution. Updates application status to COMPLETED and records scan.**

```
POST /programs/scan-qr
```

### Request

```json
{
  "qrCodeValue": "string (UUID from QR code)",
  "adminId": "string (UUID of admin performing scan)",
  "notes": "string (optional notes about the scan)"
}
```

### Response (200 OK)

```json
{
  "success": true,
  "message": "QR code scanned and application marked as COMPLETED",
  "data": {
    "application": {
      "id": "uuid-app-001",
      "applicationStatus": "COMPLETED",
      "qrCodeValue": "uuid-qr-12345",
      "qrCodeImageUrl": "data:image/png;base64,...",
      "scheduledDeliveryDate": "2025-12-24T10:00:00Z",
      "actualDeliveryDate": "2025-12-24T14:30:00Z",
      "qrCodeScannedAt": "2025-12-24T14:30:00Z",
      "qrCodeScannedByAdminId": "admin-uuid-001",
      "updatedAt": "2025-12-24T14:30:00Z"
    },
    "scan": {
      "id": "uuid-scan-001",
      "applicationId": "uuid-app-001",
      "scannedByAdminId": "admin-uuid-001",
      "scannedAt": "2025-12-24T14:30:00Z",
      "notes": "Distribution completed, item received",
      "scannedByAdmin": {
        "id": "admin-uuid-001",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  }
}
```

### Error Responses

**400 - Invalid QR Code**
```json
{
  "success": false,
  "error": "Invalid QR code - Application not found"
}
```

**409 - Already Completed**
```json
{
  "success": false,
  "error": "Application has already been scanned"
}
```

**409 - Invalid Status**
```json
{
  "success": false,
  "error": "Cannot scan application with status: CANCELLED"
}
```

### cURL Example

```bash
curl -X POST http://localhost:5000/api/programs/scan-qr \
  -H "Content-Type: application/json" \
  -d '{
    "qrCodeValue": "uuid-qr-12345",
    "adminId": "admin-uuid-001",
    "notes": "Distribution completed at 2:30 PM"
  }'
```

---

## 5. Get Program Applications

**Get all applications for a program (admin view).**

```
GET /programs/:programId/applications
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| programId | UUID | Yes | ID of the program |

### Query Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| status | string | all | Filter by status: PENDING, COMPLETED, CANCELLED |
| skip | number | 0 | Pagination skip |
| take | number | 20 | Pagination limit |

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-app-001",
      "applicationStatus": "COMPLETED",
      "qrCodeValue": "uuid-qr-12345",
      "scheduledDeliveryDate": "2025-12-24T10:00:00Z",
      "actualDeliveryDate": "2025-12-24T14:30:00Z",
      "qrCodeScannedAt": "2025-12-24T14:30:00Z",
      "createdAt": "2025-12-14T10:30:00Z",
      "programRegistration": {
        "beneficiary": {
          "id": "uuid-ben-001",
          "firstName": "John",
          "lastName": "Doe",
          "activeEmail": "john@example.com"
        }
      },
      "scans": [
        {
          "id": "uuid-scan-001",
          "scannedAt": "2025-12-24T14:30:00Z",
          "scannedByAdmin": {
            "firstName": "Jane",
            "lastName": "Smith"
          }
        }
      ]
    }
  ]
}
```

### cURL Example

```bash
curl -X GET "http://localhost:5000/api/programs/550e8400-e29b-41d4-a716-446655440000/applications?status=COMPLETED" \
  -H "Content-Type: application/json"
```

---

## 6. Get Application Statistics

**Get statistics for all applications in a program.**

```
GET /programs/:programId/applications/stats
```

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| programId | UUID | Yes | ID of the program |

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 100,
    "completed": 85,
    "pending": 10,
    "cancelled": 5,
    "scanRate": "85.00%"
  }
}
```

### Calculation Formula

```
scanRate = (completed / total) * 100
```

### cURL Example

```bash
curl -X GET http://localhost:5000/api/programs/550e8400-e29b-41d4-a716-446655440000/applications/stats \
  -H "Content-Type: application/json"
```

---

## 7. Update Expired Applications

**Batch job to mark expired applications as cancelled.**

**Note:** Run this as a scheduled job daily after distribution date.

```
POST /programs/admin/update-expired
```

### Request

No request body required.

### Response (200 OK)

```json
{
  "success": true,
  "message": "Expired applications updated successfully",
  "data": {
    "updatedCount": 15,
    "expiredApplications": [
      {
        "id": "uuid-app-010",
        "applicationStatus": "CANCELLED",
        "scheduledDeliveryDate": "2025-12-20T10:00:00Z",
        "updatedAt": "2025-12-14T15:00:00Z"
      }
    ]
  }
}
```

### Error Response

**500 - Server Error**
```json
{
  "success": false,
  "error": "Failed to update expired applications"
}
```

### cURL Example

```bash
curl -X POST http://localhost:5000/api/programs/admin/update-expired \
  -H "Content-Type: application/json"
```

---

## Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | Success | Successful GET/POST operations |
| 201 | Created | Successful resource creation |
| 400 | Bad Request | Invalid input, missing fields |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate registration, invalid state |
| 500 | Server Error | Unexpected server error |

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Descriptive error message"
}
```

---

## Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Missing required fields" | Request missing programId or beneficiaryId | Include all required fields |
| "Program not found" | Program ID doesn't exist | Verify program ID is correct |
| "Beneficiary not found" | Beneficiary ID doesn't exist | Verify beneficiary exists |
| "Invalid QR code" | QR code doesn't exist or is invalid | Ensure correct QR value |
| "Already registered" | Beneficiary already has application for program | Check existing registrations |
| "Already scanned" | Application already marked as completed | Cannot rescan completed app |

---

## Response Format Guidelines

### Successful Response

```json
{
  "success": true,
  "message": "Optional message",
  "data": { }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error description"
}
```

---

## Data Types

### UUID

Universal unique identifier used for all IDs:
```
Format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Example: 550e8400-e29b-41d4-a716-446655440000
```

### ISO 8601 DateTime

All timestamps in ISO 8601 format:
```
Format: YYYY-MM-DDTHH:mm:ssZ
Example: 2025-12-24T14:30:00Z
```

### Enum: ApplicationStatus

```
PENDING   - Application created, awaiting scan
COMPLETED - QR scanned, distribution confirmed
CANCELLED - Expired or manually cancelled
```

---

## Rate Limiting

Currently no rate limiting. Recommended for production:
- 100 requests per minute per IP
- 10 registration requests per beneficiary per program

---

## Pagination

Endpoints supporting pagination:
- `GET /programs/beneficiary/:id/applications` 
- `GET /programs/:programId/applications`

```
skip: number (default 0) - Records to skip
take: number (default 10/20) - Records to return

Example: ?skip=20&take=10
```

---

## Testing Endpoints

Use the provided HTTP file for manual testing:
```
backend/tests/program-applications/api.http
```

Or use cURL examples provided for each endpoint above.

---

## Migration Notes

Application of migration adds:
- `ApplicationStatus` enum
- `ProgramApplication` table
- `ProgramApplicationScan` table
- Updates to `ProgramRegistration` table

See `DATABASE.md` for schema details.

---

## Related Documentation

- [Implementation Guide](IMPLEMENTATION.md) - Code details
- [Quick Start](QUICK_START.md) - Getting started
- [Database Schema](DATABASE.md) - Schema reference
- [Test Suite](../../tests/program-applications/README.md) - Test documentation

