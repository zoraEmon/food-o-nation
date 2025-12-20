(async () => {
  console.log('Running post_registration script');
  try {
    if (typeof fetch === 'undefined') console.log('fetch is not defined in this Node runtime');
    const url = 'http://localhost:5000/api/auth/register/beneficiary';
    const fd = new FormData();
    fd.append('email', `cli2+test+${Date.now()}@example.com`);
    fd.append('password', 'CliPassword123@');
    fd.append('firstName', 'CLI2');
    fd.append('lastName', 'Tester');
    fd.append('birthDate', '2005-01-01T00:00:00.000Z');
    fd.append('age', '20');
    fd.append('contactNumber', '+639171234567');
    fd.append('occupation', 'Tester');
    fd.append('householdNumber', '1');
    fd.append('householdAnnualSalary', '0');
    fd.append('householdPosition', 'GRANDFATHER');
    fd.append('gender', 'MALE');
    fd.append('civilStatus', 'SINGLE');
    fd.append('primaryPhone', '+639171234567');
    fd.append('streetNumber', '1 CLI St');
    fd.append('barangay', 'TestBrgy');
    fd.append('municipality', 'TestCity');
    fd.append('region', 'TestRegion');
    fd.append('zipCode', '1000');
    const members = [{ fullName: 'Child', birthDate: '2018-01-01T00:00:00.000Z', age: 7, relationship: 'CHILD' }];
    fd.append('householdMembers', JSON.stringify(members));
    fd.append('incomeSources', JSON.stringify(['FARMING']));
    fd.append('monthlyIncome', '0');
    fd.append('mainEmploymentStatus', 'EMPLOYED_FULL_TIME');
    fd.append('receivingAid', 'false');
    fd.append('receivingAidDetail', 'a');
    fd.append('declarationAccepted', 'true');
    fd.append('privacyAccepted', 'true');
    fd.append('governmentIdType', 'PHILHEALTH');

    const res = await fetch(url, { method: 'POST', body: fd });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);
  } catch (err) {
    console.error('Request failed', err);
  }
})();
