# Program Application Tests

Complete test suite for the program application feature including service layer tests, endpoint tests, and manual HTTP testing.

## Test Structure

```
tests/program-applications/
├── README.md                    # This file
├── service.test.mjs             # Service layer unit tests
├── endpoints.test.mjs           # Controller/endpoint integration tests
└── api.http                     # Manual REST client testing
```

## Test Files

### 1. Service Layer Tests (`service.test.mjs`)

**Purpose:** Unit tests for `programApplication.service.ts` functions

**Test Coverage:**
- `createProgramApplicationService()` - Creates application with QR code
- `getProgramApplicationService()` - Retrieves application by ID
- `getBeneficiaryApplicationsService()` - Gets all apps for beneficiary
- `getProgramApplicationsService()` - Gets all apps for program (admin)
- `scanApplicationQRCodeService()` - Scans QR code and updates status
- `getProgramApplicationStatsService()` - Calculates statistics
- `updateExpiredApplicationStatusesService()` - Marks expired as cancelled

**Test Cases:** 23 tests covering:
- ✅ Successful operations
- ✅ Error scenarios (not found, invalid input)
- ✅ Data validation
- ✅ Status transitions
- ✅ Relationship integrity

**Run Tests:**
```bash
# From backend directory
node tests/program-applications/service.test.mjs

# Or with npm script (if configured)
npm test -- program-applications
```

### 2. Endpoint Tests (`endpoints.test.mjs`)

**Purpose:** Integration tests for all HTTP endpoints

**Test Coverage:**
- `POST /programs/register` - Registration endpoint
- `GET /programs/application/:id` - Get application by ID
- `GET /programs/beneficiary/:beneficiaryId/applications` - Get beneficiary apps
- `POST /programs/scan-qr` - QR scanning endpoint
- `GET /programs/:programId/applications` - Get program applications
- `GET /programs/:programId/applications/stats` - Get statistics
- `POST /programs/admin/update-expired` - Update expired applications

**Test Cases:** 45+ tests covering:
- ✅ Successful requests
- ✅ Invalid parameters
- ✅ Missing required fields
- ✅ Not found scenarios
- ✅ Unauthorized access
- ✅ Request validation
- ✅ Response format verification
- ✅ Status code validation

**Run Tests:**
```bash
# From backend directory
node tests/program-applications/endpoints.test.mjs

# Or with npm script (if configured)
npm test -- program-applications
```

### 3. Manual HTTP Testing (`api.http`)

**Purpose:** Manual REST client testing using VS Code REST Client extension

