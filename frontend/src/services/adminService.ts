import api from './api';

export interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  allPrograms: number;
  totalMonetaryDonations: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string | null;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export interface HouseholdMember {
  id: string;
  fullName: string;
  birthDate: string;
  age: number;
  relationship: string;
}

export interface BeneficiaryData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  contactNumber: string;
  householdNumber: number;
  householdAnnualSalary: number;
  occupation: string;
  age: number;
  birthDate: string;
  createdAt: string;
  governmentIdType?: string;
  governmentIdFileUrl?: string;
  signatureUrl?: string;
  householdMembers?: HouseholdMember[];
  address?: {
    streetNumber: string;
    barangay: string;
    municipality: string;
    region: string;
    country: string;
    zipCode: string;
  };
  user?: {
    id: string;
    email: string;
    status: string;
    createdAt: string;
    profileImage?: string;
  };
  programRegistrations?: any[];
}

export interface DonorData {
  id: string;
  displayName: string;
  donorType: string;
  email: string;
  status: string;
  totalDonation?: number;
  points: number;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    status: string;
    createdAt: string;
    profileImage?: string;
  };
  donations?: any[];
  stallReservations?: any[];
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

class AdminService {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/admin/dashboard-stats');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }

  /**
   * Get recent activity logs
   */
  async getRecentActivity(limit: number = 10): Promise<ActivityLog[]> {
    try {
      const response = await api.get(`/admin/recent-activity?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching recent activity:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activity');
    }
  }

  /**
   * Get all beneficiaries with pagination and filtering
   */
  async getAllBeneficiaries(page: number = 1, limit: number = 10, status?: string): Promise<{
    beneficiaries: BeneficiaryData[];
    pagination: PaginationData;
  }> {
    try {
      let url = `/admin/beneficiaries?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await api.get(url);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching beneficiaries:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch beneficiaries');
    }
  }

  /**
   * Get beneficiary details by ID
   */
  async getBeneficiaryDetails(id: string): Promise<BeneficiaryData> {
    try {
      const response = await api.get(`/admin/beneficiaries/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching beneficiary details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch beneficiary details');
    }
  }

  /**
   * Get all donors with pagination and filtering
   */
  async getAllDonors(page: number = 1, limit: number = 10, status?: string): Promise<{
    donors: DonorData[];
    pagination: PaginationData;
  }> {
    try {
      let url = `/admin/donors?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await api.get(url);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching donors:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch donors');
    }
  }

  /**
   * Get donor details by ID
   */
  async getDonorDetails(id: string): Promise<DonorData> {
    try {
      const response = await api.get(`/admin/donors/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching donor details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch donor details');
    }
  }

  /**
   * Approve a beneficiary by ID (uses review endpoint)
   */
  async approveBeneficiary(id: string): Promise<void> {
    try {
      await api.post(`/beneficiaries/${id}/review`, { approved: true });
    } catch (error: any) {
      console.error('Error approving beneficiary:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve beneficiary');
    }
  }

  /**
   * Reject a beneficiary by ID (uses review endpoint)
   */
  async rejectBeneficiary(id: string): Promise<void> {
    try {
      await api.post(`/beneficiaries/${id}/review`, { approved: false });
    } catch (error: any) {
      console.error('Error rejecting beneficiary:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject beneficiary');
    }
  }

  /**
   * Approve a donor by ID (uses review endpoint)
   */
  async approveDonor(id: string): Promise<void> {
    try {
      await api.post(`/donors/${id}/review`, { approved: true });
    } catch (error: any) {
      console.error('Error approving donor:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve donor');
    }
  }

  /**
   * Reject a donor by ID (uses review endpoint)
   */
  async rejectDonor(id: string): Promise<void> {
    try {
      await api.post(`/donors/${id}/review`, { approved: false });
    } catch (error: any) {
      console.error('Error rejecting donor:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject donor');
    }
  }
}

export const adminService = new AdminService();
