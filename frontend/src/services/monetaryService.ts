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

export async function initMayaCheckout(donorId: string | null, amount: number, description?: string) {
  const res = await axios.post<InitMayaCheckoutResponse>(`${API_BASE}/maya/checkout`, {
    donorId: donorId || undefined,
    amount,
    description,
  });
  if (!res.data.success || !res.data.data?.redirectUrl) {
    throw new Error(res.data.message || 'Failed to initialize Maya checkout');
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
  guestEmail?: string
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
  }

  const res = await axios.post<CreateMonetaryDonationResponse>(`${API_BASE}/monetary`, payload);
  return res.data;
}
