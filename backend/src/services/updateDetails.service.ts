import { PrismaClient } from '../../generated/prisma/index.js';
import {
  UpdateLogoData,
  UpdateAboutUsData,
  UpdateSocialLinksData,
  UpdateContactInfoData,
} from '../interfaces/interfaces.js';

const prisma = new PrismaClient();

// ==============================
// GET ALL PAGE DETAILS
// ==============================
export const getPageDetailsService = async () => {
  try {
    const logo = await prisma.pageLogo.findFirst();
    const about = await prisma.pageAbout.findFirst();
    const social = await prisma.pageSocialMedia.findFirst();
    const contact = await prisma.pageContact.findFirst();

    return { logo, about, social, contact };
  } catch (error: any) {
    console.error('Error in getPageDetailsService:', error);
    throw new Error('Failed to fetch page details: ' + error.message);
  }
};

// ==============================
// UPDATE LOGO
// ==============================
export const updateLogoService = async (data: UpdateLogoData) => {
  try {
    const result = await prisma.pageLogo.upsert({
      where: { id: 'singleton' },
      update: { logoUrl: data.logoUrl },
      create: { id: 'singleton', logoUrl: data.logoUrl },
    });
    return result;
  } catch (error: any) {
    console.error('Error in updateLogoService:', error);
    throw new Error('Failed to update logo: ' + error.message);
  }
};

// ==============================
// UPDATE ABOUT US
// ==============================
export const updateAboutUsService = async (data: UpdateAboutUsData) => {
  try {
    const result = await prisma.pageAbout.upsert({
      where: { id: 'singleton' },
      update: { aboutUs: data.aboutUs },
      create: { id: 'singleton', aboutUs: data.aboutUs },
    });
    return result;
  } catch (error: any) {
    console.error('Error in updateAboutUsService:', error);
    throw new Error('Failed to update About Us: ' + error.message);
  }
};

// ==============================
// UPDATE SOCIAL LINKS
// ==============================
export const updateSocialLinksService = async (data: UpdateSocialLinksData) => {
  try {
    const result = await prisma.pageSocialMedia.upsert({
      where: { id: 'singleton' },
      update: { ...data },
      create: { id: 'singleton', ...data },
    });
    return result;
  } catch (error: any) {
    console.error('Error in updateSocialLinksService:', error);
    throw new Error('Failed to update social links: ' + error.message);
  }
};

// ==============================
// UPDATE CONTACT INFO
// ==============================
export const updateContactInfoService = async (data: UpdateContactInfoData) => {
  try {
    const result = await prisma.pageContact.upsert({
      where: { id: 'singleton' },
      update: { ...data },
      create: { id: 'singleton', ...data },
    });
    return result;
  } catch (error: any) {
    console.error('Error in updateContactInfoService:', error);
    throw new Error('Failed to update contact info: ' + error.message);
  }
};