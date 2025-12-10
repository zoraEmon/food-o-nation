/**
 * Helper Script: Get Test IDs for Donation API Testing
 * 
 * This script queries your database to get valid donor and donation center IDs
 * that you can use for testing the donation API.
 * 
 * Usage: node get-test-ids.mjs
 */

import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient();

async function getTestIds() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 FETCHING TEST IDS FROM DATABASE');
  console.log('='.repeat(60) + '\n');

  try {
    // Get donors
    const donors = await prisma.donor.findMany({
      take: 5,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    // Get donation centers
    const donationCenters = await prisma.donationCenter.findMany({
      take: 5,
      include: {
        place: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    // Display results
    console.log('📋 AVAILABLE DONORS:');
    console.log('-'.repeat(60));
    if (donors.length === 0) {
      console.log('❌ No donors found in database.');
      console.log('   Create a donor account first using the registration endpoint.\n');
    } else {
      donors.forEach((donor, index) => {
        console.log(`${index + 1}. ID: ${donor.id}`);
        console.log(`   Name: ${donor.displayName}`);
        console.log(`   Email: ${donor.user?.email || 'N/A'}`);
        console.log(`   Type: ${donor.donorType}`);
        console.log('');
      });
    }

    console.log('\n🏢 AVAILABLE DONATION CENTERS:');
    console.log('-'.repeat(60));
    if (donationCenters.length === 0) {
      console.log('❌ No donation centers found in database.');
      console.log('   Add donation centers using Prisma Studio or seed script.\n');
    } else {
      donationCenters.forEach((center, index) => {
        console.log(`${index + 1}. ID: ${center.id}`);
        console.log(`   Name: ${center.place?.name || 'N/A'}`);
        console.log(`   Address: ${center.place?.address || 'N/A'}`);
        console.log(`   Contact: ${center.contactInfo}`);
        console.log('');
      });
    }

    // Generate test data object
    if (donors.length > 0 && donationCenters.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ TEST DATA FOR COPY-PASTE');
      console.log('='.repeat(60));
      console.log('\n// For test-donations.http file:');
      console.log(`@donorId = ${donors[0].id}`);
      console.log(`@donationCenterId = ${donationCenters[0].id}`);
      
      console.log('\n// For test-donations.mjs file:');
      console.log('const TEST_DATA = {');
      console.log(`  donorId: '${donors[0].id}',`);
      console.log(`  donationCenterId: '${donationCenters[0].id}',`);
      console.log('};\n');
    } else {
      console.log('\n' + '='.repeat(60));
      console.log('⚠️  INCOMPLETE TEST DATA');
      console.log('='.repeat(60));
      console.log('\nYou need both donors and donation centers to test the API.');
      console.log('\nNext steps:');
      if (donors.length === 0) {
        console.log('  1. Create a donor account via registration endpoint');
      }
      if (donationCenters.length === 0) {
        console.log('  2. Add donation centers via Prisma Studio or seed script');
      }
      console.log('  3. Run this script again: node get-test-ids.mjs\n');
    }

  } catch (error) {
    console.error('\n❌ Error fetching test IDs:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Database is running');
    console.error('  2. DATABASE_URL is set in .env');
    console.error('  3. Migrations are up to date: npx prisma migrate dev\n');
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
getTestIds();