**Setup:**
1. Install VS Code extension: [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
2. Open `api.http` file
3. Replace variables at top with actual IDs:
   - `@programId` - Get from `/programs` endpoint
   - `@beneficiaryId` - Get from database
   - `@adminId` - Get from database
   - `@applicationId` - Get from response after registration
   - `@qrCodeValue` - Get from response after registration

**Available Endpoints:**
1. **GET /programs** - Get all programs
2. **GET /programs/:id** - Get program details
3. **POST /programs/register** - Register for program
4. **GET /programs/application/:id** - Get application details
5. **GET /programs/beneficiary/:beneficiaryId/applications** - Get user's applications
6. **POST /programs/scan-qr** - Scan QR code (admin)
7. **GET /programs/:programId/applications** - Get program applications (admin)
8. **GET /programs/:programId/applications/stats** - Get statistics (admin)
9. **POST /programs/admin/update-expired** - Update expired applications (admin)

**Usage:**
- Click "Send Request" link above each endpoint
- Responses appear in right panel
- Modify request bodies as needed for testing

## Running All Tests

### Prerequisites
```bash
cd backend

# Ensure dependencies installed
npm install

# Start API server (if not already running)
npm run dev
```

### Run Test Suite
```bash
# Run all program application tests
npm test

# Or run specific test file
node tests/program-applications/service.test.mjs
node tests/program-applications/endpoints.test.mjs
```

### Test Output
```
✓ Service Layer Tests
  ✓ createProgramApplicationService
    ✓ should create application with QR code
    ✓ should generate valid QR code
    ✓ should send email notification
    ✓ should handle missing application
    ✓ should validate input data
  ...

✓ Endpoint Tests
  ✓ POST /programs/register
    ✓ should register beneficiary for program
    ✓ should return QR code image
    ✓ should reject invalid program ID
    ✓ should reject invalid beneficiary ID
  ...

Tests: 68 passed in 2.3s
```

## Debugging Tips

### Enable Verbose Logging
```bash
# Set debug environment variable
DEBUG=* node tests/program-applications/service.test.mjs
```

### Test Specific Function
```bash
# Modify test file to use `.only` on specific test
describe.only('createProgramApplicationService', () => {
  // Only this test runs
  it('should create application', async () => { ... })
})
```

### Database State
- Tests use existing database
- Verify test data exists before running
- Check database state after test failures:
  ```bash
  npx prisma studio
  ```

## Common Issues

### Port Already in Use
```
Error: EADDRINUSE: address already in use :::5000

Solution: Kill process or use different port
```

### QR Code Generation Fails
```
Error: Cannot generate QR code

Causes:
- QRCodeService not available
- Invalid QR value format
- File system permissions
```

### Email Service Not Available
```
Error: Email service initialization failed

Solution:
- Check EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD env vars
- Verify SMTP credentials are correct
- Use test email provider (e.g., Ethereal Email)
```

### Database Connection Failed
```
Error: PrismaClientInitializationError

Solution:
- Verify DATABASE_URL environment variable
- Check database is running
- Run: npx prisma db push
```

## Test Data Reference

### Typical Test Objects

**Program Registration Response:**
```json
{
  "id": "uuid-1234",
  "programId": "uuid-5678",
  "beneficiaryId": "uuid-9012",
  "status": "PENDING",
  "registeredAt": "2025-12-14T10:00:00Z"
}
```

**Application Response:**
```json
{
  "id": "uuid-1234",
  "applicationStatus": "PENDING",
  "qrCodeValue": "uuid-qr-code",
  "qrCodeImageUrl": "data:image/png;base64,...",
  "scheduledDeliveryDate": "2025-12-24T10:00:00Z",
  "actualDeliveryDate": null,
  "qrCodeScannedAt": null,
  "createdAt": "2025-12-14T10:00:00Z"
}
```

**Scan Response:**
```json
{
  "id": "uuid-scan",
  "applicationId": "uuid-1234",
  "scannedAt": "2025-12-24T14:30:00Z",
  "scannedByAdminId": "admin-uuid",
  "notes": "Distribution center delivery"
}
```

## Integration with CI/CD

### GitHub Actions Example
```yaml
name: Program Application Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - run: cd backend && npm install
      - run: npm test -- program-applications
```

## Performance Benchmarks

**Expected Test Execution Times:**
- Service tests: ~500ms
- Endpoint tests: ~1.2s
- Total suite: ~2s

If tests run slower:
1. Check database performance
2. Reduce test data size
3. Verify network latency
4. Check system resources

## Related Documentation

- [Implementation Guide](../docs/program-applications/IMPLEMENTATION.md) - Technical details
- [Quick Start](../docs/program-applications/QUICK_START.md) - Getting started
- [API Reference](../docs/program-applications/API_REFERENCE.md) - Endpoint documentation
- [Database Schema](../docs/program-applications/DATABASE.md) - Schema details

## Contributing Tests

When adding new tests:

1. **Place in correct file:**
   - Service logic → `service.test.mjs`
   - API endpoints → `endpoints.test.mjs`
   - Manual testing → `api.http`

2. **Follow naming conventions:**
   ```javascript
   describe('functionName', () => {
     it('should [expected behavior]', async () => {
       // test code
     })
   })
   ```

3. **Include error cases:**
   ```javascript
   it('should handle [error scenario]', async () => {
     // test error handling
   })
   ```

4. **Update this README:**
   - Add test case description
   - Update coverage section
   - Note any new dependencies

## Questions?

Refer to:
- [Backend README](../../README.md) - Project setup
- [Implementation Guide](../docs/program-applications/IMPLEMENTATION.md) - Code details
- Test file comments - Inline documentation
