/**
 * Quick server test script
 * Run: node test-server.js
 */

const http = require('http');

const testHealth = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000/health', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Server is running!');
          console.log('Response:', JSON.parse(data));
          resolve(true);
        } else {
          console.log('❌ Server responded with status:', res.statusCode);
          reject(new Error(`Status: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running!');
        console.log('   Start the server with: npm run dev');
      } else {
        console.log('❌ Error:', err.message);
      }
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      console.log('❌ Request timeout - server might not be responding');
      reject(new Error('Timeout'));
    });
  });
};

// Run test
console.log('🔍 Testing server connection...\n');
testHealth()
  .then(() => {
    console.log('\n✅ All tests passed!');
    process.exit(0);
  })
  .catch((err) => {
    console.log('\n❌ Test failed:', err.message);
    process.exit(1);
  });

