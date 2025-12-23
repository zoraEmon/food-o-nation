import axios from 'axios';

const API_URL = 'http://localhost:5000/api/programs';

const api = axios.create({
  baseURL: API_URL,
});

// =========================================================
// PROGRAM APPLICATION TYPES
// =========================================================

export interface ProgramApplicationResponse {
  id: string;
  applicationStatus: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  qrCodeValue: string;
  qrCodeImageUrl: string;
  scheduledDeliveryDate: string;
  actualDeliveryDate: string | null;
  qrCodeScannedAt: string | null;
  qrCodeScannedByAdminId: string | null;
  createdAt: string;
  updatedAt: string;
  programRegistration: {
    id: string;
    status: string;
    program: {
      id: string;
      title: string;
      description: string;
      date: string;
      place: {
        id: string;
        name: string;
        address: string;
      };
    };
    beneficiary: {
      id: string;
      firstName: string;
      lastName: string;
      activeEmail: string;
      address: any;
    };
  };
}

export interface RegisterForProgramRequest {
  programId: string;
  beneficiaryId: string;
}

export interface RegisterForProgramResponse {
  success: boolean;
  message: string;
  data: {
    registration: any;
    application: ProgramApplicationResponse;
  };
}

export interface ScanQRCodeRequest {
  qrCodeValue: string;
  adminId: string;
  notes?: string;
}

export interface ScanQRCodeResponse {
  success: boolean;
  message: string;
  data: {
    application: ProgramApplicationResponse;
    scan: {
      id: string;
      scannedAt: string;
      notes: string | null;
      scannedByAdminId: string;
      scannedByAdmin: {
        id: string;
        firstName: string;
        lastName: string;
      };
    };
  };
}

export interface ApplicationStats {
  total: number;
  pending: number;
  completed: number;
  cancelled: number;
  scanRate: string;
}

// =========================================================
// PROGRAM APPLICATION SERVICE
// =========================================================

export const programApplicationService = {
  /**
   * Register a beneficiary for a program
   * Creates ProgramRegistration and ProgramApplication with QR code
   */
  registerForProgram: async (
    data: RegisterForProgramRequest
  ): Promise<RegisterForProgramResponse> => {
    try {
      const response = await api.post('/register', data);
      return response.data;
    } catch (error: any) {
      console.error('Error registering for program:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to register for program'
      );
    }
  },

  /**
   * Get application details by ID
   */
  getApplicationById: async (
    applicationId: string
  ): Promise<{ success: boolean; data: ProgramApplicationResponse }> => {
    try {
      const response = await api.get(`/application/${applicationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching application:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch application'
      );
    }
  },

  /**
   * Get all applications for a beneficiary
   */
  getBeneficiaryApplications: async (
    beneficiaryId: string
  ): Promise<{ success: boolean; data: ProgramApplicationResponse[] }> => {
    try {
      const response = await api.get(`/beneficiary/${beneficiaryId}/applications`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching beneficiary applications:', error);
      throw new Error(
        error.response?.data?.error ||
          'Failed to fetch beneficiary applications'
      );
    }
  },

  /**
   * Scan QR code (admin)
   */
  scanQRCode: async (
    data: ScanQRCodeRequest
  ): Promise<ScanQRCodeResponse> => {
    try {
      const response = await api.post('/scan-qr', data);
      return response.data;
    } catch (error: any) {
      // If this is a 'already scanned' conflict (409), log as debug and rethrow so callers (UI) can show a friendly modal
      if (error?.response?.status === 409) {
        console.debug('QR scan conflict (already scanned):', error?.response?.data?.error);
        throw error;
      }

      // For other errors, log as error and rethrow
      console.error('Error scanning QR code:', error);
      throw error;
    }
  },

  /**
   * Get all applications for a program (admin)
   */
  getApplicationsByProgram: async (
    programId: string
  ): Promise<{ success: boolean; data: ProgramApplicationResponse[] }> => {
    try {
      const response = await api.get(`/${programId}/applications`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching program applications:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch program applications'
      );
    }
  },

  /**
   * Get application statistics for a program (admin)
   */
  getApplicationStats: async (
    programId: string
  ): Promise<{ success: boolean; data: ApplicationStats }> => {
    try {
      const response = await api.get(`/${programId}/applications/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching application stats:', error);
      throw new Error(
        error.response?.data?.error || 'Failed to fetch application statistics'
      );
    }
  },

  /**
   * Update expired applications (admin)
   */
  updateExpiredApplications: async (): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> => {
    try {
      const response = await api.post('/admin/update-expired');
      return response.data;
    } catch (error: any) {
      console.error('Error updating expired applications:', error);
      throw new Error(
        error.response?.data?.error ||
          'Failed to update expired applications'
      );
    }
  },
};
