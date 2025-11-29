import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

const JWT_SECRET = process.env.JWT_SECRET || 'foodONationSecret';
dotenv.config();

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

    if(!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, user: any) => {
        if(err) return res.status(403).json({ message: 'Invalid token or expired token' });
        req.user = user;
        next();
    });

};

// Middleware to authorize based on roles
export const authorizeRole = (allowedRoles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if(!req.user || !req.user.roles) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));
    
        if(!hasPermission) {
            return res.status(403).json({ message: "Forbidden" });
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