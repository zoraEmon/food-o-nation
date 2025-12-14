# Program Management API Documentation

## Overview
The Program Management system allows admins to create, manage, and publish food distribution programs. Programs can be scheduled in advance, updated, and their status can be managed (PENDING → APPROVED → CLAIMED, or CANCELED/REJECTED).

## Key Features
- ✅ Create programs with validation
- ✅ Publish programs to make them public (PENDING → APPROVED)
- ✅ Update program information
- ✅ Restrictions on updating maxParticipants and date once scheduled
- ✅ Cancel programs with optional reasons
- ✅ Comprehensive error handling
- ✅ Full tracking of donations and beneficiary registrations

## Program Status Flow

```
PENDING (Initial State)
    ↓
  APPROVED (Published - visible to public)
    ↓
  CLAIMED (Completed - program finished)

Alternative paths:
    ↓
  CANCELED (Admin cancelled)
    ↓
  REJECTED (Admin rejected)
```

## Data Model

### Program Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Auto-generated unique identifier |
| title | String | Yes | Program name (3-100 characters) |
| description | String | Yes | Program details (10-1000 characters) |
| date | DateTime | Yes | Program date (must be future) |
| maxParticipants | Integer | Yes | Maximum beneficiaries (1-10000) |
| currentParticipants | Integer | No | Count of registered beneficiaries (auto) |
| status | Enum | No | PENDING, APPROVED, CLAIMED, CANCELED, REJECTED |
| placeId | UUID | Yes | Reference to location/venue |
| createdAt | DateTime | No | Auto-generated creation timestamp |
| updatedAt | DateTime | No | Auto-updated modification timestamp |

### Related Data
- `place`: Location/venue information
- `donations`: Associated donations
- `registrations`: Beneficiary registrations (ProgramRegistration)

## API Endpoints

### 1. Create Program (Admin)
```http
POST /api/programs
Content-Type: application/json

{
  "title": "Christmas Food Distribution 2025",
  "description": "Community-wide food distribution program for December holidays. We will distribute rice, canned goods, and hygiene kits to 500 families.",
  "date": "2025-12-20T10:00:00Z",
  "maxParticipants": 500,
  "placeId": "uuid-of-place"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Program created successfully",
  "data": {
    "id": "prog-uuid",
    "title": "Christmas Food Distribution 2025",
    "description": "...",
    "date": "2025-12-20T10:00:00Z",
    "maxParticipants": 500,
    "currentParticipants": 0,
    "status": "PENDING",
    "placeId": "uuid-of-place",
    "createdAt": "2025-12-10T14:30:00Z",
    "updatedAt": "2025-12-10T14:30:00Z"
  }
}
```

**Validation Errors (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title must be at least 3 characters"
    },
    {
      "field": "date",
      "message": "Program date must be in the future"
    }
  ]
}
```

### 2. Get All Programs (Public)
```http
GET /api/programs
GET /api/programs?status=APPROVED
```

**Response (200 OK):**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "prog-uuid-1",
      "title": "Christmas Food Distribution 2025",
      "status": "APPROVED",
      "date": "2025-12-20T10:00:00Z",
      "maxParticipants": 500,
      "currentParticipants": 120,
      "place": {
        "id": "place-uuid",
        "name": "Luneta Park",
        "address": "Rizal Park, Manila"
      }
    }
  ]
}
```

### 3. Get Program by ID
```http
GET /api/programs/:id
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "prog-uuid",
    "title": "Christmas Food Distribution 2025",
    "description": "...",
    "date": "2025-12-20T10:00:00Z",
    "maxParticipants": 500,
    "currentParticipants": 120,
    "status": "APPROVED",
    "place": { ... },
    "donations": [ ... ],
    "registrations": [ ... ],
    "createdAt": "2025-12-10T14:30:00Z",
    "updatedAt": "2025-12-10T14:30:00Z"
  }
}
```

**Not Found (404):**
```json
{
  "success": false,
  "error": "Program with ID xyz not found"
}
```

### 4. Update Program (Admin)
```http
PATCH /api/programs/:id
Content-Type: application/json

{
  "title": "New Title",
  "description": "Updated description",
  "placeId": "new-place-uuid",
  "status": "APPROVED"
}
```

**Restrictions:**
- ❌ Cannot update `maxParticipants` if status is APPROVED or CLAIMED or date has passed
- ❌ Cannot update `date` if status is APPROVED or CLAIMED

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Program updated successfully",
  "data": { ... }
}
```

**Conflict Error (400):**
```json
{
  "success": false,
  "error": "Cannot update maximum participants for scheduled or ongoing programs",
  "field": "maxParticipants"
}
```

### 5. Publish Program (Admin)
Convert PENDING status to APPROVED (make visible to public)

```http
POST /api/programs/:id/publish
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Program published successfully",
  "data": {
    "id": "prog-uuid",
    "status": "APPROVED",
    ...
  }
}
```

**Error (400):**
```json
{
  "success": false,
  "error": "Cannot publish program with status 'APPROVED'. Only PENDING programs can be published."
}
```

### 6. Cancel Program (Admin)
```http
POST /api/programs/:id/cancel
Content-Type: application/json

{
  "reason": "Unexpected weather conditions"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Program canceled successfully: Unexpected weather conditions",
  "data": {
    "id": "prog-uuid",
    "status": "CANCELED",
    ...
  }
}
```

**Error - Already Completed (400):**
```json
{
  "success": false,
  "error": "Cannot cancel a program that has already been completed"
}
```

## Error Handling

### Error Status Codes
| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Invalid input, validation failed |
| 404 | Not Found | Program doesn't exist |
| 500 | Server Error | Database error, unexpected exception |

### Common Validation Errors

**Title Validation:**
- Required
- Must be 3-100 characters
- Cannot be empty or whitespace only

**Description Validation:**
- Required
- Must be 10-1000 characters
- Cannot be empty or whitespace only

**Date Validation:**
- Required
- Must be ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- Must be in the future
- Example valid date: `2025-12-20T10:00:00Z`

**MaxParticipants Validation:**
- Required
- Must be positive number (1-10000)
- Cannot update if program is APPROVED or date has passed

**PlaceId Validation:**
- Required
- Must reference an existing place
- Cannot update to non-existent place

**Status Validation:**
- Must be one of: PENDING, APPROVED, CLAIMED, CANCELED, REJECTED
- Cannot go backwards in workflow
- Cannot cancel already completed programs

## Business Rules

1. **Status Workflow**
   - Programs start as PENDING
   - Admin publishes to APPROVED
   - System marks as CLAIMED when date passes
   - Can be CANCELED or REJECTED at any point (except CLAIMED)

2. **Update Restrictions**
   - Cannot update `maxParticipants` if status is APPROVED/CLAIMED or date has passed
   - Cannot update `date` if status is APPROVED/CLAIMED

3. **Capacity Tracking**
   - `currentParticipants` is auto-incremented when beneficiaries register
   - Cannot exceed `maxParticipants`

4. **Scheduling**
   - All program dates must be in the future at time of creation/update
   - Admin can schedule programs well in advance

## Testing Guide

See `PROGRAM_TESTING.md` for:
- cURL test examples
- Postman collection
- PowerShell test scripts
- Error scenario testing
