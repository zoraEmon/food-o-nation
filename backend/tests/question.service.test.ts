import { SURVEY_OPTIONS } from '../src/constants/surveyOptions';
import { describe, it, expect } from 'vitest';

describe('SURVEY_OPTIONS mapping', () => {
  it('has options for FOOD_FREQUENCY', () => {
    expect(SURVEY_OPTIONS.FOOD_FREQUENCY).toBeDefined();
    expect(SURVEY_OPTIONS.FOOD_FREQUENCY.length).toBeGreaterThan(0);
    expect(SURVEY_OPTIONS.FOOD_FREQUENCY[0]).toMatchObject({ value: 'NEVER', label: 'Never' });
  });

  it('has severity options for FOOD_SECURITY_SEVERITY', () => {
    expect(SURVEY_OPTIONS.FOOD_SECURITY_SEVERITY).toBeDefined();
    expect(SURVEY_OPTIONS.FOOD_SECURITY_SEVERITY[0]).toMatchObject({ value: 'SECURE' });
  });
});
