const Department = require('../Models/Department');

/**
 * Deterministic mapping of civic issue types to stable department codes:
 * 1. OPEN_MANHOLE -> MANHOLE_DRAINAGE (Manhole & Drainage Department)
 * 2. GARBAGE_DUMP -> SOLID_WASTE (Solid Waste Management Department)
 * 3. BROKEN_STREET_LIGHT -> STREET_LIGHTING (Street Lighting Department)
 * 4. POTHOLE -> ROADS_INFRASTRUCTURE (Roads & Infrastructure Department)
 */
const ISSUE_TYPE_TO_DEPT_CODE = {
  OPEN_MANHOLE: 'MANHOLE_DRAINAGE',
  GARBAGE_DUMP: 'SOLID_WASTE',
  BROKEN_STREET_LIGHT: 'STREET_LIGHTING',
  POTHOLE: 'ROADS_INFRASTRUCTURE'
};

/**
 * Service to resolve the correct department document ID based on complaint issue type.
 * 
 * @param {string} issueType - The type of civic issue
 * @returns {Promise<mongoose.Types.ObjectId|null>} - The resolved Department ID or null
 */
const routeComplaint = async (issueType) => {
  try {
    const deptCode = ISSUE_TYPE_TO_DEPT_CODE[issueType];
    if (!deptCode) {
      return null;
    }

    const department = await Department.findOne({ code: deptCode, isActive: true });
    return department ? department._id : null;
  } catch (error) {
    console.error('Error routing complaint to department:', error);
    return null;
  }
};

module.exports = { routeComplaint, ISSUE_TYPE_TO_DEPT_CODE };
