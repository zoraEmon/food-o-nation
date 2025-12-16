import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/donations';

export interface DonationItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

export type CreateProduceDonationResponse = {
  success: boolean;
  data?: {
    id: string;
    donorId?: string;
    scheduledDate: string;
    status: string;
  };
  message?: string;
};

export async function createProduceDonation(
  donorId: string | null | undefined,
  donationCenterId: string,
  scheduledDate: string, // ISO 8601 format
  items: DonationItem[],
  imageUrls?: string[],
  guestName?: string,
  guestEmail?: string
) {
  const payload: any = {
    donationCenterId,
    scheduledDate,
    items,
    imageUrls: imageUrls || [],
  };

  if (donorId) {
    payload.donorId = donorId;
  } else {
    // For guest donations
    payload.guestName = guestName;
    payload.guestEmail = guestEmail;
  }

  const res = await axios.post<CreateProduceDonationResponse>(
    `${API_BASE}/produce`,
    payload
  );

  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to create produce donation');
  }

  return res.data.data;
}
