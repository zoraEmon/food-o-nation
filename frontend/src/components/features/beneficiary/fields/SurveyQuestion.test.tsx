import React from 'react';
import { render, screen } from '@testing-library/react';
import SurveyQuestion from './SurveyQuestion';

const question = {
  id: 'q1',
  text: 'Test question',
  type: 'FOOD_FREQUENCY',
  options: [
    { value: 'NEVER', label: 'Never' },
    { value: 'RARELY', label: 'Rarely' },
  ],
};

test('renders options and labels', () => {
  render(<SurveyQuestion question={question as any} value={''} onChange={() => {}} />);
  expect(screen.getByText('Test question')).toBeInTheDocument();
  expect(screen.getByText('Never')).toBeInTheDocument();
  expect(screen.getByText('Rarely')).toBeInTheDocument();
});

test('falls back to canonical options when options missing', () => {
  const q = { id: 'q2', text: 'Severity question', type: 'FOOD_SECURITY_SEVERITY' } as any;
  render(<SurveyQuestion question={q} value={''} onChange={() => {}} />);
  expect(screen.getByText('Severity question')).toBeInTheDocument();
  expect(screen.getByText('Secure')).toBeInTheDocument();
  expect(screen.getByText('Severe')).toBeInTheDocument();
});
