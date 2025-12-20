import { describe, it, expect } from 'vitest';
const { buildPayload, formatPhone } = require('../scripts/generate_beneficiary_payload');

describe('Beneficiary payload builder', () => {
  it('formats phone to +63 and includes household members and ISO dates', () => {
    const form = {
      email: 'a@b.com',
      password: 'p',
      firstName: 'A',
      lastName: 'B',
      birthDate: '1990-06-15',
      age: 35,
      primaryPhone: '09171234567',
      monthlyIncome: 1000,
      totalHouseholdMembers: 3,
      householdMembers: [
        { id: '1', fullName: 'X', dateOfBirth: '2010-01-01', age: 15, relationship: 'CHILD' }
      ],
      surveyAnswers: { q1: 'yes' },
      declarationAccepted: true,
      privacyAccepted: true,
      streetNumber: '1',
      barangay: 'B',
      municipality: 'M',
      region: 'R',
      zipCode: '1000'
    };

    const payload = buildPayload(form);
    expect(payload.contactNumber).toBe('+639171234567');
    expect(payload.primaryPhone).toBe('+639171234567');
    expect(Array.isArray(payload.householdMembers)).toBe(true);
    expect(payload.householdMembers[0].birthDate).toMatch(/T00:00:00.000Z$/);
    expect(payload.birthDate).toMatch(/T00:00:00.000Z$/);
    expect(payload.surveyAnswers).toEqual({ q1: 'yes' });
    expect(payload.declarationAccepted).toBe(true);
    expect(payload.privacyAccepted).toBe(true);
    expect(payload.streetNumber).toBe('1');
    expect(payload.barangay).toBe('B');
  });
});
