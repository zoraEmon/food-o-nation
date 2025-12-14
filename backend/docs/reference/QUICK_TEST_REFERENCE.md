# ⚡ Quick Testing Cheat Sheet

## 🚀 One-Liner Tests

### Create Monetary Donation
```bash
curl -X POST http://localhost:5000/api/donations/monetary -H "Content-Type: application/json" -d '{"donorId":"a20940e2-5f3e-4466-ad96-3ce06dbf068f","amount":1000,"paymentMethod":"GCash","paymentReference":"TEST-'$(date +%s)'"}'
```

### Create Produce Donation
```bash
curl -X POST http://localhost:5000/api/donations/produce -H "Content-Type: application/json" -d '{"donorId":"a20940e2-5f3e-4466-ad96-3ce06dbf068f","donationCenterId":"250c4cb6-55f9-43c0-a15c-1efb65b93add","scheduledDate":"2025-12-15T10:00:00Z","items":[{"name":"Rice","category":"Grains","quantity":50,"unit":"kg"}]}'
```

### Get Donations
```bash
curl -s http://localhost:5000/api/donations?limit=10 | jq .
```

### Update Status
```bash
curl -X PATCH http://localhost:5000/api/donations/DONATION_ID_HERE/status -H "Content-Type: application/json" -d '{"status":"COMPLETED","notes":"Done"}'
```

---

## 📱 Test Data IDs

```
Donor ID:      a20940e2-5f3e-4466-ad96-3ce06dbf068f
Center ID:     250c4cb6-55f9-43c0-a15c-1efb65b93add
```

---

## ✅ What's Fixed

| Issue | Cause | Fix |
|-------|-------|-----|
| `Cannot read properties of undefined (reading 'map')` | Missing error.errors check | Added `(error.errors \|\| [])` |
| `Cannot destructure property 'status' of 'req.body' as it is undefined` | Missing req.body check | Added `req.body \|\| {}` |

---

## 🎯 Status Codes

- **201** = Created (success)
- **200** = OK (success)
- **400** = Validation error
- **404** = Not found
- **500** = Server error

---

## 💡 Pro Tips

1. **Save donation ID:** `jq -r '.data.donation.id'`
2. **Use Postman** for easier testing with UI
3. **Check logs:** Watch `npm run dev` terminal
4. **Verify DB:** `npx prisma studio`
5. **Always use:** `-H "Content-Type: application/json"`

---

## 📝 File Locations

- Fixed file: `backend/src/controllers/donation.controller.ts`
- Tests: `backend/test-donations.http`
- Script: `backend/test-donations.mjs`
- Docs: `backend/TESTING_GUIDE.md`
