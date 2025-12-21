(async () => {
  try {
    const fetchMod = await import('node-fetch');
    const fetch = fetchMod.default || fetchMod;
    const url = 'http://localhost:5000/api/auth/register/beneficiary';
    const fd = new (await import('form-data')).default();

    fd.append('email', `cli-survey+${Date.now()}@example.com`);
    fd.append('password', 'CliPassword123@');
    fd.append('firstName', 'CLI');
    fd.append('lastName', 'SurveyTester');
    fd.append('birthDate', '1990-01-01T00:00:00.000Z');
    fd.append('primaryPhone', '+639171234567');
    fd.append('gender', 'MALE');
    fd.append('civilStatus', 'SINGLE');
    fd.append('age', '30');
    fd.append('contactNumber', '+639171234567');
    fd.append('occupation', 'Tester');
    fd.append('householdNumber', '1');
    fd.append('householdAnnualSalary', '0');
    fd.append('householdPosition', 'GRANDFATHER');
    fd.append('streetNumber', '1 CLI St');
    fd.append('barangay', 'TestBrgy');
    fd.append('municipality', 'TestCity');
    fd.append('region', 'NCR');
    fd.append('zipCode', '1000');

    const members = [{ fullName: 'Child', birthDate: '2018-01-01T00:00:00.000Z', age: 7, relationship: 'CHILD' }];
    fd.append('householdMembers', JSON.stringify(members));
    fd.append('incomeSources', JSON.stringify(['FARMING']));
    fd.append('monthlyIncome', '0');
    fd.append('mainEmploymentStatus', 'EMPLOYED_FULL_TIME');
    fd.append('declarationAccepted', 'true');
    fd.append('privacyAccepted', 'true');
    fd.append('governmentIdType', 'PHILHEALTH');

    // Use known question IDs from DB and choose labels that map to SURVEY_OPTIONS
    const surveyAnswers = [
      { questionId: '300cac54-5a5a-42e5-9698-48898cc5d07d', response: 'Secure' },
      { questionId: 'b9e77b2d-353e-4469-bf44-5bd7e159380c', response: 'Mild' },
      { questionId: 'd9bc471f-2302-4330-b26a-a976af5b20c8', response: 'Often' },
      { questionId: '3fba67d8-9ce8-42bc-8c19-ce6b8fc67bfe', response: 'Sometimes' },
      { questionId: '98a6d84b-42c5-4a03-bbd9-e2ef17d683f5', response: 'Moderate' },
      { questionId: 'f8537534-102e-4f82-ba4c-c894f0cbc973', response: 'Severe' }
    ];

    fd.append('surveyAnswers', JSON.stringify(surveyAnswers));

    const headers = fd.getHeaders ? fd.getHeaders() : {};
    const res = await fetch(url, { method: 'POST', body: fd, headers });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response:', text);

  } catch (err) {
    console.error('Request failed', err);
  }
})();
