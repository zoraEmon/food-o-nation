# Program Management v2 - Quick Integration Guide

## ⚡ 5-Minute Integration

### Step 1: Update Routes Index (1 minute)

**File:** `backend/src/routes/index.ts`

Find this line:
```typescript
import programRoutes from './program.routes.js';
```

Replace with:
```typescript
import programRoutes from './program.routes.v2.js';
```

**That's it!** The rest of your index.ts remains unchanged.

---

### Step 2: Run Database Migration (2 minutes)

```bash
cd backend
npx prisma migrate dev --name add_program_status
```

**What this does:**
- Adds `status` field (default: PENDING) to programs table
- Adds `updatedAt` field with auto-update trigger
- Generates new Prisma Client types
- Creates migration file for tracking

**Expected output:**
```
✓ Prisma schema validated
✓ Migration generated (20251215XXXXXX_add_program_status)
✓ Database migrated
✓ Prisma Client generated
```

---

### Step 3: Restart Backend (2 minutes)

```bash
npm run dev
```

Or if running with:
```bash
node dist/server.js
```

---

## ✅ Verification Checklist

After integration, verify everything works:

### Using curl (Windows PowerShell):

**1. Create a program:**
```powershell
$headers = @{
    "Authorization" = "Bearer your-admin-token"
    "Content-Type" = "application/json"
}

$body = @{
    title = "Test Program"
    description = "A test program with a proper description"
    date = "2025-12-20T10:00:00Z"
    maxParticipants = 100
    placeId = "your-place-id"
} | ConvertTo-Json

curl -Uri "http://localhost:5000/api/programs" `
  -Headers $headers `
  -Method Post `
  -Body $body
```

Expected: `201 Created` with program data including `status: "PENDING"`

**2. List programs:**
```powershell
curl -Uri "http://localhost:5000/api/programs" -Method Get
```

Expected: `200 OK` with array of programs

**3. Publish a program:**
```powershell
curl -Uri "http://localhost:5000/api/programs/{programId}/publish" `
  -Headers $headers `
  -Method Post `
  -Body "{}"
```

Expected: `200 OK` with `status: "APPROVED"`

---

## 📋 What Changed

| Component | Old | New | Impact |
|-----------|-----|-----|--------|
| Routes | program.routes.js | program.routes.v2.js | New endpoints: /publish, /cancel |
| Service | program.service.js | program.service.v2.js | Business rule enforcement |
| Controller | program.controller.js | program.controller.v2.js | Better error handling |
| Middleware | program.middleware.js | program.middleware.v2.js | Comprehensive validation |
| Database | No status field | status + updatedAt | Track program state |

---

## 🔍 Files You'll Be Using

### For Testing:
- **Postman:** Import `backend/postman-programs-collection.json`
- **VS Code REST Client:** Use `backend/test-programs.http`
- **PowerShell:** Run examples in `backend/docs/programs/PROGRAM_TESTING.md`

### For Reference:
- **API Guide:** `backend/docs/programs/PROGRAM_API.md`
- **Testing Guide:** `backend/docs/programs/PROGRAM_TESTING.md`
- **Implementation Details:** `backend/docs/programs/IMPLEMENTATION_SUMMARY.md`

### New Code Files:
- `backend/src/services/program.service.v2.ts` - Business logic
- `backend/src/controllers/program.controller.v2.ts` - Request handling
- `backend/src/routes/program.routes.v2.ts` - Endpoint definitions
- `backend/src/middleware/program.middleware.v2.ts` - Input validation
- `backend/src/interfaces/program.interface.ts` - DTO objects

---

## 🚨 Troubleshooting

**Problem:** Still seeing old program endpoints after restart
```
Solution: Verify step 1 - check that routes/index.ts imports program.routes.v2.js
```

**Problem:** Database migration fails
```
Solution: Ensure PostgreSQL is running and migrations are up to date
Run: npx prisma migrate reset --force (for development only!)
```

**Problem:** 404 errors on /publish or /cancel endpoints
```
Solution: Routes not updated yet - go back to step 1
```

**Problem:** Status field missing from database
```
Solution: Migration not applied yet - go back to step 2
Run: npx prisma migrate deploy
```

---

## 📊 New Program Endpoints (After Integration)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | /programs | Public | List all programs |
| GET | /programs/:id | Public | Get program details |
| POST | /programs | Admin | Create new program |
| PATCH | /programs/:id | Admin | Update program info |
| POST | /programs/:id/publish | Admin | Publish program (PENDING→APPROVED) |
| POST | /programs/:id/cancel | Admin | Cancel program |

---

## 💾 Database Changes

**Program Model - New Fields:**

```prisma
model Program {
  // ... existing fields ...
  
  status      ProgramStatus @default(PENDING)    // NEW: tracks program state
  updatedAt   DateTime      @updatedAt            // NEW: auto-updated timestamp
}

enum ProgramStatus {
  PENDING
  APPROVED
  CLAIMED
  CANCELED
  REJECTED
}
```

---

## 🎯 Post-Integration Testing

Run these commands in order to verify full functionality:

### 1. List Programs
```bash
curl http://localhost:5000/api/programs
```

### 2. Create Program
```bash
# Copy the returned ID for next steps
curl -X POST http://localhost:5000/api/programs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Test description here","date":"2025-12-20T10:00:00Z","maxParticipants":100,"placeId":"PLACE_ID"}'
```

### 3. Publish Program
```bash
curl -X POST http://localhost:5000/api/programs/PROGRAM_ID/publish \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Verify Status Changed
```bash
curl http://localhost:5000/api/programs/PROGRAM_ID
```
Check that status is now "APPROVED"

---

## 🎓 Learning Resources

### Understanding the System
1. Read `PROGRAM_API.md` - Learn what each endpoint does
2. Review `IMPLEMENTATION_SUMMARY.md` - Understand architecture
3. Check `PROGRAM_TESTING.md` - See how to test

### Testing Hands-On
1. Import Postman collection - 22 pre-built tests
2. Open test-programs.http in VS Code - 21 REST Client requests
3. Run PowerShell script - Full automated testing

### Code Review
1. `program.service.v2.ts` - Business logic (450+ lines, well-commented)
2. `program.controller.v2.ts` - Request handling (110 lines)
3. `program.routes.v2.ts` - Route definitions (24 lines)
4. `program.middleware.v2.ts` - Input validation (180+ lines)

---

## 📞 Quick Help

**Q: How do I test the API?**
A: Use Postman (import postman-programs-collection.json) or VS Code REST Client (open test-programs.http)

**Q: Can I still use the old routes?**
A: After step 1, old routes are replaced. Keep backup if needed.

**Q: What if I need to rollback?**
A: Revert the import in routes/index.ts to program.routes.js and restart

**Q: How do I check the program status?**
A: Run `curl http://localhost:5000/api/programs/:id` and check the `status` field

**Q: Can I update maxParticipants after publishing?**
A: No - business rule prevents it. See PROGRAM_API.md for details.

---

## 📈 Next Features (Future)

Potential enhancements not in current scope:
- Batch program operations
- Program templates
- Automated status transitions based on date
- Email notifications on program changes
- Program capacity alerts

---

## ✨ You're Ready!

The Program Management v2 system is now ready to integrate. Just follow the 3 steps above and you'll have:
- ✅ Full program management with status tracking
- ✅ Business rule enforcement
- ✅ Comprehensive validation
- ✅ Professional error handling
- ✅ Complete documentation
- ✅ Ready-to-use test files

**Estimated integration time: 5 minutes** ⏱️

Need help? Check `PROGRAM_TESTING.md` or `PROGRAM_API.md`
