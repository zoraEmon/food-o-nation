import { describe, it, expect } from 'vitest';
import { registerBeneficiarySchema, registerDonorSchema, loginSchema } from '../src/utils/validators.js';

describe('Validators: password & zip code rules', () => {
  const validPassword = 'StrongPass1!@'; // 12+ with uppercase, digit, special
  const invalids = {
    short: 'Ab1!a',
    noUpper: 'weakpass1!@#',
    noNumber: 'Weakpass!@#$',
    noSpecial: 'Weakpass1234'
  };

  it('rejects short passwords', () => {
    const res = loginSchema.safeParse({ email: 'a@b.com', password: invalids.short, loginType: 'BENEFICIARY' });
    expect(res.success).toBe(false);
  });

  it('rejects passwords without uppercase', () => {
    const res = loginSchema.safeParse({ email: 'a@b.com', password: invalids.noUpper, loginType: 'BENEFICIARY' });
    expect(res.success).toBe(false);
  });

  it('rejects passwords without number', () => {
    const res = loginSchema.safeParse({ email: 'a@b.com', password: invalids.noNumber, loginType: 'BENEFICIARY' });
    expect(res.success).toBe(false);
  });

  it('rejects passwords without special char', () => {
    const res = loginSchema.safeParse({ email: 'a@b.com', password: invalids.noSpecial, loginType: 'BENEFICIARY' });
    expect(res.success).toBe(false);
  });

  it('accepts valid password for login', () => {
    const res = loginSchema.safeParse({ email: 'a@b.com', password: validPassword, loginType: 'BENEFICIARY' });
    expect(res.success).toBe(true);
  });

  it('registerBeneficiary accepts valid password and zip', () => {
    const payload: any = {
      email: 'test.user@example.com',
      password: validPassword,
      firstName: 'Test',
      lastName: 'User',
      gender: 'MALE',
      civilStatus: 'SINGLE',
      birthDate: new Date().toISOString(),
      age: '30',
      contactNumber: '09171234567',
      occupation: 'Farmer',
      householdNumber: '1',
      householdAnnualSalary: '10000',
      householdPosition: 'FATHER',
      primaryPhone: '+639171234567',
      streetNumber: '123',
      barangay: 'Sample Brgy',
      municipality: 'Sample Town',
      region: 'NCR',
      zipCode: '1234'
    };
    const res = registerBeneficiarySchema.safeParse(payload);
    if (!res.success) console.log('registerBeneficiary errors:', res.error.format());
    expect(res.success).toBe(true);
  });

  it('rejects invalid zip code (not 4 digits)', () => {
    const payload: any = {
      email: 'test.user@example.com',
      password: validPassword,
      firstName: 'Test',
      lastName: 'User',
      gender: 'MALE',
      civilStatus: 'SINGLE',
      birthDate: new Date().toISOString(),
      age: '30',
      contactNumber: '09171234567',
      occupation: 'Farmer',
      householdNumber: '1',
      householdAnnualSalary: '10000',
      householdPosition: 'FATHER',
      primaryPhone: '+639171234567',
      streetNumber: '123',
      barangay: 'Sample Brgy',
      municipality: 'Sample Town',
      region: 'NCR',
      zipCode: '123'
    };
    const res = registerBeneficiarySchema.safeParse(payload);
    expect(res.success).toBe(false);
  });

  it('registerDonor enforces password rules', () => {
    const ok = registerDonorSchema.safeParse({ email: 'd@o.com', password: validPassword, displayName: 'Donor', donorType: 'INDIVIDUAL' });
    expect(ok.success).toBe(true);
    const bad = registerDonorSchema.safeParse({ email: 'd@o.com', password: invalids.noUpper, displayName: 'Donor', donorType: 'INDIVIDUAL' });
    expect(bad.success).toBe(false);
  });
});
