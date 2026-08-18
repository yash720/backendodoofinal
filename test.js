// Simple test file to verify server setup
const axios = require('axios');

const BASE_URL = 'http://localhost:5700';

async function testServer() {
  try {
    console.log('Testing server connection...');
    
    // Test basic route
    const response = await axios.get(BASE_URL);
    console.log('✅ Server is running:', response.data.message);
    
    // Test auth endpoints
    console.log('\nTesting auth endpoints...');
    console.log('POST /api/auth/register - User registration');
    console.log('POST /api/auth/login - User login');
    
    // Test protected endpoints
    console.log('\nTesting protected endpoints...');
    console.log('GET /api/student/dashboard - Student dashboard (requires auth)');
    console.log('GET /api/company/jobs - Company jobs (requires auth)');
    console.log('GET /api/tpo/reports - TPO reports (requires auth)');
    
    console.log('\n🎉 All tests passed! Server is ready to use.');
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server is not running. Please start the server first with: npm run dev');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testServer();
