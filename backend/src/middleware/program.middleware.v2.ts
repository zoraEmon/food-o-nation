import { NextFunction, Request, Response } from 'express';

// Validate create program request
export const validateCreateProgram = (req: Request, res: Response, next: NextFunction) => {
  const { title, description, date, maxParticipants, placeId } = req.body;

  const errors = [];

  // Check title
  if (!title) {
    errors.push({ field: 'title', message: 'Program title is required' });
  } else if (typeof title !== 'string') {
    errors.push({ field: 'title', message: 'Title must be a string' });
  } else if (title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title cannot be empty' });
  } else if (title.length < 3) {
    errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
  } else if (title.length > 100) {
    errors.push({ field: 'title', message: 'Title cannot exceed 100 characters' });
  }

  // Check description
  if (!description) {
    errors.push({ field: 'description', message: 'Program description is required' });
  } else if (typeof description !== 'string') {
    errors.push({ field: 'description', message: 'Description must be a string' });
  } else if (description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Description cannot be empty' });
  } else if (description.length < 10) {
    errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
  } else if (description.length > 1000) {
    errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
  }

  // Check date
  if (!date) {
    errors.push({ field: 'date', message: 'Program date is required' });
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format. Use ISO 8601 format (e.g., 2025-12-15T10:00:00Z)' });
    } else if (dateObj < new Date()) {
      errors.push({ field: 'date', message: 'Program date must be in the future' });
    }
  }

  // Check maxParticipants
  if (!maxParticipants && maxParticipants !== 0) {
    errors.push({ field: 'maxParticipants', message: 'Maximum participants is required' });
  } else {
    const num = parseInt(maxParticipants);
    if (isNaN(num) || num <= 0) {
      errors.push({ field: 'maxParticipants', message: 'Maximum participants must be a positive number' });
    } else if (num > 10000) {
      errors.push({ field: 'maxParticipants', message: 'Maximum participants cannot exceed 10000' });
    }
  }

  // Check placeId
  if (!placeId) {
    errors.push({ field: 'placeId', message: 'Place ID is required' });
  } else if (typeof placeId !== 'string') {
    errors.push({ field: 'placeId', message: 'Place ID must be a string' });
  } else if (placeId.trim().length === 0) {
    errors.push({ field: 'placeId', message: 'Place ID cannot be empty' });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

// Validate update program request
export const validateUpdateProgram = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ['title', 'description', 'date', 'maxParticipants', 'status', 'placeId'];
  const errors = [];

  // Check for invalid fields
  for (const key of Object.keys(req.body)) {
    if (!allowedFields.includes(key)) {
      errors.push({ field: key, message: `Unknown field. Allowed fields: ${allowedFields.join(', ')}` });
    }
  }

  // Validate each provided field
  if (req.body.title !== undefined) {
    if (typeof req.body.title !== 'string') {
      errors.push({ field: 'title', message: 'Title must be a string' });
    } else if (req.body.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title cannot be empty' });
    } else if (req.body.title.length < 3) {
      errors.push({ field: 'title', message: 'Title must be at least 3 characters' });
    } else if (req.body.title.length > 100) {
      errors.push({ field: 'title', message: 'Title cannot exceed 100 characters' });
    }
  }

  if (req.body.description !== undefined) {
    if (typeof req.body.description !== 'string') {
      errors.push({ field: 'description', message: 'Description must be a string' });
    } else if (req.body.description.trim().length === 0) {
      errors.push({ field: 'description', message: 'Description cannot be empty' });
    } else if (req.body.description.length < 10) {
      errors.push({ field: 'description', message: 'Description must be at least 10 characters' });
    } else if (req.body.description.length > 1000) {
      errors.push({ field: 'description', message: 'Description cannot exceed 1000 characters' });
    }
  }

  if (req.body.date !== undefined) {
    const dateObj = new Date(req.body.date);
    if (isNaN(dateObj.getTime())) {
      errors.push({ field: 'date', message: 'Invalid date format. Use ISO 8601 format (e.g., 2025-12-15T10:00:00Z)' });
    } else if (dateObj < new Date()) {
      errors.push({ field: 'date', message: 'Program date must be in the future' });
    }
  }

  if (req.body.maxParticipants !== undefined) {
    const num = parseInt(req.body.maxParticipants);
    if (isNaN(num) || num <= 0) {
      errors.push({ field: 'maxParticipants', message: 'Maximum participants must be a positive number' });
    } else if (num > 10000) {
      errors.push({ field: 'maxParticipants', message: 'Maximum participants cannot exceed 10000' });
    }
  }

  if (req.body.status !== undefined) {
    const validStatuses = ['PENDING', 'APPROVED', 'CLAIMED', 'CANCELED', 'REJECTED'];
    if (!validStatuses.includes(req.body.status)) {
      errors.push({ field: 'status', message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }
  }

  if (req.body.placeId !== undefined) {
    if (typeof req.body.placeId !== 'string') {
      errors.push({ field: 'placeId', message: 'Place ID must be a string' });
    } else if (req.body.placeId.trim().length === 0) {
      errors.push({ field: 'placeId', message: 'Place ID cannot be empty' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};
