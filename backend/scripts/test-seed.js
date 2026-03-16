/**
 * Test script — seeds demo luminary for a given account
 * Usage:
 *   node scripts/test-seed.js <email> <password>
 *   node scripts/test-seed.js sinchana@example.com mypassword
 */

const BASE = process.env.API_URL || 'http://localhost:3001/api/v1';

async function run() {
  const [,, email, password] = process.argv;

  if (!email || !password) {
    console.error('Usage: node scripts/test-seed.js <email> <password>');
    process.exit(1);
  }

  // 1. Login
  console.log(`\n→ Logging in as ${email}...`);
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const loginData = await loginRes.json();

  if (!loginRes.ok || !loginData.data?.tokens?.access_token) {
    console.error('✗ Login failed:', loginData?.error?.message ?? JSON.stringify(loginData));
    process.exit(1);
  }

  const token = loginData.data.tokens.access_token;
  console.log('✓ Logged in — user:', loginData.data.user.email);

  // 2. Seed demo luminary
  console.log('\n→ Seeding demo luminary...');
  const seedRes = await fetch(`${BASE}/seed/demo-luminary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const seedData = await seedRes.json();

  if (!seedRes.ok) {
    console.error('✗ Seed failed:', JSON.stringify(seedData, null, 2));
    process.exit(1);
  }

  const { created, memberId, message } = seedData.data;
  console.log(created ? '✓ Created!' : '• Already exists');
  console.log('  Member ID:', memberId);
  console.log('  Message :', message);
}

run().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
