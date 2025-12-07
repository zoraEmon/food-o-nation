import axios from 'axios';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5000/api/auth'; 

const api = axios.create({
  baseURL: API_URL,
});

interface RegisterResponse {
  message: string;
  userId: string;
  requireVerification?: boolean;
}

interface LoginResponse {
  token: string;
  user: { 
    id: string; 
    displayName: string; 
    status: string; 
    roles: string[]; 
    isVerified?: boolean; 
  };
}

interface UserProfile {
  id: string;
  email: string;
  status: string;
  profileImage: string | null;
  createdAt: string;
  beneficiaryProfile?: { firstName: string; lastName: string; address: any; };
  donorProfile?: { displayName: string; };
  adminProfile?: { firstName: string; lastName: string; };
  isVerified?: boolean;
}

export const authService = {
  
  // 1. Register Beneficiary (FormData for Image)
  registerBeneficiary: async (data: any): Promise<RegisterResponse> => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'profileImage' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    });
    const response = await api.post<RegisterResponse>('/register/beneficiary', formData);
    return response.data;
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
    const response = await api.post<RegisterResponse>('/register/donor', formData);
    return response.data;
  },
  
  // 3. Login
  login: async (email: string, password: string, loginType: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/login', { email, password, loginType });
    
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // 4. Get Current User Profile
  getMe: async (): Promise<UserProfile | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;

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
};
