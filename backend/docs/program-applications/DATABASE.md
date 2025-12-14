# Program Applications - Database Schema

Complete database schema documentation for the program application feature, including entity relationships, field descriptions, and constraints.

## Schema Overview

Three main tables manage the program application feature:

```
┌──────────────────────────┐
│  ProgramRegistration     │
│  (beneficiary → program) │
└────────────┬─────────────┘
             │
             │ 1:1
             │
┌────────────▼──────────────────┐
│  ProgramApplication            │
│  (QR code tracking)            │
└────────────┬───────────────────┘
             │
             │ 1:N
             │
┌────────────▼──────────────────┐
│  ProgramApplicationScan        │
│  (audit log of scans)          │
└────────────────────────────────┘
```

---

## 1. ApplicationStatus Enum

Status of program applications throughout their lifecycle.

```prisma
enum ApplicationStatus {
  PENDING    // Initial state after registration
  COMPLETED  // QR scanned, successfully distributed
  CANCELLED  // Expired or manually cancelled
}
```

### Status Transitions

```
PENDING ──[Admin Scans QR]──> COMPLETED
   │
   └─[Scheduled Date Passes]──> CANCELLED
```

---

## 2. ProgramApplication Model

Stores QR code and application tracking information.

### Definition

```prisma
model ProgramApplication {
  id                         String   @id @default(cuid())
  
  // Foreign Keys
  registrationId             String   @unique
  programRegistration        ProgramRegistration @relation(fields: [registrationId], references: [id])
  
  qrCodeScannedByAdminId     String?  // FK to Admin/User
  
  // Core Fields
  applicationStatus          ApplicationStatus @default(PENDING)
  
  // QR Code Information
  qrCodeValue                String   @unique
  qrCodeImageUrl             String   // Base64 encoded PNG
  
  // Delivery Dates
  scheduledDeliveryDate      DateTime // When should be distributed
  actualDeliveryDate         DateTime? // When actually distributed
  qrCodeScannedAt            DateTime? // When QR was scanned
  
  // Relationships
  scans                      ProgramApplicationScan[]
  
  // Timestamps
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
  
  @@index([registrationId])
  @@index([applicationStatus])
  @@index([qrCodeValue])
  @@index([scheduledDeliveryDate])
}
```

### Field Descriptions

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | String | Yes | Yes | Unique identifier (CUID) |
| registrationId | String | Yes | Yes | Links to ProgramRegistration (1:1) |
| applicationStatus | ApplicationStatus | Yes | No | Current status: PENDING/COMPLETED/CANCELLED |
| qrCodeValue | String | Yes | Yes | Unique QR code value (used for scanning) |
| qrCodeImageUrl | String | Yes | No | PNG image in base64 format |
| scheduledDeliveryDate | DateTime | Yes | No | When program distribution occurs |
| actualDeliveryDate | DateTime | No | No | When beneficiary received item (set on scan) |
| qrCodeScannedAt | DateTime | No | No | Timestamp of first scan |
| qrCodeScannedByAdminId | String | No | No | User ID who scanned (if scanned) |
| createdAt | DateTime | Yes | No | Record creation timestamp |
| updatedAt | DateTime | Yes | No | Last update timestamp |

### Indexes

```
- registrationId (unique)        // Fast lookups, 1:1 relationship
- applicationStatus              // Filter by status
- qrCodeValue (unique)           // Fast scan lookups
- scheduledDeliveryDate          // Range queries for expiration
```

### Relationships

- **ProgramRegistration** (1:1) - Parent registration
- **ProgramApplicationScan** (1:N) - Multiple scans per application
- **User/Admin** (0:1) - Admin who scanned (optional)

### Example Data

