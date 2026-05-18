/**
 * Quick script to check if payment plans exist in database
 * Run: node check-payment-plans.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPlans() {
  try {
    console.log('🔍 Checking payment plans in database...\n');
    
    const plans = await prisma.paymentPlan.findMany({
      orderBy: { createdAt: 'asc' },
    });

    if (plans.length === 0) {
      console.log('❌ No payment plans found in database!\n');
      console.log('💡 Solution: Run the seed script to create payment plans:');
      console.log('   npm run prisma:seed\n');
      process.exit(1);
    }

    console.log(`✅ Found ${plans.length} payment plan(s):\n`);
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ID: ${plan.id}`);
      console.log(`   Name: ${plan.name}`);
      console.log(`   Price: ${plan.price} OMR`);
      console.log(`   Enabled: ${plan.enabled ? '✅' : '❌'}`);
      console.log(`   Period: ${plan.period}\n`);
    });

    // Check for required plans
    const requiredPlans = ['free-plan', 'family-plan', 'family-plus-plan'];
    const existingIds = plans.map(p => p.id);
    const missingPlans = requiredPlans.filter(id => !existingIds.includes(id));

    if (missingPlans.length > 0) {
      console.log('⚠️  Missing required plans:');
      missingPlans.forEach(id => console.log(`   - ${id}`));
      console.log('\n💡 Run: npm run prisma:seed\n');
    } else {
      console.log('✅ All required plans are present!\n');
    }

  } catch (error) {
    console.error('❌ Error checking plans:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. Database is running');
    console.error('   2. DATABASE_URL is correct in .env');
    console.error('   3. Prisma migrations are run: npm run prisma:migrate');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();
