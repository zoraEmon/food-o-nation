import { Request, Response } from 'express';
import { NewsletterService } from '../services/newsletter.service.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const newsletterService = new NewsletterService();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/newsletters');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'newsletter-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

/**
 * Create a new newsletter/update
 * POST /api/newsletters
 */
export const createNewsletter = async (req: Request, res: Response) => {
  try {
    const { headline, content, adminId } = req.body;
    const userId = (req as any).user?.id;

    if (!headline || !content || !adminId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: headline, content, adminId',
      });
    }

    // Get image URLs from uploaded files
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File) => {
        images.push(`/uploads/newsletters/${file.filename}`);
      });
    }

    const newsletter = await newsletterService.create({
      headline,
      content,
      images,
      adminId,
      userId,
    });

    res.status(201).json({
      success: true,
      data: newsletter,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update an existing newsletter
 * PUT /api/newsletters/:id
 */
export const updateNewsletter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { headline, content } = req.body;
    const userId = (req as any).user?.id;

    // Get image URLs from uploaded files
    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach((file: Express.Multer.File) => {
        images.push(`/uploads/newsletters/${file.filename}`);
      });
    }

    const updateData: any = { userId };
    if (headline) updateData.headline = headline;
    if (content) updateData.content = content;
    if (images.length > 0) updateData.images = images;

    const newsletter = await newsletterService.update(id, updateData);

    res.status(200).json({
      success: true,
      data: newsletter,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete a newsletter
 * DELETE /api/newsletters/:id
 */
export const deleteNewsletter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const result = await newsletterService.delete(id, userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get a single newsletter by ID
 * GET /api/newsletters/:id
 */
export const getNewsletterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const newsletter = await newsletterService.getById(id);

    res.status(200).json({
      success: true,
      data: newsletter,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all newsletters with pagination
 * GET /api/newsletters
 */
export const getAllNewsletters = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const orderBy = (req.query.orderBy as 'createdAt' | 'updatedAt') || 'createdAt';
    const order = (req.query.order as 'asc' | 'desc') || 'desc';

    const result = await newsletterService.getAll({
      page,
      limit,
      orderBy,
      order,
    });

    res.status(200).json({
      success: true,
      data: result.newsletters,
      pagination: result.pagination,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get latest newsletters
 * GET /api/newsletters/latest
 */
export const getLatestNewsletters = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    const newsletters = await newsletterService.getLatest(limit);

    res.status(200).json({
      success: true,
      data: newsletters,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
