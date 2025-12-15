# Newsletter Tests (Real DB)

This folder contains a smoke test for the Newsletter API against a real database on port 5000.

## Prerequisites
- Backend server running locally on port 5000
- Database connected and migrated (Newsletter model added)
- An Admin account and JWT token

## Environment Variables
- `BASE_URL` (optional, default: http://localhost:5000)
- `ADMIN_TOKEN` (required to create/update/delete)
- `ADMIN_ID` (required to create)

## How to Run
From the backend folder:

```bash
# Windows PowerShell
$env:BASE_URL="http://localhost:5000"; $env:ADMIN_TOKEN="<your-token>"; $env:ADMIN_ID="<admin-uuid>"; node tests/newsletters/test-newsletters-real-db.mjs
```

If you don't provide `ADMIN_TOKEN` and `ADMIN_ID`, the script will still run read-only tests (Latest and List) and skip create/update/delete.

## Obtaining Admin Token and ID
1. Use the auth routes to log in as an admin user and copy the `token` from the response.
2. Get your `adminId` from the Admin record (or via an endpoint you already use to fetch admin profile).

## What the Test Does
1. Fetches latest newsletters
2. Optionally creates a newsletter (requires token + adminId)
3. Fetches by ID
4. Updates the newsletter
5. Deletes the newsletter
6. Lists newsletters with pagination

## Notes
- Image uploads are not exercised in this smoke test; it uses URL-encoded form data.
- For multipart image tests, use the `newsletters.http` file or Postman.
