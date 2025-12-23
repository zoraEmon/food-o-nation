import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { adminService } from '@/services/adminService';
import { NotificationProvider } from '@/components/ui/NotificationProvider';

import { BeneficiaryManagement } from '../BeneficiaryManagement';

// Helper to wrap component with providers
const BeneficiaryWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NotificationProvider>{children}</NotificationProvider>
);

describe('Admin Beneficiary Management', () => {
  const sampleBeneficiary = {
    id: 'b1',
    firstName: 'John',
    lastName: 'Doe',
    user: { createdAt: '2025-01-01T00:00:00.000Z' },
    monthlyIncome: 22222,
    householdAnnualSalary: 266664
  } as any;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('submitting reason performs approve action and closes modal', async () => {
    vi.spyOn(adminService, 'getAllBeneficiaries').mockResolvedValue({ beneficiaries: [sampleBeneficiary], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } as any);
    const approveSpy = vi.spyOn(adminService, 'approveBeneficiary').mockResolvedValue(undefined as any);
    const listSpy = vi.spyOn(adminService, 'getAllBeneficiaries').mockResolvedValue({ beneficiaries: [sampleBeneficiary], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } as any);

    render(<BeneficiaryManagement />, { wrapper: BeneficiaryWrapper });

    // Wait for approve button
    await waitFor(() => expect(screen.getByText('Approve')).toBeInTheDocument());

    // Click Approve -> opens reason modal
    fireEvent.click(screen.getAllByText('Approve')[0]);
    expect(screen.getByText('Approve Beneficiary')).toBeInTheDocument();

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Looks good' } });

    const confirmButton = screen.getByText('Confirm');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(approveSpy).toHaveBeenCalledWith('b1', 'Looks good');
      // list should be refreshed after action (3 calls for initial load + 3 calls for refresh)
      expect(listSpy).toHaveBeenCalledTimes(6); // initial load + refresh
      // modal should close
      expect(screen.queryByText('Approve Beneficiary')).not.toBeInTheDocument();
    });
  });

  it('viewing details then survey shows questions and mapped answers', async () => {
    vi.spyOn(adminService, 'getAllBeneficiaries').mockResolvedValue({ beneficiaries: [sampleBeneficiary], pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } } as any);

    const survey = {
      id: 's1',
      createdAt: '2025-02-02T00:00:00.000Z',
      answers: [
        { id: 'a1', question: { id: 'q1', text: 'Have you skipped meals?' }, foodFrequencyResponse: 'RARELY' }
      ]
    } as any;

    const getDetailsSpy = vi.spyOn(adminService, 'getBeneficiaryDetails').mockResolvedValue({ ...sampleBeneficiary, foodSecuritySurveys: [survey] } as any);
    vi.spyOn(adminService, 'touchBeneficiary').mockResolvedValue(true as any);

    render(<BeneficiaryManagement />, { wrapper: BeneficiaryWrapper });

    // Click view
    await waitFor(() => expect(screen.getByText('View')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('View')[0]);

    // Wait for modal and click "View Survey"
    await waitFor(() => expect(getDetailsSpy).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText('View Survey')).toBeInTheDocument());
    fireEvent.click(screen.getByText('View Survey'));

    // Survey modal should display question and mapped label
    await waitFor(() => expect(screen.getByText('Have you skipped meals?')).toBeInTheDocument());
    const ansEl = await screen.findByText('Rarely');
    expect(ansEl).toBeInTheDocument();
    expect(ansEl).toHaveClass('font-semibold');

    // Monthly and Annual incomes should be shown formatted as PHP currency
    await waitFor(() => expect(screen.getByText(/\u20b1\s?22,222/)).toBeInTheDocument());
    expect(screen.getByText(/\u20b1\s?266,664/)).toBeInTheDocument();

    // Primary contact (contactNumber) should not be displayed
    expect(screen.queryByText('Contact Number')).not.toBeInTheDocument();
  });
});
