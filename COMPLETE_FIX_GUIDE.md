# Complete Donor Dashboard Fix Guide

## Summary
- Remove old donor dashboard folder
- Fix all login redirects to `/dashboard`
- Update navbar dropdown link
- Enhance `/dashboard` page with Programs tab for stall registrations

## Files to Update

### 1. frontend/src/app/login/page.tsx
**Lines to change:**
- Line 47: Change `router.push("/donor/beneficiarydashboard/donordashboard");` to `router.push("/dashboard");`
- Line 81: Change `router.push("/donor/beneficiarydashboard/donordashboard");` to `router.push("/dashboard");`

### 2. frontend/src/components/features/auth/LoginForm.tsx
**Lines to change:**
- Line 59: Change `router.push("/donor/beneficiarydashboard/donordashboard");` to `router.push("/dashboard");`
- Line 92: Change `router.push("/donor/beneficiarydashboard/donordashboard");` to `router.push("/dashboard");`

### 3. frontend/src/app/register/donor/page.tsx
**Line to change:**
- Line 77: Change `router.push("/donor/beneficiarydashboard/donordashboard");` to `router.push("/dashboard");`

### 4. frontend/src/components/layout/Navbar.tsx
**Line to change:**
- Find the line with `href="/donor/dashboard"` (around line 160)
- Change it to `href="/dashboard"`

### 5. Delete Old Dashboard
**Action:**
- Delete the entire folder: `frontend/src/app/donor/beneficiarydashboard/`

### 6. frontend/src/app/dashboard/page.tsx
**Major Update:**
This file needs significant enhancement to add:
- Tab system (Overview / Programs)
- Programs tab showing stall registration programs
- Display of available programs, current registrations, past registrations
- Similar structure to beneficiary programs page but for stall reservations

The new dashboard should:
1. Keep existing Overview tab with profile info
2. Add Programs tab that:
   - Fetches programs with stalls (`/api/programs?hasStalls=true`)
   - Shows stall reservation status
   - Allows donors to register for stalls
   - Shows current and past stall reservations

## Next Steps
Please confirm you'd like me to proceed with implementing these changes.
