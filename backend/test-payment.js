/**
 * Payment Gateway Test Script
 * 
 * This script helps test the payment gateway integration.
 * 
 * Usage:
 *   1. Make sure backend server is running: npm run dev
 *   2. Run this script: node test-payment.js
 * 
 * Prerequisites:
 *   - Backend server running on http://localhost:3000
 *   - Database seeded with payment plans
 *   - Thawani test credentials in .env
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'parent@jisr.com';
const TEST_PASSWORD = 'Parent123!';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    const req = protocol.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = responseData ? JSON.parse(responseData) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testHealth() {
  log('\n🔍 Step 1: Testing server health...', 'cyan');
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET',
    });

    if (response.statusCode === 200) {
      log('✅ Server is running!', 'green');
      return true;
    } else {
      log(`❌ Server responded with status: ${response.statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log('❌ Server is not running!', 'red');
      log('   Start the server with: cd backend && npm run dev', 'yellow');
    } else {
      log(`❌ Error: ${error.message}`, 'red');
    }
    return false;
  }
}

async function testLogin() {
  log('\n🔍 Step 2: Testing login...', 'cyan');
  try {
    const response = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
      }
    );

    if (response.statusCode === 200 && response.data.data?.accessToken) {
      log('✅ Login successful!', 'green');
      log(`   Access Token: ${response.data.data.accessToken.substring(0, 20)}...`, 'blue');
      return response.data.data.accessToken;
    } else {
      log(`❌ Login failed: ${response.data.message || 'Unknown error'}`, 'red');
      if (response.data.message?.includes('not found') || response.data.message?.includes('Invalid')) {
        log('   💡 Make sure database is seeded: npm run prisma:seed', 'yellow');
      }
      return null;
    }
  } catch (error) {
    log(`❌ Error during login: ${error.message}`, 'red');
    return null;
  }
}

async function testCreatePaymentSession(accessToken) {
  log('\n🔍 Step 3: Testing payment session creation...', 'cyan');
  try {
    const response = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/payments/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
      {
        planId: 'family-plan',
      }
    );

    if (response.statusCode === 200 && response.data.data?.sessionUrl) {
      log('✅ Payment session created successfully!', 'green');
      log(`   Order ID: ${response.data.data.orderId}`, 'blue');
      log(`   Session ID: ${response.data.data.sessionId}`, 'blue');
      log(`   Amount: ${response.data.data.amount} ${response.data.data.currency}`, 'blue');
      log(`   Session URL: ${response.data.data.sessionUrl}`, 'blue');
      log('\n   📝 Next steps:', 'yellow');
      log('   1. Open the Session URL in your browser', 'yellow');
      log('   2. Complete the payment on Thawani checkout', 'yellow');
      log('   3. After payment, run: node test-payment.js verify <session_id>', 'yellow');
      return response.data.data;
    } else {
      log(`❌ Payment session creation failed: ${response.data.message || 'Unknown error'}`, 'red');
      if (response.data.message?.includes('plan not found')) {
        log('   💡 Make sure database is seeded: npm run prisma:seed', 'yellow');
      } else if (response.data.message?.includes('Thawani') || response.data.message?.includes('API')) {
        log('   💡 Check your Thawani credentials in .env file', 'yellow');
        log('   💡 Verify THAWANI_API_KEY and THAWANI_SECRET_KEY are set', 'yellow');
      }
      return null;
    }
  } catch (error) {
    log(`❌ Error creating payment session: ${error.message}`, 'red');
    return null;
  }
}

async function testVerifyPayment(accessToken, sessionId) {
  log('\n🔍 Step 4: Testing payment verification...', 'cyan');
  try {
    const response = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/payments/verify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
      {
        sessionId: sessionId,
      }
    );

    if (response.statusCode === 200) {
      if (response.data.data?.success) {
        log('✅ Payment verified successfully!', 'green');
        log(`   Payment Status: ${response.data.data.payment?.status}`, 'blue');
        log(`   Order Status: ${response.data.data.order?.status}`, 'blue');
        log(`   Amount: ${response.data.data.payment?.amount} ${response.data.data.payment?.currency}`, 'blue');
      } else {
        log('⚠️  Payment verification returned:', 'yellow');
        log(`   Status: ${response.data.data.status || 'unknown'}`, 'yellow');
        log(`   Message: ${response.data.data.message || 'No message'}`, 'yellow');
        log('\n   💡 This might mean:', 'yellow');
        log('   - Payment is still pending', 'yellow');
        log('   - Payment was not completed on Thawani', 'yellow');
        log('   - Payment failed or was cancelled', 'yellow');
      }
      return response.data.data;
    } else {
      log(`❌ Payment verification failed: ${response.data.message || 'Unknown error'}`, 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Error verifying payment: ${error.message}`, 'red');
    return null;
  }
}

async function testCreatePaymentWithDiscount(accessToken) {
  log('\n🔍 Step 5: Testing payment with discount code...', 'cyan');
  try {
    const response = await makeRequest(
      {
        hostname: 'localhost',
        port: 3000,
        path: '/api/payments/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
      {
        planId: 'family-plan',
        discountCode: 'WELCOME20',
      }
    );

    if (response.statusCode === 200 && response.data.data?.sessionUrl) {
      log('✅ Payment session with discount created!', 'green');
      log(`   Original Price: 15.00 OMR`, 'blue');
      log(`   Discount: 20%`, 'blue');
      log(`   Final Amount: ${response.data.data.amount} OMR`, 'blue');
      return true;
    } else {
      log(`❌ Payment with discount failed: ${response.data.message || 'Unknown error'}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

// Main test function
async function runTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Payment Gateway Testing Script                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  // Check command line arguments
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'verify' && args[1]) {
    // Verify payment mode
    log('\n🔐 Verification Mode', 'cyan');
    const sessionId = args[1];
    const accessToken = await testLogin();
    if (accessToken) {
      await testVerifyPayment(accessToken, sessionId);
    }
    return;
  }

  // Full test mode
  const healthOk = await testHealth();
  if (!healthOk) {
    log('\n❌ Cannot proceed - server is not running', 'red');
    process.exit(1);
  }

  const accessToken = await testLogin();
  if (!accessToken) {
    log('\n❌ Cannot proceed - login failed', 'red');
    process.exit(1);
  }

  const paymentSession = await testCreatePaymentSession(accessToken);
  if (paymentSession) {
    log('\n✅ Payment session created!', 'green');
    log('\n📋 Summary:', 'cyan');
    log(`   Session URL: ${paymentSession.sessionUrl}`, 'blue');
    log(`   Session ID: ${paymentSession.sessionId}`, 'blue');
    log(`   Order ID: ${paymentSession.orderId}`, 'blue');
    log(`   Amount: ${paymentSession.amount} ${paymentSession.currency}`, 'blue');
  }

  // Test discount code
  await testCreatePaymentWithDiscount(accessToken);

  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║     Testing Complete                                  ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  log('\n📝 Next Steps:', 'yellow');
  log('   1. Open the Session URL in your browser', 'yellow');
  log('   2. Complete payment on Thawani checkout page', 'yellow');
  log('   3. After payment, verify with:', 'yellow');
  log(`      node test-payment.js verify ${paymentSession?.sessionId || '<session_id>'}`, 'yellow');
  log('\n');
}

// Run tests
runTests().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
