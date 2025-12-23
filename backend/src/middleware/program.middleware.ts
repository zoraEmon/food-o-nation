import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the schema for program creation
const createProgramSchema = Joi.object({
    title: Joi.string().required().messages({
        'string.empty': 'Title is required',
    }),
    description: Joi.string().required().messages({
        'string.empty': 'Description is required',
    }),
    date: Joi.string().isoDate().required().messages({
        'string.empty': 'Date is required',
        'string.isoDate': 'Date must be in ISO 8601 format',
    }),
    maxParticipants: Joi.number().integer().positive().required().messages({
        'number.base': 'Max participants must be a number',
        'number.positive': 'Max participants must be greater than 0',
    }),
    placeId: Joi.string().required().messages({
        'string.empty': 'Place ID is required',
    }),
});

// Schema for program updates (all fields optional)
const updateProgramSchema = Joi.object({
    title: Joi.string().optional().messages({
        'string.empty': 'Title cannot be empty',
    }),
    description: Joi.string().optional().messages({
        'string.empty': 'Description cannot be empty',
    }),
    date: Joi.string().isoDate().optional().messages({
        'string.isoDate': 'Date must be in ISO 8601 format',
    }),
    maxParticipants: Joi.number().integer().positive().optional().messages({
        'number.base': 'Max participants must be a number',
        'number.positive': 'Max participants must be greater than 0',
    }),
    stallCapacity: Joi.number().integer().min(0).optional().messages({
        'number.base': 'Stall capacity must be a number',
        'number.min': 'Stall capacity must be 0 or greater',
    }),
    placeId: Joi.string().optional().messages({
        'string.empty': 'Place ID cannot be empty',
    }),
});

// Middleware function for create
export const validateCreateProgram = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Verify JWT Token
        // const token = req.headers.authorization?.split(' ')[1];
        // if (!token) {
        //     return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        // }

        // const decoded = jwt.verify(token, process.env.JWT_SECRET!); // Replace with your JWT secret
        // req.user = decoded; // Attach the decoded user to the request object

        // Step 2: Validate Request Body
        const { error } = createProgramSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ success: false, errors });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};

// Middleware function for update
export const validateUpdateProgram = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Step 1: Verify JWT Token (commented out for development)
        // const token = req.headers.authorization?.split(' ')[1];
        // if (!token) {
        //     return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        // }

        // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        // req.user = decoded;

        // Step 2: Validate Request Body (at least one field required)
        const { error } = updateProgramSchema.validate(req.body, { abortEarly: false });
        if (error) {
            const errors = error.details.map((detail) => detail.message);
            return res.status(400).json({ success: false, errors });
        }

        // Check that at least one field is provided
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ success: false, message: 'At least one field must be provided for update' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
    }
};