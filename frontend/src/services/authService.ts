import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5000/api/auth'; 

const api = axios.create({
  baseURL: API_URL,
});

interface RegisterResponse {
  success?: boolean;
  message: string;
  userId: string;
  requireVerification?: boolean;
  data?: { userId: string; token?: string };
}

interface LoginResponse {
  token?: string;
  user?: { 
    id: string; 
    displayName: string; 
    status: string; 
    roles: string[]; 
    isVerified?: boolean; 
  };
  requiresOtpVerification?: boolean;
  userId?: string;
  email?: string;
  message?: string;
}

interface UserProfile {
  id: string;
  email: string;
  status: string;
  profileImage: string | null;
  createdAt: string;
  beneficiaryProfile?: { firstName: string; lastName: string; address: any; };
  donorProfile?: { displayName: string; totalDonation?: number | null; points?: number; donorType?: string; };
  adminProfile?: { firstName: string; lastName: string; };
  isVerified?: boolean;
}

export const authService = {
  
  // 1. Register Beneficiary (FormData for all files and data)
  registerBeneficiary: async (data: any): Promise<RegisterResponse> => {
    const formData = new FormData();
    
    // Handle all file uploads
    if (data.profileImage instanceof File) {
      formData.append('profileImage', data.profileImage);
    }
    if (data.governmentIdFile instanceof File) {
      formData.append('governmentIdFile', data.governmentIdFile);
    }
    if (data.signature instanceof File) {
      formData.append('signature', data.signature);
    }
    
    // Handle arrays (stringify for FormData)
    if (Array.isArray(data.householdMembers)) {
      formData.append('householdMembers', JSON.stringify(data.householdMembers));
    }
    if (Array.isArray(data.incomeSources)) {
      formData.append('incomeSources', JSON.stringify(data.incomeSources));
    }
    
    // Handle all other non-file fields
    Object.keys(data).forEach((key) => {
      // Skip files and arrays (already handled above)
      if (key === 'profileImage' || key === 'governmentIdFile' || key === 'signature' || 
          key === 'householdMembers' || key === 'incomeSources') {
        return;
      }
      
      // Skip null/undefined
      if (data[key] !== null && data[key] !== undefined) {
        // Convert booleans and numbers properly
        if (typeof data[key] === 'boolean') {
          formData.append(key, data[key] ? 'true' : 'false');
        } else {
          formData.append(key, String(data[key]));
        }
      }
    });
    
    try {
      const response = await api.post<RegisterResponse>('/register/beneficiary', formData);
      return { success: true, ...response.data };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
        userId: '',
      };
    }
  },

  // 2. Register Donor (FormData for Image)
  registerDonor: async (data: any): Promise<RegisterResponse> => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'profileImage' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    });
    try {
      const response = await api.post<RegisterResponse>('/register/donor', formData);
      return { success: true, ...response.data };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed',
        userId: '',
      };
    }
  },
  
  // 3. Login
  login: async (email: string, password: string, loginType: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/login', { email, password, loginType });
      
      // If OTP verification is required
      if (response.data.requiresOtpVerification) {
        return response.data;
      }
      
      // Otherwise, standard login with token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (err: any) {
      return {
        token: undefined,
        user: undefined,
        message: err.response?.data?.message || 'Login failed',
      };
    }
  },

  // 4. Get Current User Profile
  getMe: async (): Promise<UserProfile | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    // Bypass mode - return mock data for development
    if (token === 'dev-bypass-token') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        const isBeneficiary = userData.role === 'BENEFICIARY';
        
        return {
          id: userData.id || 'dev-user-id',
          email: userData.email || (isBeneficiary ? 'beneficiary@test.com' : 'donor@test.com'),
          status: userData.status || 'APPROVED',
          profileImage: null,
          createdAt: new Date().toISOString(),
          isVerified: true,
          ...(isBeneficiary ? {
            beneficiaryProfile: {
              firstName: 'Test',
              lastName: 'Beneficiary',
              address: {
                streetNumber: '123 Test St',
                barangay: 'Test Barangay',
                municipality: 'Test City',
                region: 'NCR',
                zipCode: '1000'
              }
            }
          } : {
            donorProfile: {
              displayName: 'Test Donor',
              totalDonation: 0,
              points: 0,
              donorType: 'INDIVIDUAL'
            }
          })
        };
      }
      return null;
    }

    const apiWithToken = axios.create({
        baseURL: API_URL,
        headers: { Authorization: `Bearer ${token}` }
    });

    try {
        const response = await apiWithToken.get<UserProfile>('/me');
        return response.data;
    } catch (error) {
        return null; 
    }
  },
  
  // 5. Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 6. Verify OTP
  verifyOtp: async (data: { email: string; otp: string }): Promise<{ message: string; token?: string; user?: LoginResponse['user'] }> => {
    const response = await api.post<{ message: string; token?: string; user?: LoginResponse['user'] }>('/verify-otp', data);
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // 7. Verify Donor OTP
  verifyDonorOtp: async (userId: string, otp: string): Promise<{ success: boolean; message?: string; data?: { userId: string; token: string; user: any } }> => {
    try {
      const response = await api.post<any>('/verify-donor-otp', { userId, otp });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return { 
        success: true, 
        message: response.data.message || 'OTP verified', 
        data: response.data 
      };
    } catch (err: any) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'OTP verification failed',
        data: undefined
      };
    }
  },
};