```json
{
  "id": "app_abc123xyz",
  "registrationId": "reg_123",
  "applicationStatus": "COMPLETED",
  "qrCodeValue": "550e8400-e29b-41d4-a716-446655440000",
  "qrCodeImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANQ...",
  "scheduledDeliveryDate": "2025-12-24T10:00:00Z",
  "actualDeliveryDate": "2025-12-24T14:30:00Z",
  "qrCodeScannedAt": "2025-12-24T14:30:00Z",
  "qrCodeScannedByAdminId": "admin_user_123",
  "createdAt": "2025-12-14T10:30:00Z",
  "updatedAt": "2025-12-24T14:30:00Z"
}
```

---

## 3. ProgramApplicationScan Model

Audit log recording every scan of a QR code.

### Definition

```prisma
model ProgramApplicationScan {
  id                    String    @id @default(cuid())
  
  // Foreign Keys
  applicationId         String
  programApplication    ProgramApplication @relation(fields: [applicationId], references: [id])
  
  scannedByAdminId      String  // FK to User/Admin
  
  // Scan Information
  scannedAt            DateTime  @default(now())
  notes                String?   // Optional notes from admin
  
  // Timestamps
  createdAt            DateTime  @default(now())
  
  @@index([applicationId])
  @@index([scannedByAdminId])
  @@index([scannedAt])
}
```

### Field Descriptions

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| id | String | Yes | Yes | Unique identifier (CUID) |
| applicationId | String | Yes | No | Links to ProgramApplication (N:1) |
| scannedByAdminId | String | Yes | No | User ID who performed scan |
| scannedAt | DateTime | Yes | No | Timestamp of scan |
| notes | String | No | No | Optional notes (e.g., "verified identity", "item received") |
| createdAt | DateTime | Yes | No | Record creation timestamp |

### Indexes

```
- applicationId           // Get scans for application
- scannedByAdminId       // Track admin activity
- scannedAt              // Time-based queries
```

### Relationships

- **ProgramApplication** (N:1) - Parent application
- **User/Admin** (N:1) - Admin who performed scan

### Example Data

```json
{
  "id": "scan_xyz789",
  "applicationId": "app_abc123xyz",
  "scannedByAdminId": "admin_user_123",
  "scannedAt": "2025-12-24T14:30:00Z",
  "notes": "Verified identity, item received in good condition",
  "createdAt": "2025-12-24T14:30:00Z"
}
```

### Multiple Scans

An application can be scanned multiple times:
- **First scan** → Status changed to COMPLETED, dates set
- **Subsequent scans** → Additional audit records, status unchanged

---

## 4. ProgramRegistration Updates

Existing model updated to link to ProgramApplication.

### Updated Definition

```prisma
model ProgramRegistration {
  id                    String    @id @default(cuid())
  
  // ... existing fields ...
  
  // New relationship
  programApplication    ProgramApplication?
  
  // ... rest of model ...
}
```

### Change Details

**Added field:**
- `programApplication` - Optional 1:1 relationship to ProgramApplication

**Why optional?**
- Existing registrations may not have applications
- Maintains backward compatibility
- Allows gradual migration of data

---

## Data Flow

### 1. Registration Flow

```
User registers
    ↓
ProgramRegistration created (status: PENDING)
    ↓
ProgramApplication created
    ├─ Generate QR code
    ├─ Create qrCodeImageUrl
    ├─ Generate unique qrCodeValue
    └─ Send email with QR
```

### 2. Scan Flow

```
Admin scans QR code
    ↓
ProgramApplication found by qrCodeValue
    ↓
Validate status is PENDING
    ↓
Create ProgramApplicationScan record
    ├─ Set scannedAt timestamp
    ├─ Record scannedByAdminId
    └─ Store optional notes
    ↓
Update ProgramApplication
    ├─ Set applicationStatus → COMPLETED
    ├─ Set actualDeliveryDate
    ├─ Set qrCodeScannedAt
    └─ Set qrCodeScannedByAdminId
    ↓
Send scan confirmation email
```

### 3. Expiration Flow

