import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const createPlaceSchema = Joi.object({
    name: Joi.string().required(),
    address: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    programs: Joi.array().items(Joi.string()).optional(),
});

export const validateCreatePlace = (req: Request, res: Response, next: NextFunction) => {
    const { error } = createPlaceSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({ success: false, errors: error.details.map((detail) => detail.message) });
    }
    next();
};