import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/donations';

export interface DonationItem {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  imageUrl?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  files?: File[], // optional image files (item images + donation image)
  fileIndexMap?: number[],
  fileMeta?: Array<{ originalName?: string; note?: string; itemIndex?: number }>,
  guestName?: string,
  guestEmail?: string
) {
  // If there are files, send multipart/form-data so backend multer can handle them
  if (files && files.length > 0) {
    const form = new FormData();
    form.append('donationCenterId', donationCenterId);
    form.append('scheduledDate', scheduledDate);
    form.append('items', JSON.stringify(items));
    if (fileIndexMap) form.append('fileIndexMap', JSON.stringify(fileIndexMap));
    if (fileMeta) form.append('fileMeta', JSON.stringify(fileMeta));
    if (donorId) form.append('donorId', donorId);
    else {
      if (guestName) form.append('guestName', guestName);
      if (guestEmail) form.append('guestEmail', guestEmail);
    }

    files.forEach((f) => {
      form.append('images', f);
    });

    const headers: any = {};
    try { const token = localStorage.getItem('token'); if (token) headers.Authorization = `Bearer ${token}`; } catch {}

    const res = await axios.post<CreateProduceDonationResponse>(`${API_BASE}/produce`, form, { headers });
    if (!res.data.success) throw new Error(res.data.message || 'Failed to create produce donation');
    return res.data.data;
  }

  // Fallback: send JSON payload when no files
  const payload: any = {
    donationCenterId,
    scheduledDate,
    items,
    imageUrls: [],
  };
  if (donorId) payload.donorId = donorId;
  else {
    payload.guestName = guestName;
    payload.guestEmail = guestEmail;
  }

  const res = await axios.post<CreateProduceDonationResponse>(`${API_BASE}/produce`, payload);
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to create produce donation');
  }
  return res.data.data;
}