```
Batch job runs (daily)
    ↓
Find all PENDING applications where scheduledDeliveryDate < now()
    ↓
For each expired application:
    ├─ Update applicationStatus → CANCELLED
    └─ Update updatedAt timestamp
```

---

## Queries

### Common Database Queries

**Get application by QR code:**
```sql
SELECT * FROM "ProgramApplication" 
WHERE "qrCodeValue" = 'uuid-value';
```

**Get all pending applications:**
```sql
SELECT * FROM "ProgramApplication" 
WHERE "applicationStatus" = 'PENDING';
```

**Get applications expiring soon:**
```sql
SELECT * FROM "ProgramApplication" 
WHERE "applicationStatus" = 'PENDING' 
AND "scheduledDeliveryDate" < CURRENT_TIMESTAMP;
```

**Get scan history for application:**
```sql
SELECT * FROM "ProgramApplicationScan" 
WHERE "applicationId" = 'app-id' 
ORDER BY "scannedAt" DESC;
```

**Get admin activity:**
```sql
SELECT a."scannedAt", pa."qrCodeValue", u."firstName", u."lastName"
FROM "ProgramApplicationScan" a
JOIN "ProgramApplication" pa ON a."applicationId" = pa."id"
JOIN "User" u ON a."scannedByAdminId" = u."id"
WHERE a."scannedByAdminId" = 'admin-id'
ORDER BY a."scannedAt" DESC;
```

**Get statistics:**
```sql
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN "applicationStatus" = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
  SUM(CASE WHEN "applicationStatus" = 'PENDING' THEN 1 ELSE 0 END) as pending,
  SUM(CASE WHEN "applicationStatus" = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled
FROM "ProgramApplication" 
WHERE "registrationId" IN (
  SELECT id FROM "ProgramRegistration" WHERE "programId" = 'prog-id'
);
```

---

## Constraints and Validations

### Unique Constraints

| Table | Field | Reason |
|-------|-------|--------|
| ProgramApplication | qrCodeValue | Enable fast scanning lookup |
| ProgramApplication | registrationId | 1:1 relationship with registration |

### Foreign Key Constraints

| Field | References | On Delete | On Update |
|-------|-----------|-----------|-----------|
| ProgramApplication.registrationId | ProgramRegistration.id | CASCADE | CASCADE |
| ProgramApplicationScan.applicationId | ProgramApplication.id | CASCADE | CASCADE |

### Data Validations

**ApplicationStatus:**
- Must be one of: PENDING, COMPLETED, CANCELLED
- Cannot transition directly (only PENDING → COMPLETED via scan)

**QR Code Value:**
- Must be unique across all applications
- Format: UUID string
- Cannot be null

**Dates:**
- `scheduledDeliveryDate` - Must be set at creation
- `actualDeliveryDate` - Only set when scanned
- `qrCodeScannedAt` - Only set when first scanned
- Must follow ISO 8601 format

---

## Indexes and Performance

### Index Strategy

```
ProgramApplication:
├─ registrationId (PRIMARY)  → O(1) lookups from registration
├─ qrCodeValue               → O(1) scans
├─ applicationStatus         → O(log n) filtering/statistics
└─ scheduledDeliveryDate     → O(log n) expiration checks

ProgramApplicationScan:
├─ applicationId             → O(log n) audit trail
├─ scannedByAdminId         → O(log n) admin activity
└─ scannedAt                → O(log n) time-based queries
```

### Query Performance

- **Scan QR code:** < 10ms (index on qrCodeValue)
- **Get statistics:** ~100ms (full table scan with aggregation)
- **Find expired:** ~500ms (index scan on scheduledDeliveryDate)
- **Get audit log:** < 50ms (index on applicationId)

---

## Migration Details

### Migration File

```
migrations/[timestamp]_add_program_applications_qr/
├── migration.sql
└── migration_lock.toml
```

### Changes Made

1. **Created ApplicationStatus enum**
   ```sql
   CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
   ```

