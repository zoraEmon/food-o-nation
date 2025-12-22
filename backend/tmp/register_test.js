(async () => {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register/donor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test+ci_node@example.com',
        password: 'ValidPassw0rd!',
        displayName: 'CI Node Donor',
        donorType: 'INDIVIDUAL',
        primaryPhone: '+639171234567'
      })
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log(text);
  } catch (e) {
    console.error('ERROR', e);
  }
})();
