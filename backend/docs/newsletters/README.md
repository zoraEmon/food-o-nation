# Newsletters / Updates

This section documents the backend API for creating and managing newsletters (updates) that include a headline, content, and optional images.

- Model: `Newsletter` (Prisma)
- Relations: `Newsletter.adminId -> Admin.id`
- Images: saved under `/backend/uploads/newsletters/`

## Endpoints

- GET `/api/newsletters/latest` — Latest items (public)
- GET `/api/newsletters` — Paginated list (public)
- GET `/api/newsletters/:id` — Get by ID (public)
- POST `/api/newsletters` — Create (admin only)
- PUT `/api/newsletters/:id` — Update (admin only)
- DELETE `/api/newsletters/:id` — Delete (admin only)

See `backend/tests/newsletters/API_TESTING.md` for cURL and REST examples.
