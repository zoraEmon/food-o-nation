// Simple script that mirrors the payload-building logic in BeneficiaryApplicationForm.tsx
// Run with: node frontend/scripts/generate_beneficiary_payload.js

function formatPhone(phone) {
  if (!phone) return undefined;
  const digits = ('' + phone).replace(/[^0-9]/g, '');
  const trimmed = digits.replace(/^0+/, '');
  return '+63' + trimmed;
}

function toIso(dateStr) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return d.toISOString();
}

function buildPayload(formData) {
  const birthDateIso = formData.birthDate ? toIso(formData.birthDate) : undefined;

  const householdMembersPayload = formData.householdMembers
    ? formData.householdMembers
        .filter((m) => m.fullName && m.dateOfBirth)
        .map((m) => ({
          fullName: m.fullName,
          birthDate: toIso(m.dateOfBirth),
          age: m.age,
          relationship: m.relationship,
        }))
    : undefined;

  const formattedPhone = formatPhone(formData.primaryPhone);

  const payload = {
    email: formData.email,
    password: formData.password,
    firstName: formData.firstName,
    lastName: formData.lastName,
    middleName: formData.middleName,
    gender: formData.gender,
    civilStatus: formData.civilStatus,
    birthDate: birthDateIso,
    age: formData.age,
    contactNumber: formattedPhone,
    occupation: formData.occupation,
    householdNumber: formData.totalHouseholdMembers,
    householdAnnualSalary: formData.monthlyIncome !== '' && formData.monthlyIncome !== undefined ? Number(formData.monthlyIncome) * 12 : undefined,
    householdPosition: formData.householdPosition || undefined,
    primaryPhone: formattedPhone,
    activeEmail: formData.email,
    governmentIdType: formData.governmentIdType,
    monthlyIncome: formData.monthlyIncome !== '' && formData.monthlyIncome !== undefined ? Number(formData.monthlyIncome) : undefined,
    incomeSources: formData.incomeSources,
    mainEmploymentStatus: formData.mainEmploymentStatus,
    receivingAid: formData.receivingAid,
    receivingAidDetail: formData.receivingAidSpecify,
    childrenCount: formData.childrenCount,
    adultCount: formData.adultCount,
    seniorCount: formData.seniorCount,
    pwdCount: formData.pwdCount,
    specialDietRequired: formData.hasSpecialDiet,
    specialDietDescription: formData.specialDietSpecify,
    declarationAccepted: formData.declarationAccepted,
    privacyAccepted: formData.privacyAccepted,
    streetNumber: formData.streetNumber,
    barangay: formData.barangay,
    municipality: formData.municipality,
    region: formData.region,
    zipCode: formData.zipCode,
    householdMembers: householdMembersPayload,
    surveyAnswers: formData.surveyAnswers,
    // files would be appended as multipart/form-data in the real request
    profileImage: formData.profileImage ? '[File]' : undefined,
    governmentIdFile: formData.governmentIdFile ? '[File]' : undefined,
    signature: formData.signature ? '[File]' : undefined,
  };

  return payload;
}

// Example sample form data — modify as needed to simulate different cases
const sampleForm = {
  email: 'test@example.com',
  password: 'supersecretpassword',
  firstName: 'Juan',
  lastName: 'Dela Cruz',
  middleName: 'S',
  gender: 'MALE',
  civilStatus: 'SINGLE',
  birthDate: '2000-01-15',
  age: 25,
  occupation: 'Farmer',
  primaryPhone: '09171234567',
  totalHouseholdMembers: 4,
  monthlyIncome: 5000,
  householdPosition: 'HEAD',
  incomeSources: ['FARMING', 'REMITTANCE'],
  mainEmploymentStatus: 'FULL_TIME',
  receivingAid: false,
  receivingAidSpecify: '',
  childrenCount: 2,
  adultCount: 1,
  seniorCount: 1,
  pwdCount: 0,
  hasSpecialDiet: true,
  specialDietSpecify: 'No pork',
  declarationAccepted: true,
  privacyAccepted: true,
  streetNumber: '123 Example St',
  barangay: 'Barangay 1',
  municipality: 'Sample City',
  region: 'NCR',
  zipCode: '1000',
  householdMembers: [
    { id: '1', fullName: 'Child One', dateOfBirth: '2018-05-01', age: 7, relationship: 'CHILD' },
    { id: '2', fullName: 'Spouse', dateOfBirth: '1998-03-12', age: 27, relationship: 'SPOUSE' },
  ],
  surveyAnswers: { q1: 'yes', q2: 'no' },
  profileImage: null,
  governmentIdFile: null,
  signature: null,
};

function runAsScript() {
  const payload = buildPayload(sampleForm);
  console.log('--- Payload that would be sent to backend (JSON) ---');
  console.log(JSON.stringify(payload, null, 2));

  // Also print a FormData-like listing (keys that would be appended)
  console.log('\n--- FormData keys (simulated) ---');
  const formDataKeys = Object.keys(payload).filter(k => payload[k] !== undefined);
  console.log(formDataKeys);
}

if (typeof require !== 'undefined' && require.main === module) {
  runAsScript();
}

// Export for tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildPayload, formatPhone, toIso };
}