2. **Created ProgramApplication table**
   ```sql
   CREATE TABLE "ProgramApplication" (
     "id" TEXT NOT NULL PRIMARY KEY,
     "registrationId" TEXT NOT NULL UNIQUE,
     "applicationStatus" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
     "qrCodeValue" TEXT NOT NULL UNIQUE,
     "qrCodeImageUrl" TEXT NOT NULL,
     "scheduledDeliveryDate" TIMESTAMP(3) NOT NULL,
     "actualDeliveryDate" TIMESTAMP(3),
     "qrCodeScannedAt" TIMESTAMP(3),
     "qrCodeScannedByAdminId" TEXT,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "updatedAt" TIMESTAMP(3) NOT NULL,
     ...
   );
   ```

3. **Created ProgramApplicationScan table**
   ```sql
   CREATE TABLE "ProgramApplicationScan" (
     "id" TEXT NOT NULL PRIMARY KEY,
     "applicationId" TEXT NOT NULL,
     "scannedByAdminId" TEXT NOT NULL,
     "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     "notes" TEXT,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "ProgramApplicationScan_applicationId_fkey" 
       FOREIGN KEY ("applicationId") 
       REFERENCES "ProgramApplication" ("id") ON DELETE CASCADE ON UPDATE CASCADE
   );
   ```

4. **Added foreign key to ProgramRegistration**
   ```sql
   ALTER TABLE "ProgramRegistration" 
   ADD COLUMN "programApplicationId" TEXT UNIQUE;
   ```

### Rollback

To rollback migration:
```bash
npx prisma migrate resolve --rolled-back add_program_applications_qr
```

---

## Data Types

### CUID (Composite Unique ID)

Used for all primary keys:
- **Format:** c[25-character alphanumeric]
- **Example:** clq8n2c4f0000q5d4q5d4q5d4
- **Generation:** Cryptographically secure
- **Sortable:** By creation time

### DateTime

All timestamps in UTC:
- **Format:** ISO 8601 (YYYY-MM-DDTHH:mm:ssZ)
- **Storage:** TIMESTAMP(3) with millisecond precision
- **Example:** 2025-12-24T14:30:00.123Z

---

## Backup and Recovery

### Backup Strategy

```bash
# Backup entire database
pg_dump -U postgres food_o_nation > backup.sql

# Backup specific table
pg_dump -U postgres food_o_nation -t "ProgramApplication" > app_backup.sql
```

### Recovery

```bash
# Restore full database
psql -U postgres food_o_nation < backup.sql

# Restore specific table
psql -U postgres food_o_nation < app_backup.sql
```

---

## Monitoring and Maintenance

### Health Checks

Monitor these queries for data integrity:

```sql
-- Check for orphaned applications
SELECT pa.* FROM "ProgramApplication" pa
WHERE NOT EXISTS (
  SELECT 1 FROM "ProgramRegistration" pr WHERE pr.id = pa."registrationId"
);

-- Check for missing QR codes
SELECT * FROM "ProgramApplication" WHERE "qrCodeImageUrl" IS NULL;

-- Check for scans of non-existent applications
SELECT pas.* FROM "ProgramApplicationScan" pas
WHERE NOT EXISTS (
  SELECT 1 FROM "ProgramApplication" pa WHERE pa.id = pas."applicationId"
);
```

### Maintenance Tasks

**Weekly:**
- Monitor table sizes
- Check index fragmentation
- Verify foreign key constraints

**Monthly:**
- Vacuum and analyze tables
- Archive old scan records
- Update statistics

**Quarterly:**
- Review query performance
- Optimize slow queries
- Plan capacity upgrades

---

## Related Documentation

- [Implementation Guide](IMPLEMENTATION.md) - Code implementation
- [Quick Start](QUICK_START.md) - Getting started
- [API Reference](API_REFERENCE.md) - Endpoint documentation

---

**Last Updated:** 2025-12-14  
**Schema Version:** 1.0  
**Database:** PostgreSQL 13+  
**ORM:** Prisma 5.x
