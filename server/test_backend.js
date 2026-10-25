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
  complaintIds: [],
  createdUserIds: []
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
    if (testState.createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: testState.createdUserIds } });
    }
    const idsToDelete = testState.complaintIds || (testState.complaintId ? [testState.complaintId] : []);
    if (idsToDelete.length > 0) {
      await Complaint.deleteMany({ _id: { $in: idsToDelete } });
      await AuditLog.deleteMany({ complaintId: { $in: idsToDelete } });
    }
    // Delete any temporary inactive test department
    await Department.deleteMany({ code: 'TEMP_INACTIVE_TEST' });
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

  // Test 2: Department Listing API
  console.log('\nTesting Department Endpoints...');
  const deptListRes = await fetch(`${BASE_URL}/departments`);
  const deptListData = await deptListRes.json();
  assert(deptListRes.status === 200, 'GET /api/departments returns status 200');
  assert(deptListData.success === true, 'GET /api/departments response is success');
  assert(Array.isArray(deptListData.data), 'GET /api/departments returns an array of departments');
  assert(deptListData.data.length >= 4, 'GET /api/departments returns all active departments');
  
  const sampleDept = deptListData.data[0];
  assert(sampleDept._id && sampleDept.name && sampleDept.code, 'Department items contain _id, name, and code');

  // Get Road & Infrastructure department for staff test
  const roadsDept = await Department.findOne({ code: 'ROADS_INFRASTRUCTURE' });
  assert(roadsDept !== null, 'Roads & Infrastructure department exists in database');

  // ==========================================
  // Comprehensive Registration & Auth Testing
  // ==========================================
  console.log('\nTesting Role & Department Registration Scenarios...');

  // Scenario 1: CITIZEN registration succeeds
  const citizenEmail = `citizen.test.${Date.now()}@example.com`;
  const regCitizenRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Citizen Tester',
      email: citizenEmail,
      password: 'password123',
      role: 'CITIZEN'
    })
  });
  const regCitizenData = await regCitizenRes.json();
  assert(regCitizenRes.status === 201, 'CITIZEN registration succeeds with 201');
  assert(regCitizenData.success === true, 'CITIZEN registration reports success');
  assert(regCitizenData.token !== undefined, 'CITIZEN registration returns token');
  assert(regCitizenData.user.role === 'citizen', 'CITIZEN registration role mapped properly');
  // Scenario 9: Registered CITIZEN has no departmentId
  assert(regCitizenData.user.departmentId === null, 'Registered CITIZEN response has null departmentId');
  
  const citizenDb = await User.findOne({ email: citizenEmail });
  assert(citizenDb !== null, 'Citizen user saved in DB');
  assert(citizenDb.role === 'CITIZEN', 'Citizen user DB role is CITIZEN');
  assert(citizenDb.departmentId === null || citizenDb.departmentId === undefined, 'Citizen user DB departmentId is null/undefined');
  testState.createdUserIds.push(citizenDb._id);
  testState.citizenToken = regCitizenData.token;

  // Scenario 2: STAFF registration succeeds with valid department
  const staffEmail = `staff.test.${Date.now()}@example.com`;
  const regStaffRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Staff Tester',
      email: staffEmail,
      password: 'password123',
      role: 'STAFF',
      departmentId: roadsDept._id.toString()
    })
  });
  const regStaffData = await regStaffRes.json();
  assert(regStaffRes.status === 201, 'STAFF registration succeeds with valid department (201)');
  assert(regStaffData.success === true, 'STAFF registration reports success');
  assert(regStaffData.user.role === 'staff', 'STAFF registration returns role staff');
  // Scenario 8: Registered STAFF receives correct departmentId
  assert(regStaffData.user.departmentId === roadsDept._id.toString(), 'STAFF registration returns correct departmentId');
  
  const staffDb = await User.findOne({ email: staffEmail });
  assert(staffDb !== null, 'Staff user saved in DB');
  assert(staffDb.role === 'STAFF', 'Staff user DB role is STAFF');
  assert(staffDb.departmentId.toString() === roadsDept._id.toString(), 'Staff user DB departmentId matches assigned department');
  testState.createdUserIds.push(staffDb._id);
  testState.staffToken = regStaffData.token;

  // Scenario 3: STAFF registration fails without departmentId
  const regStaffNoDeptRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'NoDept Staff',
      email: `nodept.staff.${Date.now()}@example.com`,
      password: 'password123',
      role: 'STAFF'
    })
  });
  const regStaffNoDeptData = await regStaffNoDeptRes.json();
  assert(regStaffNoDeptRes.status === 400, 'STAFF registration without departmentId fails with 400');
  assert(regStaffNoDeptData.success === false, 'STAFF registration without departmentId reports failure');

  // Scenario 4: STAFF registration fails with invalid departmentId
  const regStaffBadDeptRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'BadDept Staff',
      email: `baddept.staff.${Date.now()}@example.com`,
      password: 'password123',
      role: 'STAFF',
      departmentId: 'invalid-object-id-123'
    })
  });
  const regStaffBadDeptData = await regStaffBadDeptRes.json();
  assert(regStaffBadDeptRes.status === 400, 'STAFF registration with malformed departmentId fails with 400');
  assert(regStaffBadDeptData.success === false, 'STAFF registration with malformed departmentId reports failure');

  const nonExistentId = new mongoose.Types.ObjectId().toString();
  const regStaffNonExistentDeptRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'NonExistentDept Staff',
      email: `nonexist.staff.${Date.now()}@example.com`,
      password: 'password123',
      role: 'STAFF',
      departmentId: nonExistentId
    })
  });
  assert(regStaffNonExistentDeptRes.status === 400, 'STAFF registration with non-existent departmentId fails with 400');

  // Scenario 5: STAFF registration fails with inactive department
  const inactiveDept = new Department({
    name: 'Inactive Test Department',
    code: 'TEMP_INACTIVE_TEST',
    issueTypes: ['OPEN_MANHOLE'],
    isActive: false
  });
  await inactiveDept.save();

  const regStaffInactiveDeptRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'InactiveDept Staff',
      email: `inactive.staff.${Date.now()}@example.com`,
      password: 'password123',
      role: 'STAFF',
      departmentId: inactiveDept._id.toString()
    })
  });
  const regStaffInactiveDeptData = await regStaffInactiveDeptRes.json();
  assert(regStaffInactiveDeptRes.status === 400, 'STAFF registration with inactive department fails with 400');
  assert(regStaffInactiveDeptData.success === false, 'STAFF registration with inactive department reports failure');

  // Scenario 6 & 10: ADMIN registration succeeds without departmentId
  const adminEmail = `admin.test.${Date.now()}@example.com`;
  const regAdminRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Admin Tester',
      email: adminEmail,
      password: 'password123',
      role: 'ADMIN',
      departmentId: roadsDept._id.toString() // Even if passed, should be sanitized to null
    })
  });
  const regAdminData = await regAdminRes.json();
  assert(regAdminRes.status === 201, 'ADMIN registration succeeds with 201');
  assert(regAdminData.success === true, 'ADMIN registration reports success');
  assert(regAdminData.user.role === 'admin', 'ADMIN registration returns role admin');
  assert(regAdminData.user.departmentId === null, 'Registered ADMIN response has null departmentId');

  const adminDb = await User.findOne({ email: adminEmail });
  assert(adminDb !== null, 'Admin user saved in DB');
  assert(adminDb.role === 'ADMIN', 'Admin user DB role is ADMIN');
  assert(adminDb.departmentId === null || adminDb.departmentId === undefined, 'Admin user DB departmentId is null/undefined');
  testState.createdUserIds.push(adminDb._id);

  // Scenario 7: Invalid role is rejected
  const regBadRoleRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Hacker User',
      email: `hacker.${Date.now()}@example.com`,
      password: 'password123',
      role: 'SUPERADMIN'
    })
  });
  const regBadRoleData = await regBadRoleRes.json();
  assert(regBadRoleRes.status === 400, 'Invalid role (SUPERADMIN) rejected with 400');
  assert(regBadRoleData.success === false, 'Invalid role reports failure');

  // ==========================================
  // Login & Profile Authentication Verification
  // ==========================================
  console.log('\nTesting Login and Token Verification...');

  // Duplicate Registration
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

  // Correct Login
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

  // Incorrect Login
  const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: citizenEmail,
      password: 'wrongpassword'
    })
  });
  assert(badLoginRes.status === 401, 'Login with incorrect password returns 401');

  // Auth /me retrieval
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` }
  });
  const meData = await meRes.json();
  assert(meRes.status === 200, 'Retrieving me profile returns status 200');
  assert(meData.data.email === citizenEmail, 'Returned profile email matches registered user');

  // Auth /me with invalid token
  const badMeRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer bad-token-here` }
  });
  assert(badMeRes.status === 401, 'Retrieving profile with invalid token returns status 401');

  // ==========================================
  // Complaint Creation & GPS & Status Tests
  // ==========================================
  console.log('\nTesting Complaint Flow & Staff Operations...');

  const formData = new FormData();
  formData.append('title', 'Dangerous Pothole on Sector Road');
  formData.append('description', 'A deep pothole is causing hazardous driving conditions.');
  formData.append('category', 'Potholes / Broken Roads');
  formData.append('location', 'Sector I-8/2, near the post office');
  formData.append('latitude', '33.6687');
  formData.append('longitude', '73.0764');
  
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
  testState.complaintIds.push(createData.data.id);

  // Invalid GPS Coordinates rejected with 400
  const badFormData = new FormData();
  badFormData.append('title', 'Bad Coordinates Test');
  badFormData.append('description', 'Coordinates out of bounds.');
  badFormData.append('category', 'Potholes / Broken Roads');
  badFormData.append('location', 'Test location');
  badFormData.append('latitude', '120.0'); // Invalid latitude (> 90)
  badFormData.append('longitude', '73.0764');
  badFormData.append('image', new Blob(['test image'], { type: 'image/jpeg' }), 'test.jpg');

  const badCoordRes = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` },
    body: badFormData
  });
  const badCoordData = await badCoordRes.json();
  assert(badCoordRes.status === 400, 'Invalid coordinate rejection returns status 400');
  assert(badCoordData.success === false, 'Invalid coordinate request reports failure');

  // Verify coordinates and department routing directly in MongoDB
  const dbComplaint = await Complaint.findById(testState.complaintId);
  assert(dbComplaint !== null, 'Complaint exists in database');
  assert(dbComplaint.location.coordinates[0] === 73.0764, 'Coordinates index 0 is longitude');
  assert(dbComplaint.location.coordinates[1] === 33.6687, 'Coordinates index 1 is latitude');
  assert(dbComplaint.location.type === 'Point', 'Location GeoJSON type is Point');
  assert(dbComplaint.departmentId.toString() === roadsDept._id.toString(), 'Complaint assigned to Roads & Infrastructure department');

  // Verify all 4 required departments exist in database
  const expectedCodes = ['MANHOLE_DRAINAGE', 'SOLID_WASTE', 'STREET_LIGHTING', 'ROADS_INFRASTRUCTURE'];
  for (const code of expectedCodes) {
    const dept = await Department.findOne({ code });
    assert(dept !== null, `Department with code ${code} exists in database`);
  }

  // Get complaints feed (Citizen gets their own)
  const getFeedRes = await fetch(`${BASE_URL}/complaints`, {
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` }
  });
  const getFeedData = await getFeedRes.json();
  assert(getFeedRes.status === 200, 'Complaints feed returns status 200');
  assert(getFeedData.data.length > 0, 'Feed contains the newly filed complaint');
  assert(getFeedData.data[0].id === testState.complaintId, 'Complaints item matches created id');

  // Update status as STAFF (authorized)
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

  // Citizen attempts to update status (unauthorized)
  const unauthorizedRes = await fetch(`${BASE_URL}/complaints/${testState.complaintId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${testState.citizenToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status: 'resolved' })
  });
  assert(unauthorizedRes.status === 403, 'Citizen updating status returns status 403 (Forbidden)');

  // ==========================================
  // Duplicate Complaint Detection Suite
  // ==========================================
  console.log('\nTesting Duplicate Complaint Detection...');

  // 1: Same issue type + nearby location (~15 meters away) -> Duplicate
  const nearbyPotholeForm = new FormData();
  nearbyPotholeForm.append('title', 'Duplicate Pothole 15m away');
  nearbyPotholeForm.append('description', 'Another citizen reports the same pothole nearby.');
  nearbyPotholeForm.append('category', 'Potholes / Broken Roads');
  nearbyPotholeForm.append('location', 'Sector I-8/2, near the corner shop');
  nearbyPotholeForm.append('latitude', '33.6688'); // ~15m from 33.6687
  nearbyPotholeForm.append('longitude', '73.0765'); // ~10m from 73.0764
  nearbyPotholeForm.append('image', new Blob(['nearby pothole image'], { type: 'image/jpeg' }), 'nearby.jpg');

  const dupRes1 = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` },
    body: nearbyPotholeForm
  });
  const dupData1 = await dupRes1.json();
  assert(dupRes1.status === 201, 'Duplicate complaint is preserved and saved (status 201)');
  assert(dupData1.isDuplicate === true, 'Nearby complaint with same issue type flagged as duplicate');
  assert(dupData1.data.isDuplicate === true, 'Serialized response reports isDuplicate true');
  assert(dupData1.data.masterComplaintId === testState.complaintId, 'Duplicate links to the original master complaint');
  assert(dupData1.data.distanceMeters <= 100, 'Reported distance is within 100m radius');
  assert(dupData1.data.departmentId.toString() === roadsDept._id.toString(), 'Duplicate complaint still receives correct department');

  if (dupData1.data.id) {
    testState.complaintIds.push(dupData1.data.id);
  }

  // 2: Different issue type + same location -> NOT a duplicate
  const diffTypeForm = new FormData();
  diffTypeForm.append('title', 'Garbage Dump at same road');
  diffTypeForm.append('description', 'Trash pile on the roadside.');
  diffTypeForm.append('category', 'Garbage Dumps');
  diffTypeForm.append('location', 'Sector I-8/2, same location');
  diffTypeForm.append('latitude', '33.6687'); // exact same coordinates
  diffTypeForm.append('longitude', '73.0764');
  diffTypeForm.append('image', new Blob(['garbage image'], { type: 'image/jpeg' }), 'garbage.jpg');

  const diffTypeRes = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` },
    body: diffTypeForm
  });
  const diffTypeData = await diffTypeRes.json();
  assert(diffTypeRes.status === 201, 'Different issue type created with status 201');
  assert(diffTypeData.isDuplicate === false, 'Different issue type at same location is NOT flagged as duplicate');
  
  const wasteDept = await Department.findOne({ code: 'SOLID_WASTE' });
  assert(diffTypeData.data.departmentId.toString() === wasteDept._id.toString(), 'Garbage dump routed to Solid Waste department');

  if (diffTypeData.data.id) {
    testState.complaintIds.push(diffTypeData.data.id);
  }

  // 3: Same issue type + far-away location (~5km away) -> NOT a duplicate
  const farPotholeForm = new FormData();
  farPotholeForm.append('title', 'Far away Pothole in Sector F-10');
  farPotholeForm.append('description', 'Pothole in another sector.');
  farPotholeForm.append('category', 'Potholes / Broken Roads');
  farPotholeForm.append('location', 'Sector F-10/4');
  farPotholeForm.append('latitude', '33.7000'); // ~5km away
  farPotholeForm.append('longitude', '73.0100');
  farPotholeForm.append('image', new Blob(['far pothole image'], { type: 'image/jpeg' }), 'far.jpg');

  const farRes = await fetch(`${BASE_URL}/complaints`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${testState.citizenToken}` },
    body: farPotholeForm
  });
  const farData = await farRes.json();
  assert(farRes.status === 201, 'Far away complaint created with status 201');
  assert(farData.isDuplicate === false, 'Same issue type outside radius is NOT a duplicate');

  if (farData.data.id) {
    testState.complaintIds.push(farData.data.id);
  }

  // 4: Verify master complaint is intact and unchanged
  const masterCheck = await Complaint.findById(testState.complaintId);
  assert(masterCheck !== null, 'Master complaint remains in database');
  assert(masterCheck.duplicate.isDuplicate === false, 'Original master complaint duplicate flag is false');
  assert(masterCheck.status === 'IN_PROGRESS', 'Original master complaint status remained unchanged');
}

async function main() {
  try {
    await setup();
    await runTests();
    console.log('\n⭐⭐ ALL INTEGRATION TESTS PASSED ⭐⭐');
  } catch (error) {
    console.error('\n❌ INTEGRATION TESTS FAILED:', error.message);
    process.exitCode = 1;
  } finally {
    await teardown();
  }
}

main();
