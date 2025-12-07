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

// Middleware function
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