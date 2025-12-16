import { Request, Response } from 'express';
import {
  updateLogoService,
  updateAboutUsService,
  updateSocialLinksService,
  updateContactInfoService,
  getPageDetailsService,
} from '../services/updateDetails.service.js';
import {
  UpdateLogoData,
  UpdateAboutUsData,
  UpdateSocialLinksData,
  UpdateContactInfoData,
} from '../interfaces/interfaces.js';

// ==============================
// GET ALL PAGE DETAILS
// ==============================
export const getPageDetails = async (_: Request, res: Response) => {
  try {
    const data = await getPageDetailsService();
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==============================
// A. LOGO
// ==============================
export const updateLogo = async (req: Request, res: Response) => {
  try {
    const { logoUrl }: UpdateLogoData = req.body;

    if (!logoUrl) {
      return res.status(400).json({ success: false, error: 'Logo URL is required' });
    }

    const result = await updateLogoService({ logoUrl });
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==============================
// B. ABOUT US
// ==============================
export const updateAboutUs = async (req: Request, res: Response) => {
  try {
    const { aboutUs } = req.body as UpdateAboutUsData;

    if (!aboutUs) {
      return res.status(400).json({ success: false, error: 'About Us content is required' });
    }

    if (aboutUs.length > 3000) {
      return res.status(400).json({ success: false, error: 'About Us must not exceed 3000 characters' });
    }

    // Pass object matching the interface
    const result = await updateAboutUsService({ aboutUs });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
};


// ==============================
// C. SOCIAL LINKS
// ==============================
export const updateSocialLinks = async (req: Request, res: Response) => {
  try {
    const socialLinks: UpdateSocialLinksData = req.body;
    const result = await updateSocialLinksService(socialLinks);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ==============================
// D. CONTACT INFO
// ==============================
export const updateContactInfo = async (req: Request, res: Response) => {
  try {
    const contactInfo: UpdateContactInfoData = req.body;
    const result = await updateContactInfoService(contactInfo);
    res.status(200).json({ success: true, data: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};