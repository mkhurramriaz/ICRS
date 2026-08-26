const Department = require('../Models/Department');

/**
 * Service to resolve the correct department based on complaint issue type.
 * Routes:
 * - OPEN_MANHOLE -> SEWERAGE_MUNICIPAL
 * - POTHOLE -> ROAD_MAINTENANCE
 * - GARBAGE_DUMP -> WASTE_MANAGEMENT
 * - BROKEN_STREET_LIGHT -> STREET_LIGHTING
 * 
 * @param {string} issueType - The type of civic issue
 * @returns {Promise<mongoose.Types.ObjectId|null>} - The resolved Department ID or null
 */
const routeComplaint = async (issueType) => {
  try {
    const department = await Department.findOne({ issueTypes: issueType, isActive: true });
    return department ? department._id : null;
  } catch (error) {
    console.error('Error routing complaint to department:', error);
    return null;
  }
};

module.exports = { routeComplaint };
