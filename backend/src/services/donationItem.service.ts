import { PrismaClient, DonationStatus } from '../../generated/prisma/index.js';
import { DonationItemData } from "../interfaces/interfaces.js";

const prisma = new PrismaClient();


export const createDonationItemService  = async (data:DonationItemData)=>{
    try{
        const donationExists = data.donationId ? await prisma.donation.findUnique({
            where:{id: data.donationId},
        }) : null;
        const newDonationItem = await prisma.donationItem.create({
            data:{
                name: data.name, 
                category: data.category,
                quantity: parseFloat(data.quantity.toString()),
                unit: data.unit,
                donationId: data.donationId ? data.donationId : undefined,
            },
        });
        return newDonationItem
    }
    catch(err:any){
        console.log('Error in createDonationItemService:', err.message);
        throw new Error('Error creating donationItem');
    }

}

export const getAllDonationsItemService = async () => {
    return await prisma.donationItem.findMany({
        include: {
            donation: true,
        },
    });
};

export const getDonationItemByIdService = async (id: string) => {
    return await prisma.donationItem.findUnique({
        where: { id },
        include: {
            donation: true,
        },
    });
};

export const deleteDonationItemService = async (id: string) => {
  try {
    const deletedDonationItem = await prisma.donationItem.delete({
      where: { id: id },
    });

    return deletedDonationItem;
  } catch (error: any) {
    console.error('Error in deleteDonorItemService:', error);

    if (error.code === 'P2025') {
      throw new Error(`DonationItem with id ${id} not found.`);
    }

    throw new Error('Failed to delete DonationItem: ' + error.message);
  }
}
function validatePositiveNumber(value: number | string): number {
    const parsed = Number(value);
    if (isNaN(parsed) || parsed < 0) {
      throw new Error('maxParticipants must be a valid positive number');
    }
    return parsed;
  }
export const updateDonationItemService = async (id: string, data: Partial<DonationItemData>) => {
    try {
        const updatedDonationItem = await prisma.donationItem.update({
            where: { id },
            data: {
                ...data,
                quantity: data.quantity !== undefined ? validatePositiveNumber(parseFloat(data.quantity.toString())) : undefined,
            },
        });
        // After updating the item, compute aggregated approval verdict for the parent donation
        const donationItems = await prisma.donationItem.findMany({
            where: { donationId: updatedDonationItem.donationId },
        });

        const approvalVerdict = computeApprovalVerdict(donationItems);

        // Only persist the aggregated verdict when ALL items have been reviewed (i.e., no PENDING items)
        try {
            if (updatedDonationItem.donationId && approvalVerdict) {
                await prisma.donation.update({
                    where: { id: updatedDonationItem.donationId },
                    data: { approvalVerdict, status: DonationStatus.COMPLETED },
                });
            }
        } catch (err:any) {
            console.error('Failed to persist approvalVerdict on Donation:', err.message || err);
        }

        return { updatedDonationItem, approvalVerdict };
    } catch (error: any) {
        console.error('Error in updateDonationItemService:', error);

        if (error.code === 'P2025') {
            throw new Error(`DonationItem with id ${id} not found.`);
        }

        throw new Error('Failed to update DonationItem: ' + error.message);
    }

}

export function computeApprovalVerdict(items: Array<any>): string | null {
    if (!items || items.length === 0) return null;
    const total = items.length;
    let approved = 0;
    let rejected = 0;
    let pending = 0;
    for (const it of items) {
        if (it.status === 'APPROVED') approved++;
        else if (it.status === 'REJECTED') rejected++;
        else pending++;
    }

    // If any items are still pending review, do not compute/persist an aggregated verdict yet
    if (pending > 0) return null;

    // All items reviewed; compute verdict
    if (approved === total) return 'COMPLETELY_APPROVED';
    if (rejected === total) return 'REJECTED';
    if (approved / total >= 0.75) return 'EXTREMELY_APPROVED';
    if (approved / total >= 0.5) return 'FAIRLY_APPROVED';
    if (approved > rejected) return 'BARELY_APPROVED';

    // Fallback
    return 'MIXED';
}