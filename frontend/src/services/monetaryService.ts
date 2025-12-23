import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/donations';

export type InitMayaCheckoutResponse = {
  success: boolean;
  message?: string;
  data?: {
    donorId?: string;
    amount?: number;
    checkoutId?: string;
    redirectUrl?: string;
  };
};

export type InitPayPalCheckoutResponse = {
  success: boolean;
  message?: string;
  data?: {
    donorId?: string;
    amount?: number;
    paymentReference?: string;
    redirectUrl?: string;
  };
};

export type InitCreditCardCheckoutResponse = {
  success: boolean;
  message?: string;
  data?: {
    donorId?: string;
    amount?: number;
    clientSecret?: string;
  };
};

export async function initMayaCheckout(donorId: string | null, amount: number, description?: string, email?: string, phone?: string) {
  const headers: any = {};
  try {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {}
  const res = await axios.post<InitMayaCheckoutResponse>(`${API_BASE}/maya/checkout`, {
    donorId: donorId || undefined,
    amount,
    description,
    email,
    phone,
  }, { headers });
  if (!res.data.success || !res.data.data?.redirectUrl) {
    throw new Error(res.data.message || 'Failed to initialize Maya checkout');
  }
  return res.data.data;
}

export async function initPayPalCheckout(donorId: string | null, amount: number, description?: string, email?: string, phone?: string) {
  const headers: any = {};
  try {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {}
  const res = await axios.post<InitPayPalCheckoutResponse>(`${API_BASE}/paypal/checkout`, {
    donorId: donorId || undefined,
    amount,
    description,
    email,
    phone,
  }, { headers });
  if (!res.data.success || !res.data.data?.redirectUrl) {
    throw new Error(res.data.message || 'Failed to initialize PayPal checkout');
  }
  return res.data.data;
}

export type CreateMonetaryDonationResponse = {
  success: boolean;
  data?: any;
  message?: string;
};

export async function finalizeMonetaryDonation(
  donorId: string | null, 
  amount: number, 
  paymentMethod: string, 
  paymentReference: string,
  guestName?: string,
  guestEmail?: string,
  guestMobile?: string
) {
  const payload: any = {
    amount,
    paymentMethod,
    paymentReference,
  };

  if (donorId) {
    payload.donorId = donorId;
  } else {
    // For guest donations, include name and email
    payload.guestName = guestName;
    payload.guestEmail = guestEmail;
    if (guestMobile) payload.guestMobileNumber = guestMobile;
  }

  const headers: any = {};
  try {
    const token = localStorage.getItem('token');
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {}
  const res = await axios.post<CreateMonetaryDonationResponse>(`${API_BASE}/monetary`, payload, { headers });
  return res.data;
}
