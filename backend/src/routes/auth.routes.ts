import express from 'express';
import {
    registerBeneficiary,
    registerDonor,
    login,
    getMe,
    verifyOTP // Import verifyOTP
} from '../controllers/auth.controller.js';
import { AuthRequest, authToken } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

// 1. Beneficiary Registration (Correct)
router.post(
    '/register/beneficiary', 
    upload.single('profileImage'), 
    registerBeneficiary
);

// 2. Donor Registration (FIXED: Deleted the duplicate line above this!)
console.log("⚡ Server: Loading Donor Routes...");

router.post('/register/donor', 
    (req, res, next) => {
        console.log("1. Hit /register/donor route");
        console.log("2. Content-Type:", req.headers['content-type']);
        next();
    },
    upload.single('profileImage'), 
    (req, res, next) => {
        console.log("3. Passed Multer Middleware");
        console.log("4. req.body keys:", Object.keys(req.body));
        console.log("5. req.file exists?", !!req.file);
        next();
    },
    registerDonor
);

// 3. Login
router.post('/login', login);

// 4. Verify OTP (NEW)
router.post('/verify-otp', verifyOTP);

// Protected route
router.get('/me', authToken, getMe);

export default router;
