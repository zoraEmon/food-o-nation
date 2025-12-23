import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { NotificationProvider } from '@/components/ui/NotificationProvider';
import { adminService } from '@/services/adminService';
import { DonorManagement } from '../DonorManagement';

const DonorWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe('Donor Management', () => {
  const sampleDonor = { id: 'd1', displayName: 'ACME Charity', createdAt: '2025-01-01T00:00:00.000Z' } as any;

  beforeEach(() => vi.restoreAllMocks());

  it('approve triggers approveDonor and refresh', async () => {
    const listSpy = vi.spyOn(adminService, 'getAllDonors').mockResolvedValue({ donors: [sampleDonor], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } as any);
    const approveSpy = vi.spyOn(adminService, 'approveDonor').mockResolvedValue(undefined as any);

    render(<DonorManagement />, { wrapper: DonorWrapper });

    await waitFor(() => expect(screen.getByText('Approve')).toBeInTheDocument());

    fireEvent.click(screen.getAllByText('Approve')[0]);

    // Reason modal should open; confirm to perform action
    await waitFor(() => expect(screen.getByText('Provide a reason (optional) that will be saved with the review.')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(approveSpy).toHaveBeenCalledWith('d1', undefined);
      expect(listSpy).toHaveBeenCalledTimes(6);
    });
  });
});
