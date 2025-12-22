import { Request,Response } from "express";
import { DonationItemData } from "../interfaces/interfaces.js";
import {createDonationItemService,getAllDonationsItemService,getDonationItemByIdService,deleteDonationItemService,updateDonationItemService} from "../services/donationItem.service.js";

export const createDonationItem = async (req:Request,res:Response)=>{
    try{
        const donationItem:DonationItemData = req.body;
        const newDonationItem = await createDonationItemService(donationItem);
        if(!newDonationItem){
            return res.status(400).json({ success: false, error: 'Failed to create donation' });
        }
        return res.status(201).json({ success: true, data: newDonationItem });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }
}

export const getAllDonationsItems = async (req:Request,res:Response)=>{
    try{
        const donationItem = await getAllDonationsItemService();
        if(!donationItem){
            return res.status(400).json({ success: false, error: 'Failed to get donationItem' });
        }
        return res.status(200).json({ success: true, data: donationItem });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }

}
export const getDonationItemById = async (req:Request,res:Response)=>{
    try{
        const id = req.params.id;
        const donationItem = await getDonationItemByIdService(id);
        if(!donationItem){
            return res.status(404).json({ success: false, error: 'DonationItem not found' });
        }
        return res.status(200).json({ success: true, data: donationItem });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }
}

export const deletedDonationItem = async (req:Request,res:Response)=>{
    try{
        const id = req.params.id;
        const donationItem = await deleteDonationItemService(id);
        if(!donationItem){
            return res.status(404).json({ success: false, error: 'DonationItem not found' });
        }
        return res.status(200).json({ success: true, data: donationItem });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }
}

export const updateDonationItem = async (req:Request,res:Response)=>{
    try{
        const donationItemId = req.params.id;
        const updateData: Partial<DonationItemData> = req.body;
        const result = await updateDonationItemService(donationItemId, updateData);
        if(!result || !result.updatedDonationItem){
            return res.status(404).json({ success: false, error: 'DonationItem not found' });
        }

        res.status(200).json({ success: true, data: { item: result.updatedDonationItem, approvalVerdict: result.approvalVerdict } });
    }
    catch(error:any){
        res.status(500).json({ success: false, error: error.message });
    }
};