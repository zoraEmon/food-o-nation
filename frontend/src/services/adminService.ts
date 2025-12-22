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
   * Get pending donors (dedicated endpoint)
   */
  async getPendingDonors(): Promise<{
    donors: DonorData[];
  }> {
    try {
      const response = await api.get('/admin/donors/pending');
      // The backend returns { success: true, data: donors[] }
      return { donors: response.data.data };
    } catch (error: any) {
      console.error('Error fetching pending donors:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch pending donors');
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
   * Get drop-off schedule grouped by status
   */
  async getDropoffSchedule(): Promise<Record<string, any[]>> {
    try {
      const response = await api.get('/admin/dropoff-schedule');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching dropoff schedule:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch dropoff schedule');
    }
  }

  /**
   * Update a donation's status (SCHEDULED | COMPLETED | CANCELLED)
   */
  async updateDonationStatus(id: string, status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED', notes?: string): Promise<any> {
    try {
      const response = await api.patch(`/donations/${id}/status`, { status, notes });
      return response.data.data.donation || response.data.data;
    } catch (error: any) {
      console.error('Error updating donation status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update donation status');
    }
  }
  async getDonationById(id: string): Promise<any> {
    try {
      const response = await api.get(`/donations/${id}`);
      return response.data?.data?.donation || response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error fetching donation by id:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to fetch donation');
    }
  }
  /**
   * Scan a donation QR payload (admin action)
   */
  async scanDonationQr(qrData: string): Promise<any> {
    try {
      const response = await api.post('/donations/scan-qr', { qrData });
      return response.data.data.donation || response.data.data;
    } catch (error: any) {
      // Log richer diagnostics to help debugging upload/scan failures
      const status = error?.response?.status;
      const respData = error?.response?.data;
      try {
        console.error('Error scanning donation QR:', {
          message: error?.message,
          status,
          responseData: respData !== undefined ? (typeof respData === 'object' ? JSON.parse(JSON.stringify(respData)) : respData) : undefined,
          stack: error?.stack,
        });
      } catch (e) {
        console.error('Error scanning donation QR (failed to stringify response):', error);
      }

      // Prefer server-provided message when available, otherwise include status and raw body when empty
      const serverMessage = respData?.message || respData?.error;
      const fallback = error?.message || 'Failed to scan donation QR';
      const msg = serverMessage || (status ? `Server responded with status ${status}: ${JSON.stringify(respData || {})}` : fallback);
      throw new Error(msg);
    }
  }

  /** Programs: admin CRUD */
  async getPrograms(): Promise<any[]> {
    try {
      const response = await api.get('/programs');
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error fetching programs:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to fetch programs');
    }
  }

  async getProgramById(id: string): Promise<any> {
    try {
      const response = await api.get(`/programs/${id}`);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error fetching program by id:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to fetch program');
    }
  }

  async createProgram(data: any): Promise<any> {
    try {
      const response = await api.post('/programs', data);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error creating program:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to create program');
    }
  }

  async updateProgram(id: string, data: any): Promise<any> {
    try {
      const response = await api.patch(`/programs/${id}`, data);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error updating program:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to update program');
    }
  }

  async publishProgram(id: string): Promise<any> {
    try {
      const response = await api.post(`/programs/${id}/publish`);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error publishing program:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to publish program');
    }
  }

  async cancelProgram(id: string): Promise<any> {
    try {
      const response = await api.post(`/programs/${id}/cancel`);
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error cancelling program:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to cancel program');
    }
  }

  /** Get stall reservations for a program (admin) */
  async getProgramStalls(programId: string): Promise<any[]> {
    try {
      const response = await api.get(`/stalls/programs/${programId}/reservations`);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Error fetching program stalls:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to fetch program stalls');
    }
  }

  /** Update a donation item (approve/reject/quantity)
   * POST /donation-items/updateDonationItem/:id
   */
  async updateDonationItem(id: string, data: any): Promise<any> {
    try {
      const response = await api.post(`/donationItem/updateDonationItem/${id}`, data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error updating donation item:', error?.response?.data || error.message || error);
      throw new Error(error.response?.data?.message || 'Failed to update donation item');
    }
  }

  /**
   * Approve a beneficiary by ID (uses review endpoint)
   */
  async approveBeneficiary(id: string, reason?: string): Promise<void> {
    try {
      await api.patch(`/admin/beneficiaries/${id}/approve`, { reason });
    } catch (error: any) {
      console.error('Error approving beneficiary:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve beneficiary');
    }
  }

  /**
   * Reject a beneficiary by ID
   */
  async rejectBeneficiary(id: string, reason?: string): Promise<void> {
    try {
      await api.patch(`/admin/beneficiaries/${id}/reject`, { reason });
    } catch (error: any) {
      console.error('Error rejecting beneficiary:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject beneficiary');
    }
  }

  /**
   * Touch beneficiary updatedAt when admin views the application
   */
  async touchBeneficiary(id: string): Promise<boolean> {
    try {
      await api.patch(`/admin/beneficiaries/${id}/touch`);
      return true;
    } catch (error: any) {
      // Don't throw; touch is a best-effort action. Log and return false so callers can continue.
      console.warn('touchBeneficiary failed:', error?.response?.data || error?.message || error);
      return false;
    }
  }

  /**
   * Touch donor updatedAt when admin views the application (best-effort)
   */
  async touchDonor(id: string): Promise<boolean> {
    try {
      await api.patch(`/admin/donors/${id}/touch`);
      return true;
    } catch (error: any) {
      console.warn('touchDonor failed:', error?.response?.data || error?.message || error);
      return false;
    }
  }

  /**
   * Approve a donor by ID (uses review endpoint)
   */
  async approveDonor(id: string, reason?: string): Promise<void> {
    try {
      await api.patch(`/admin/donors/${id}/approve`, { reason });
    } catch (error: any) {
      console.error('Error approving donor:', error);
      throw new Error(error.response?.data?.message || 'Failed to approve donor');
    }
  }

  /**
   * Reject a donor by ID (uses review endpoint)
   */
  async rejectDonor(id: string, reason?: string): Promise<void> {
    try {
      await api.patch(`/admin/donors/${id}/reject`, { reason });
    } catch (error: any) {
      console.error('Error rejecting donor:', error);
      throw new Error(error.response?.data?.message || 'Failed to reject donor');
    }
  }
}

export const adminService = new AdminService();
