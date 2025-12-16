import { Request, Response } from 'express';
import { getAllAddressesService,getAddressByIdService,createAddressService,updateAddressService,deleteAddressService } from '../services/address.service.js';
import { AddressData } from '../interfaces/interfaces.js';


export const createAddress = async (req: Request, res: Response) => {
    try {
        console.log('Request Headers:', req.headers);
        console.log('Request Body:', req.body);
        // Extract and validate the request body
        const addressData: AddressData = req.body;

        // Call the service to create the place
        const newAddress = await createAddressService(addressData);

        // Send success response
        res.status(201).json({ success: true, data: newAddress });
    } catch (error: any) {
        // Send error response with error.message
        res.status(500).json({ success: false, error: error.message });
    }
};
export const getAllAddresses = async (req: Request, res: Response) => {
    try {
        const address = await getAllAddressesService();
        res.status(200).json({ success: true, data: address });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const getAddressById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const address = await getAddressByIdService(id);

        if (!address) {
            return res.status(404).json({ success: false, error: 'Address not found' });
        }

        res.status(200).json({ success: true, data: address });
    } catch (error) {
        res.status(500).json({ success: false, error: error });
    }
};

export const updateAddress = async (req: Request, res: Response) => {
    try {
        const addressId = req.params.id;
        const updateData: Partial<AddressData> = req.body;
        const updatedAddress= await updateAddressService(addressId, updateData);
        if (!updatedAddress) {
            return res.status(404).json({ success: false, error: 'Address not found' });
        }
        res.status(200).json({ success: true, data: updatedAddress });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const addressId = req.params.id;
        const deletedAddress = await deleteAddressService(addressId);
        if (!deletedAddress) {
            return res.status(404).json({ success: false, error: 'Address not found' });
        }
        res.status(200).json({ success: true, data: deletedAddress });
    }
    catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}