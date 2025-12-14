# 📋 Program Management System Documentation

Welcome to the Program Management System v2! This folder contains complete documentation, test files, and implementation guides.

## 🎯 Start Here

### For Different Roles:

**👨‍💻 For Developers:**
1. Start with [QUICK_START.md](QUICK_START.md) - 5-minute integration guide
2. Review [PROGRAM_API.md](PROGRAM_API.md) - Understand the endpoints
3. Check [PROGRAM_TESTING.md](PROGRAM_TESTING.md) - Learn testing methods
4. Read code in `src/services/program.service.v2.ts` - Study the implementation

**🧪 For QA/Testers:**
1. Import Postman collection: `../postman-programs-collection.json`
2. Read [PROGRAM_TESTING.md](PROGRAM_TESTING.md) - Testing scenarios
3. Use REST Client file: `../test-programs.http` (VS Code)
4. Run tests against local backend

**📊 For Product/Business:**
1. Read [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Feature overview
2. Check [PROGRAM_API.md](PROGRAM_API.md) - API reference
3. Review status workflow and business rules sections

**🚀 For DevOps/Deployment:**
1. [QUICK_START.md](QUICK_START.md) - Integration steps
2. Database migration command
3. Rollback instructions if needed

---

## 📂 Files in This Folder

### Documentation Files

| File | Size | Purpose | Read Time |
|------|------|---------|-----------|
| [QUICK_START.md](QUICK_START.md) | 3 KB | **⭐ START HERE** - 5-minute integration guide | 5 min |
| [PROGRAM_API.md](PROGRAM_API.md) | 15 KB | Complete API reference with examples | 10 min |
| [PROGRAM_TESTING.md](PROGRAM_TESTING.md) | 20 KB | Comprehensive testing guide | 15 min |
| [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) | 12 KB | Technical architecture & features | 15 min |
| [FILES_CREATED.md](FILES_CREATED.md) | 8 KB | Complete delivery checklist | 5 min |

### Test Files (in parent directory)

| File | Format | Tests | Location |
|------|--------|-------|----------|
| postman-programs-collection.json | Postman | 22 tests | `../postman-programs-collection.json` |
| test-programs.http | REST Client | 21 tests | `../test-programs.http` |

### Source Code Files (in src/ directory)

| File | Lines | Purpose |
|------|-------|---------|
| services/program.service.v2.ts | 450+ | Business logic & validation |
| controllers/program.controller.v2.ts | 110 | HTTP request handling |
| routes/program.routes.v2.ts | 24 | Endpoint definitions |
| middleware/program.middleware.v2.ts | 180+ | Input validation |
| interfaces/program.interface.ts | 30 | DTO objects |

---

## 🚀 Integration in 3 Steps

### Step 1: Update Routes
**File:** `src/routes/index.ts`

Change:
```typescript
import programRoutes from './program.routes.js';
```

To:
```typescript
import programRoutes from './program.routes.v2.js';
```

### Step 2: Migrate Database
```bash
cd backend
npx prisma migrate dev --name add_program_status
```

### Step 3: Restart Server
```bash
npm run dev
```

✅ **Done!** All 6 endpoints ready to use.

---

## 📋 What's New

### 6 API Endpoints
- `GET /programs` - List all programs (public)
- `GET /programs/:id` - Get program details (public)
- `POST /programs` - Create program (admin)
- `PATCH /programs/:id` - Update program (admin)
- `POST /programs/:id/publish` - Publish program (admin)
- `POST /programs/:id/cancel` - Cancel program (admin)

### Status Workflow
```
PENDING (created)
   ↓ publish
APPROVED (public)
   ↓ automatic
CLAIMED (completed)
```

Alternative paths: CANCELED, REJECTED (at any time except CLAIMED)

### Business Rules
- ✅ Cannot update maxParticipants if scheduled
- ✅ Cannot update date if scheduled
- ✅ Cannot cancel completed programs
- ✅ Cannot publish already published programs
- ✅ Automatic status tracking with timestamps

### Validation
- Title: 3-100 characters
- Description: 10-1000 characters
- Date: Must be future date (ISO 8601)
- MaxParticipants: 1-10000
- PlaceId: Must exist in database

---

## 🧪 Testing

### Option 1: Postman (Recommended)
```
1. Import: ../postman-programs-collection.json
2. Configure: baseUrl, adminToken, placeId
3. Run: 22 pre-built test cases
```

### Option 2: VS Code REST Client
```
1. Install: REST Client extension
2. Open: ../test-programs.http
3. Edit: Variables at top
4. Run: Click "Send Request" on any request
```

### Option 3: PowerShell/cURL
```
1. Edit: Variables in script
2. Run: curl commands or PowerShell scripts
3. Check: Response codes and data
```

See [PROGRAM_TESTING.md](PROGRAM_TESTING.md) for detailed instructions.

---

## 🔍 API Quick Reference

### Create Program
```http
POST /programs
{
  "title": "Program Name",
  "description": "Detailed description (10+ chars)",
  "date": "2025-12-20T10:00:00Z",
  "maxParticipants": 100,
  "placeId": "uuid-here"
}
→ 201 Created (status: PENDING)
```

### List Programs
```http
GET /programs
GET /programs?status=APPROVED
→ 200 OK (array of programs)
```

### Publish Program
```http
POST /programs/:id/publish
→ 200 OK (status changed to APPROVED)
```

### Cancel Program
```http
POST /programs/:id/cancel
{ "reason": "Optional reason" }
→ 200 OK (status changed to CANCELED)
```

See [PROGRAM_API.md](PROGRAM_API.md) for complete reference.

---

## 💾 Database Changes

Added to `Program` model:
- `status: ProgramStatus @default(PENDING)` - Tracks program state
- `updatedAt: DateTime @updatedAt` - Auto-updated timestamp

Migration creates `ProgramStatus` enum:
```
PENDING, APPROVED, CLAIMED, CANCELED, REJECTED
```

---

## ✅ Quality Metrics

| Metric | Value |
|--------|-------|
| API Endpoints | 6 |
| Test Cases | 43 (22 Postman + 21 REST) |
| Lines of Code | 794 |
| Documentation | 50+ KB |
| Validation Rules | 15+ |
| Business Rules | 4 enforced |
| Error Handling | Complete |
| Database Migrations | 1 required |

---

## 🎓 Understanding the Code

### Architecture

```
┌─────────────────────────────┐
│   HTTP Request (Express)    │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   Middleware Validation     │  ← Validates input
│  (program.middleware.v2.ts) │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   Controller               │  ← Handles HTTP
│  (program.controller.v2.ts) │
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   Service Layer             │  ← Business logic
│  (program.service.v2.ts)    │  ← Enforces rules
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│   Database (Prisma/PostgreSQL)
│  (schema.prisma)            │
└─────────────────────────────┘
```

### Data Flow Example: Create Program

1. **Client** sends POST with program data
2. **Middleware** validates all fields
3. **Controller** receives validated data
4. **Service** checks business rules:
   - Date must be future
   - Place must exist
   - Title/description valid
5. **Database** stores new program with `status: PENDING`
6. **Response** returns 201 with program data

---

## 🐛 Troubleshooting

### Common Issues

**Q: Endpoints returning 404**
A: Routes not updated. Check src/routes/index.ts imports v2

**Q: Status field missing from database**
A: Migration not applied. Run: `npx prisma migrate dev --name add_program_status`

**Q: 400 validation errors**
A: Check PROGRAM_API.md for field requirements

**Q: 401 Unauthorized on create/update**
A: Admin token required. Check Authorization header

**Q: Cannot update date/maxParticipants**
A: Intentional! Programs cannot be modified once scheduled

See [PROGRAM_TESTING.md](PROGRAM_TESTING.md) "Troubleshooting" section for more.

---

## 📚 Documentation Structure

### For Understanding **What** (Overview)
→ Read: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

### For Understanding **How** (API Details)
→ Read: [PROGRAM_API.md](PROGRAM_API.md)

### For Understanding **Testing**
→ Read: [PROGRAM_TESTING.md](PROGRAM_TESTING.md)

### For Understanding **Code**
→ Review: Source files in `src/`

### For Understanding **Integration**
→ Read: [QUICK_START.md](QUICK_START.md)

---

## 🔄 Workflow Example

**Complete admin workflow:**

1. **Create program**
   ```
   POST /programs
   Status: PENDING (draft)
   ```

2. **Update details** (optional)
   ```
   PATCH /programs/:id
   Update title, description, place
   ```

3. **Publish to public**
   ```
   POST /programs/:id/publish
   Status: CLAIMED (visible)
   ```

4. **On event date, system auto-completes**
   ```
   Status: CLAIMED (completed)
   ```

5. **If needed, cancel program**
   ```
   POST /programs/:id/cancel
   Status: CANCELED (with reason)
   ```

---

## 📞 Support & Help

### Quick Questions
- **How do I test?** → See [PROGRAM_TESTING.md](PROGRAM_TESTING.md)
- **What are the API endpoints?** → See [PROGRAM_API.md](PROGRAM_API.md)
- **How do I integrate?** → See [QUICK_START.md](QUICK_START.md)
- **What was built?** → See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

### Detailed Issues
- Check [PROGRAM_TESTING.md](PROGRAM_TESTING.md) troubleshooting section
- Review [FILES_CREATED.md](FILES_CREATED.md) for file locations
- Check inline comments in source code

### For Developers
- Service logic: `src/services/program.service.v2.ts`
- Controller: `src/controllers/program.controller.v2.ts`
- Routes: `src/routes/program.routes.v2.ts`
- Validation: `src/middleware/program.middleware.v2.ts`

---

## 🎯 Next Steps

1. ✅ **Read** [QUICK_START.md](QUICK_START.md) (5 min)
2. ✅ **Integrate** v2 routes (1 min)
3. ✅ **Migrate** database (2 min)
4. ✅ **Test** with Postman (10+ min)
5. ✅ **Deploy** when ready

---

## 📊 Summary

| Item | Status |
|------|--------|
| Code Implementation | ✅ Complete |
| Documentation | ✅ Complete |
| Test Files | ✅ Complete |
| Database Schema | ✅ Ready |
| Error Handling | ✅ Comprehensive |
| Business Rules | ✅ Enforced |
| Validation | ✅ Comprehensive |
| Ready for Integration | ✅ Yes |

---

## 📝 Version Information

- **Version:** 1.0.0
- **Created:** December 2024
- **Status:** ✅ Production Ready
- **Package:** Complete (11 files, 794 lines, 50+ KB docs)

---

**Welcome to the Program Management System v2! 🎉**

Start with [QUICK_START.md](QUICK_START.md) →
