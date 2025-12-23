import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables as early as possible
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'foodONationSecret';
const AUTH_DEBUG = process.env.AUTH_DEBUG === 'true';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        roles: string[];
        status: string;
    };
}

// Middleware para i-verify ang JWT token
export const authToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        if (AUTH_DEBUG) {
            console.log('[Auth Debug] Authorization header present. Token (truncated):', token ? `${token.slice(0, 8)}...${token.slice(-8)}` : 'none');
        }
        jwt.verify(token, JWT_SECRET, (err, user: any) => {
            if (err) {
                console.warn('JWT verification failed:', err?.message || err);
                return res.status(401).json({ success: false, message: 'Invalid or expired token' });
            }
            req.user = user;
            if (AUTH_DEBUG) {
                try {
                    console.log('[Auth Debug] Decoded JWT payload:', JSON.stringify(user));
                } catch (e) {
                    console.log('[Auth Debug] Decoded JWT payload (non-serializable)');
                }
            }
            next();
        });
    } catch (e) {
        console.error('JWT verification error:', e);
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }

};

// Middleware to authorize based on roles
export const authorizeRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roles) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const hasPermission = req.user.roles.some((role: string) => allowedRoles.includes(role));

        if (!hasPermission) {
            return res.status(403).json({ success: false, message: 'Forbidden' });
        }

        next();
    };
};

export const requireApproval = (req: AuthRequest, res: Response, next: NextFunction) => {
    // If the user is still under approval process, block certain actions
    if (req.user?.status !== 'APPROVED') {
        return res.status(403).json({ 
            message: "Your account is pending approval. You cannot perform this action yet." 
        });
  }
  next();
};