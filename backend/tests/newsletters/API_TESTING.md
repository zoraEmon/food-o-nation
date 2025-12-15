# Newsletter/Update API Testing Guide

## Overview
The Newsletter API allows administrators to create, update, delete, and retrieve news updates with optional images.

## Base URL
```
http://localhost:5000/api/newsletters
```

## Endpoints

### 1. Create Newsletter (Admin Only)
**POST** `/api/newsletters`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `headline` (required): string - The newsletter headline
- `content` (required): string - The newsletter content
- `adminId` (required): string - UUID of the admin creating the newsletter
- `images` (optional): file[] - Up to 5 image files (max 5MB each)

**Example using curl:**
```bash
curl -X POST http://localhost:5000/api/newsletters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "headline=New Food Distribution Program" \
  -F "content=We are excited to announce a new food distribution program..." \
  -F "adminId=YOUR_ADMIN_ID" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png"
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "headline": "New Food Distribution Program",
    "content": "We are excited to announce...",
    "images": ["/uploads/newsletters/newsletter-1234567890.jpg"],
    "adminId": "admin-uuid",
    "createdAt": "2025-12-15T12:00:00.000Z",
    "updatedAt": "2025-12-15T12:00:00.000Z",
    "admin": {
      "id": "admin-uuid",
      "firstName": "John",
      "lastName": "Doe",
      "user": {
        "email": "admin@example.com",
        "id": "user-uuid"
      }
    }
  }
}
```

---

### 2. Update Newsletter (Admin Only)
**PUT** `/api/newsletters/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

**Body (Form Data):**
- `headline` (optional): string
- `content` (optional): string
- `images` (optional): file[] - New images (replaces existing)

**Example using curl:**
```bash
curl -X PUT http://localhost:5000/api/newsletters/NEWSLETTER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "headline=Updated Headline" \
  -F "content=Updated content..."
```

---

### 3. Delete Newsletter (Admin Only)
**DELETE** `/api/newsletters/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Example using curl:**
```bash
curl -X DELETE http://localhost:5000/api/newsletters/NEWSLETTER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Newsletter deleted successfully"
  }
}
```

---

### 4. Get Newsletter by ID (Public)
**GET** `/api/newsletters/:id`

**Example:**
```bash
curl http://localhost:5000/api/newsletters/NEWSLETTER_ID
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "headline": "Newsletter Title",
    "content": "Newsletter content...",
    "images": ["/uploads/newsletters/image1.jpg"],
    "adminId": "admin-uuid",
    "createdAt": "2025-12-15T12:00:00.000Z",
    "updatedAt": "2025-12-15T12:00:00.000Z",
    "admin": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### 5. Get All Newsletters with Pagination (Public)
**GET** `/api/newsletters`

**Query Parameters:**
- `page` (optional, default: 1): number
- `limit` (optional, default: 10): number
- `orderBy` (optional, default: 'createdAt'): 'createdAt' | 'updatedAt'
- `order` (optional, default: 'desc'): 'asc' | 'desc'

**Example:**
```bash
curl "http://localhost:5000/api/newsletters?page=1&limit=10&orderBy=createdAt&order=desc"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "headline": "Newsletter 1",
      "content": "Content...",
      "images": [],
      "createdAt": "2025-12-15T12:00:00.000Z",
      "updatedAt": "2025-12-15T12:00:00.000Z",
      "admin": {
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

### 6. Get Latest Newsletters (Public)
**GET** `/api/newsletters/latest`

**Query Parameters:**
- `limit` (optional, default: 5): number

**Example:**
```bash
curl "http://localhost:5000/api/newsletters/latest?limit=5"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "headline": "Latest Update",
      "content": "Content...",
      "images": ["/uploads/newsletters/image.jpg"],
      "createdAt": "2025-12-15T12:00:00.000Z",
      "admin": {
        "firstName": "Admin",
        "lastName": "User"
      }
    }
  ]
}
```

---

## Testing with Postman

### Setup
1. Import the collection from `/backend/tests/newsletters.http` (if created)
2. Set environment variables:
   - `BASE_URL`: http://localhost:5000
   - `ADMIN_TOKEN`: Your admin JWT token
   - `ADMIN_ID`: Your admin UUID

### Test Flow
1. **Login as Admin** to get authentication token
2. **Create Newsletter** with images
3. **Get All Newsletters** to verify creation
4. **Get Newsletter by ID** to view details
5. **Update Newsletter** to modify content
6. **Get Latest Newsletters** to see recent updates
7. **Delete Newsletter** to clean up

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Missing required fields: headline, content, adminId"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Newsletter not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Error message details"
}
```

---

## Database Schema

```prisma
model Newsletter {
  id        String   @id @default(uuid())
  headline  String
  content   String
  images    String[] @default([])
  adminId   String
  admin     Admin    @relation(fields: [adminId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Notes
- Images are stored in `/backend/uploads/newsletters/`
- Maximum 5 images per newsletter
- Maximum file size: 5MB per image
- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Public endpoints don't require authentication
- Admin endpoints require valid JWT token
