import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 1. Configuration: Where to store files
const uploadDir = 'uploads/';

// Prefer memory storage in test/memory mode to avoid disk I/O
let storage: any;
if (process.env.TEST_USE_MEMORY === 'true' || process.env.NODE_ENV === 'test') {
    storage = multer.memoryStorage();
} else {
    // Ensure the upload directory exists automatically
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 2. Storage Engine: Defines Name and Destination
    storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            // Generates: timestamp-random-originalName
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + path.extname(file.originalname));
        }
    });
}

// 3. File Filter: Security check (Images only)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only images (jpeg, png, gif, webp, etc.)
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        // Reject file
        cb(null, false); // Pass 'false' to simply reject, or new Error('...') to fail hard
    }
};

// 4. Export the configured middleware
export const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit: 5MB
    },
    fileFilter: fileFilter
});