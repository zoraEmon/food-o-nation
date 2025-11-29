import express from 'express';
import {
    registerBeneficiary,
    registerDonor,
    login
} from '../controllers/auth.controller.js';
import { AuthRequest, authToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register/beneficiary', registerBeneficiary);      // Para sa beneficiary registration
router.post('/register/donor', registerDonor);                  // Para sa donor registration
router.post('/login', login);                                   // Para sa login

// Protected route to get authenticated user info
router.get('/me', authToken, (req: AuthRequest, res) => {
    res.json({
        message: "You are authenticated!",
        user: req.user,
    });
});

export default router;