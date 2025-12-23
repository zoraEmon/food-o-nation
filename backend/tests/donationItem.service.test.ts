import { describe, it, expect } from 'vitest';
import { computeApprovalVerdict } from '../src/services/donationItem.service.js';

describe('computeApprovalVerdict', () => {
  it('returns null when any items are pending', () => {
    const items = [{ status: 'APPROVED' }, { status: 'PENDING' }];
    expect(computeApprovalVerdict(items)).toBeNull();
  });

  it('returns COMPLETELY_APPROVED when all approved', () => {
    const items = [{ status: 'APPROVED' }, { status: 'APPROVED' }];
    expect(computeApprovalVerdict(items)).toBe('COMPLETELY_APPROVED');
  });

  it('returns REJECTED when all rejected', () => {
    const items = [{ status: 'REJECTED' }, { status: 'REJECTED' }, { status: 'REJECTED' }];
    expect(computeApprovalVerdict(items)).toBe('REJECTED');
  });

  it('returns EXTREMELY_APPROVED when >=75% approved', () => {
    const items = [
      { status: 'APPROVED' },
      { status: 'APPROVED' },
      { status: 'APPROVED' },
      { status: 'APPROVED' },
    ];
    expect(computeApprovalVerdict(items)).toBe('EXTREMELY_APPROVED');
  });

  it('returns FAIRLY_APPROVED when >=50% approved but <75%', () => {
    const items = [{ status: 'APPROVED' }, { status: 'APPROVED' }, { status: 'REJECTED' }, { status: 'REJECTED' }];
    expect(computeApprovalVerdict(items)).toBe('FAIRLY_APPROVED');
  });

  it('returns BARELY_APPROVED when approved > rejected but below 50%', () => {
    const items = [
      { status: 'APPROVED' },
      { status: 'APPROVED' },
      { status: 'REJECTED' },
      { status: 'REJECTED' },
      { status: 'REJECTED' },
      { status: 'APPROVED' },
      { status: 'REJECTED' },
    ];
    // approved = 3, rejected = 4 => approved > rejected is false; adjust
    const items2 = [
      { status: 'APPROVED' },
      { status: 'APPROVED' },
      { status: 'APPROVED' },
      { status: 'REJECTED' },
      { status: 'REJECTED' },
      { status: 'REJECTED' },
    ];
    // approved = 3, rejected = 3 -> fallback MIXED
    const items3 = [
      { status: 'APPROVED' },
      { status: 'APPROVED' },
      { status: 'APPROVED' },
      { status: 'REJECTED' },
      { status: 'REJECTED' },
    ];
    // approved = 3, rejected = 2 -> approved > rejected -> BARELY_APPROVED
    expect(computeApprovalVerdict(items3)).toBe('BARELY_APPROVED');
  });
});