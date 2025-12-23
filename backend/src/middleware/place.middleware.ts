import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const createPlaceSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 3 characters',
    }),
    address: Joi.string().min(3).required().messages({
        'string.empty': 'Address is required',
        'string.min': 'Address must be at least 3 characters',
    }),
    latitude: Joi.number().required().messages({
        'number.base': 'Latitude must be a number',
        'any.required': 'Latitude is required',
    }),
    longitude: Joi.number().required().messages({
        'number.base': 'Longitude must be a number',
        'any.required': 'Longitude is required',
    }),
    programs: Joi.array().items(Joi.string()).optional(),
});

export const validateCreatePlace = (req: Request, res: Response, next: NextFunction) => {
    const { error } = createPlaceSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ success: false, errors: error.details.map((detail) => detail.message) });
    }
    next();
};