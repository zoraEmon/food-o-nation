# Donor Dashboard Updates

## Files to Update:

### 1. Login Redirects - Change to `/dashboard`
- `frontend/src/app/login/page.tsx` (line 47, 81)
- `frontend/src/components/features/auth/LoginForm.tsx` (line 59, 92)
- `frontend/src/app/register/donor/page.tsx` (line 77)

### 2. Navbar Dashboard Link
- `frontend/src/components/layout/Navbar.tsx` (line ~160)
  - Change from `/donor/dashboard` to `/dashboard`

### 3. Remove Old Donor Dashboard
- Delete folder: `frontend/src/app/donor/beneficiarydashboard/donordashboard/`

### 4. Update Main Dashboard
- `frontend/src/app/dashboard/page.tsx`
  - Add tabs for Overview / Programs (Stalls)
  - Show stall programs similar to beneficiary food programs
  - Include: Available programs, Current registrations, Past registrations

## Implementation Plan:

1. Fix all login redirects to `/dashboard`
2. Update navbar dropdown link
3. Add Programs tab to dashboard
4. Create stall program listing with registration status
5. Integrate with existing stall reservation API
