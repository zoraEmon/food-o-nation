# Quick Testing Guide

## Backend API Endpoints

### Test with curl or Postman

**Note:** You need a valid JWT token from an admin user. Get it by logging in as admin first.

### 1. Dashboard Stats
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/dashboard-stats
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "totalUsers": 10,
    "pendingUsers": 2,
    "allPrograms": 5,
    "totalMonetaryDonations": 50000
  }
}
```

### 2. Recent Activity
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/recent-activity?limit=10
```

### 3. All Beneficiaries
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:5000/api/admin/beneficiaries?page=1&limit=10"
```

### 4. Beneficiary Details
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/admin/beneficiaries/BENEFICIARY_ID
```

## Frontend Testing

### 1. Login as Admin
1. Go to: http://localhost:3000/login
2. Login with admin credentials
3. Navigate to: http://localhost:3000/admin/dashboard

### 2. View Dashboard Stats
- You should see 4 cards at the top:
  - Total Users
  - Pending Approvals
  - All Programs
  - Monetary Donations

### 3. View Beneficiaries
1. Ensure you're on the "Beneficiary Management" tab (default)
2. Click "Official Beneficiaries" button
3. You should see a table with real beneficiary data
4. Click the "View" button with eye icon on any beneficiary

### 4. View Beneficiary Details Modal
The modal should display:
- Beneficiary name and status badge
- Personal Information section
- Household Information section
- Address section
- Program Applications section
- Registration date

### 5. View Recent Activity
- Scroll down to the bottom of the page
- You should see "Recent Activity" section
- Activities are listed from most recent to oldest
- Each activity shows:
  - User name (in gold/yellow color)
  - Action description
  - Optional details
  - Timestamp

## Expected Behavior

### Dashboard Stats
- Numbers should update based on real database data
- If you register new users, the counts should increase
- Monetary donations should show sum of verified donations only

### Beneficiary Management
- Table should show real beneficiaries from database
- Status badges should be color-coded:
  - Green: APPROVED
  - Yellow: PENDING
  - Gray: Other statuses
- Clicking "View" opens a modal with full details

### Recent Activity
- Should auto-load on page load
- Shows up to 10 most recent activities by default
- Includes activities from:
  - Program applications
  - Donations
  - Newsletter operations
  - Stall reservations

## Common Issues & Solutions

### Issue: "401 Unauthorized"
**Solution:** 
- Ensure you're logged in as an admin user
- Check that your JWT token is valid
- Token is stored in localStorage as 'token'

### Issue: "No beneficiaries found"
**Solution:**
- Check that you have beneficiaries in your database
- Verify the database connection
- Run: `npm run dev` in backend folder

### Issue: "Failed to fetch dashboard stats"
**Solution:**
- Ensure backend is running on port 5000
- Check console for CORS errors
- Verify database is connected

### Issue: Activity log is empty
**Solution:**
- Activity logs are created when actions occur
- Try:
  - Applying to a program
  - Making a donation
  - Creating a newsletter
- These will create activity log entries

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Logged in as admin user
- [ ] Dashboard stats loading correctly
- [ ] Total users showing correct count
- [ ] Pending users showing correct count
- [ ] All programs showing correct count
- [ ] Monetary donations showing correct amount
- [ ] Beneficiaries table loading
- [ ] Status badges displaying correctly
- [ ] "View" button working
- [ ] Detail modal opening
- [ ] All sections in modal displaying data
- [ ] Recent activity section showing
- [ ] Activities sorted by most recent first
- [ ] Timestamps displaying correctly

## Sample Data Check

### Verify Database Content

Run these queries to check your data:

```sql
-- Check total users
SELECT COUNT(*) FROM "User";

-- Check pending users
SELECT COUNT(*) FROM "User" WHERE status = 'PENDING';

-- Check all programs
SELECT COUNT(*) FROM "Program";

-- Check total monetary donations
SELECT SUM("monetaryAmount") FROM "Donation" 
WHERE type = 'MONETARY' AND status = 'VERIFIED';

-- Check beneficiaries
SELECT COUNT(*) FROM "Beneficiary";

-- Check recent activities
SELECT * FROM "ActivityLog" 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

## Browser Console Testing

Open browser console (F12) and run:

```javascript
// Check if token exists
localStorage.getItem('token')

// Test API call
fetch('http://localhost:5000/api/admin/dashboard-stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log)
```

## Success Indicators

✅ All dashboard cards show numbers (not loading/error)
✅ Beneficiary table populated with data
✅ Modal opens when clicking "View"
✅ Recent activity section shows log entries
✅ No console errors in browser
✅ No errors in backend terminal
✅ All API calls return 200 status

## Next Steps After Testing

1. Test with different user roles (ensure only admins can access)
2. Test pagination for beneficiaries
3. Test filtering by status
4. Test with large datasets (100+ beneficiaries)
5. Test mobile responsiveness
6. Test with different browsers

## Support

If you encounter issues:
1. Check backend terminal for errors
2. Check browser console for errors
3. Verify database connection
4. Check that all files were created/modified correctly
5. Restart both backend and frontend servers
