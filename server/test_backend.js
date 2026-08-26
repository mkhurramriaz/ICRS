const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const app = require('./src/server');
const User = require('./src/Models/User');
const Complaint = require('./src/Models/Complaint');
const Department = require('./src/Models/Department');
const AuditLog = require('./src/Models/AuditLog');

const PORT = 5001; // Run tests on separate port
let server;
const BASE_URL = `http://localhost:${PORT}/api`;

const testState = {
  citizenToken: null,
  staffToken: null,
  complaintId: null,
  citizenId: null,
  staffId: null
};

async function setup() {
  return new Promise((resolve) => {
    server = app.listen(PORT, async () => {
      console.log(`Test server listening on port ${PORT}`);
      // Wait for Mongoose to connect
      if (mongoose.connection.readyState !== 1) {
        await new Promise((res) => mongoose.connection.once('open', res));
      }
      resolve();
    });
  });
}

async function teardown() {
  console.log('\nCleaning up test data from MongoDB...');
  try {
    if (testState.citizenId) {
      await User.deleteOne({ _id: testState.citizenId });
    }
    if (testState.staffId) {
      await User.deleteOne({ _id: testState.staffId });
    }
    if (testState.complaintId) {
      await Complaint.deleteOne({ _id: testState.complaintId });
      await AuditLog.deleteMany({ complaintId: testState.complaintId });
    }
    console.log('Test data cleaned up successfully.');
  } catch (error) {
    console.error('Error during teardown cleanup:', error);
  }

  return new Promise((resolve) => {
    server.close(() => {
      mongoose.disconnect().then(() => {
        console.log('Server closed and database disconnected.');
        resolve();
      });
    });
  });
}

