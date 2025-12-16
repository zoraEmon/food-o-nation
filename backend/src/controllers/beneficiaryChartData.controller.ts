import { Request, Response } from 'express';
import { getAllHomeAddressService,} from '../services/beneficiaryChartData.service.js';
import { getAllBeneficiary } from './Beneficiary.controller.js';
import { getAllBeneficiaryService } from 'src/services/beneficiary.service.js';
import { get } from 'http';



export const getBeneficiaryAddressCount = async (req: Request, res: Response) => {
    try {
        const addresses = await getAllHomeAddressService();

        const regionMap: Record<string, number> = {};

        addresses.forEach((addr) => {
            if (addr.beneficiary) {
                const region = addr.region || "Unknown";
                regionMap[region] = (regionMap[region] || 0) + 1;
            }
        });

        const data = Object.entries(regionMap).map(([region, count]) => ({
            region,
            count,
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
};
export const getBeneficiaryWithTheSameHouseholdNumber = async (req: Request, res: Response) => {
    try{
        const beneificaries = await getAllBeneficiaryService();
        const householdNumberMap: Record<string, number> = {};
        beneificaries.forEach((beneficiary:any) => {
            const householdNumber = beneficiary.adultCount + beneficiary.childrenCount ;
            if (householdNumber) {
                householdNumberMap[householdNumber] = (householdNumberMap[householdNumber] || 0) + 1;
            }
        });
        const data = Object.entries(householdNumberMap).map(([houseHoldPplCount, count]) => ({
            houseHoldPplCount,
            count,
        }));
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
}
export const getBeneficiaryMonthlyIncomeCount = async (req:Request,res:Response)=>{
    try{
        const beneficiary = await getAllBeneficiaryService();
        const incomeMap: Record<string, number>={};
        beneficiary.forEach((beneficiary:any)=>{
            const MonthlyIncome = beneficiary.monthlyIncome;
            if(MonthlyIncome <= 5000){
                incomeMap["0-5,000"] = (incomeMap["0-5,000"] || 0) + 1;
            } else if(MonthlyIncome <= 13100){
                incomeMap["5,0001-13,100"] = (incomeMap["5,0001-13,100"] || 0) + 1;
            } else if(MonthlyIncome <= 19650){
                incomeMap["13,101-19,650"] = (incomeMap["13,101-19,650"] || 0) + 1;
            } else {
                incomeMap["Above 19,651"] = (incomeMap["Above 19,651"] || 0) + 1;
            }
        });
        const data = Object.entries(incomeMap).map(([MonthlyIncome, count]) => ({
            MonthlyIncome,
            count,
        }));
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
}

export const getBeneficiaryEmpoymentStatus = async (req:Request,res:Response)=>{
    try{
        const beneficiary = await getAllBeneficiaryService();
        const employmentStatusMap: Record<string, number>={};
        beneficiary.forEach((beneficiary:any)=>{
            const employmentStatus = beneficiary.mainEmploymentStatus || "Unemployed";
            employmentStatusMap[employmentStatus] = (employmentStatusMap[employmentStatus] || 0) + 1;
        });
        const data = Object.entries(employmentStatusMap).map(([employmentStatus, count]) => ({
            employmentStatus,
            count,
        }));
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error });
    }
}