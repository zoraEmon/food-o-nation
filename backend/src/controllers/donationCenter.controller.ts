import { Request,Response } from "express";
import { DonationCenterData } from "../interfaces/interfaces.js";
import {createDonationCenterService,getAllDonationCentersService,getDonationCenterByIdService,deleteDonationCenterService,updateDonationCenterService} from "../services/donationCenter.service.js";

export const createDonationCenter = async (req:Request,res:Response)=>{
    try{
        const donationCenter:DonationCenterData = req.body;
        const newDonationCenter = await createDonationCenterService(donationCenter);
        if(!newDonationCenter){
            return res.status(400).json({ success: false, error: 'Failed to create donationCenter' });
        }
        return res.status(201).json({ success: true, data: newDonationCenter });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }
}

export const getAllDonationCenters = async (req:Request,res:Response)=>{
    try{
        const donations = await getAllDonationCentersService();
        if(!donations){
            return res.status(400).json({ success: false, error: 'Failed to get donations' });
        }
        return res.status(200).json({ success: true, data: donations });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }

}
export const getDonationCenterById = async (req:Request,res:Response)=>{
    try{
        const id = req.params.id;
        const donation = await getDonationCenterByIdService(id);
        if(!donation){
            return res.status(404).json({ success: false, error: 'Donation not found' });
        }
        return res.status(200).json({ success: true, data: donation });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }
}

export const deletedDonationCenter = async (req:Request,res:Response)=>{
    try{
        const id = req.params.id;
        const donation = await deleteDonationCenterService(id);
        if(!donation){
            return res.status(404).json({ success: false, error: 'Donation not found' });
        }
        return res.status(200).json({ success: true, data: donation });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }
}
export const updateDonationCenter = async (req:Request,res:Response)=>{
    try{
        const id = req.params.id;
        const donationCenterData:Partial<DonationCenterData> = req.body;
        const updatedDonationCenter = await updateDonationCenterService(id, donationCenterData);
        if(!updatedDonationCenter){
            return res.status(404).json({ success: false, error: 'DonationCenter not found' });
        }
        return res.status(200).json({ success: true, data: updatedDonationCenter });
    }
    catch(error:any){
        return res.status(500).json({ success: false, error: error.message });
    }   
}