// Assert helper
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTests() {
  console.log('Starting Integration Tests...\n');

  // Test 1: Health Check
  const healthRes = await fetch(`${BASE_URL}/health`);
  const healthData = await healthRes.json();
  assert(healthRes.status === 200, 'Health check returns status 200');
  assert(healthData.success === true, 'Health check response is success');

  // Test 2: Registration
  const citizenEmail = `citizen.test.${Date.now()}@example.com`;
  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Citizen Tester',
      email: citizenEmail,
      password: 'password123'
    })
  });
  const registerData = await registerRes.json();
  assert(registerRes.status === 201, 'Registration returns status 201');
  assert(registerData.success === true, 'Registration reports success');
  assert(registerData.token !== undefined, 'Registration returns a token');
  assert(registerData.user.role === 'citizen', 'Registration defaults user to citizen role');
  
  testState.citizenToken = registerData.token;
  
  // Find citizen ID directly in database
  const citizenUser = await User.findOne({ email: citizenEmail });
  testState.citizenId = citizenUser._id;

  // Test 3: Duplicate Registration
  const dupRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Tester',
      email: citizenEmail,
      password: 'password123'
    })
  });
  const dupData = await dupRes.json();
  assert(dupRes.status === 400, 'Duplicate registration returns status 400');
  assert(dupData.success === false, 'Duplicate registration reports failure');

  // Test 4: Correct Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: citizenEmail,
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  assert(loginRes.status === 200, 'Login with correct credentials returns 200');
  assert(loginData.success === true, 'Login reports success');

  // Test 5: Incorrect Login
  const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: citizenEmail,
      password: 'wrongpassword'
    })
  });
  assert(badLoginRes.status === 401, 'Login with incorrect password returns 401');

  // Test 6: Auth /me retrieval
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, 'Retrieving me profile returns status 200');
  assert(meData.data.email === citizenEmail, 'Returned profile email matches registered user');

  // Test 7: Auth /me with invalid token
  const badMeRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer bad-token-here` }
  });
  assert(badMeRes.status === 401, 'Retrieving profile with invalid token returns status 401');

  // Test 8: Create Complaint with Multipart upload & GPS Coordinates
  const formData = new FormData();
  formData.append('title', 'Dangerous Pothole on Sector Road');
  formData.append('description', 'A deep pothole is causing hazardous driving conditions.');
  formData.append('category', 'Potholes / Broken Roads');
  formData.append('location', 'Sector I-8/2, near the post office');
  formData.append('latitude', '33.6687');
  formData.append('longitude', '73.0764');
  
  // Attach a dummy file for image
  const dummyFile = new Blob(['test image content'], { type: 'image/jpeg' });
  formData.append('image', dummyFile, 'pothole.jpg');

  const createRes = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` },
    body: formData
  });
  
  const createData = await createRes.json();
  assert(createRes.status === 201, 'Complaint creation returns status 201');
  assert(createData.success === true, 'Complaint creation reports success');
  assert(createData.data.status === 'pending', 'Created complaint has PENDING status');
  assert(createData.data.imageUrl.includes('/uploads/complaint-'), 'Image URL matches uploads structure');
  assert(createData.data.latitude === 33.6687 && createData.data.longitude === 73.0764, 'Latitude and longitude match values sent');

  testState.complaintId = createData.data.id;

  // Verify coordinates directly in MongoDB (GeoJSON: [longitude, latitude])
  const dbComplaint = await Complaint.findById(testState.complaintId);
  assert(dbComplaint !== null, 'Complaint exists in database');
  assert(dbComplaint.location.coordinates[0] === 73.0764, 'Coordinates index 0 is longitude');
  assert(dbComplaint.location.coordinates[1] === 33.6687, 'Coordinates index 1 is latitude');
  assert(dbComplaint.location.type === 'Point', 'Location GeoJSON type is Point');

  // Test 9: Get complaints feed (Citizen gets their own)
  const getFeedRes = await fetch(`${BASE_URL}/complaints`, {
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` }
  });
  const getFeedData = await getFeedRes.json();
  assert(getFeedRes.status === 200, 'Complaints feed returns status 200');
  assert(getFeedData.data.length > 0, 'Feed contains the newly filed complaint');
  assert(getFeedData.data[0].id === testState.complaintId, 'Complaints item matches created id');

  // Create Staff User for testing status change authority
  const staffEmail = `staff.test.${Date.now()}@example.com`;
  const staffRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Staff Member',
      email: staffEmail,
      password: 'password123'
    })
  });
  const staffData = await staffRes.json();
  // Manually update role in DB since public register always sets CITIZEN
  await User.updateOne({ email: staffEmail }, { role: 'STAFF' });
  
  // Re-login as STAFF to get correct JWT role claims
  const staffLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: staffEmail,
      password: 'password123'
    })
  });
  const staffLoginData = await staffLoginRes.json();
  testState.staffToken = staffLoginData.token;
  testState.staffId = (await User.findOne({ email: staffEmail }))._id;

  // Test 10: Update status as STAFF (authorized)
  const updateRes = await fetch(`${BASE_URL}/complaints/${testState.complaintId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${testState.staffToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'in_progress' })
  });
  const updateData = await updateRes.json();
  assert(updateRes.status === 200, 'Staff status update returns status 200');
  assert(updateData.data.status === 'in_progress', 'Complaint status successfully updated to in_progress');

  // Verify Audit Log was generated
  const auditLogs = await AuditLog.find({ complaintId: testState.complaintId });
  assert(auditLogs.length > 1, 'Audit log entries generated for create and status update');
  assert(auditLogs.some(log => log.action === 'STATUS_CHANGE'), 'Audit log records the STATUS_CHANGE action');

  // Test 11: Citizen attempts to update status (unauthorized)
  const unauthorizedRes = await fetch(`${BASE_URL}/complaints/${testState.complaintId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${testState.citizenToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'resolved' })
  });
  assert(unauthorizedRes.status === 403, 'Citizen updating status returns status 403 (Forbidden)');

  // Test 12: Dashboard Summary API
  const dashboardRes = await fetch(`${BASE_URL}/dashboard/summary`, {
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` }
  });
  const dashboardData = await dashboardRes.json();
  assert(dashboardRes.status === 200, 'Dashboard summary returns status 200');
  assert(dashboardData.data.total === 1, 'Citizen dashboard summary reports exactly 1 complaint');
  assert(dashboardData.data.inProgress === 1, 'Citizen dashboard summary reports 1 complaint in progress');
}

async function main() {
  try {
    await setup();
    await runTests();
    console.log('\n⭐⭐ ALL INTEGRATION TESTS PASSED ⭐⭐');
  } catch (error) {
    console.error('\n❌ INTEGRATION TESTS FAILED:', error.message);
  } finally {
    await teardown();
  }
}

main();
