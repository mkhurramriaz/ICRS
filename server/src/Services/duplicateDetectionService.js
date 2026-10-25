const Complaint = require('../Models/Complaint');

const DEFAULT_DUPLICATE_RADIUS_METERS = parseInt(process.env.DUPLICATE_RADIUS_METERS, 10) || 100;

/**
 * Calculates the great-circle distance between two GeoJSON points [longitude, latitude] in meters
 * using the Haversine formula.
 * 
 * @param {[number, number]} coord1 - [longitude, latitude]
 * @param {[number, number]} coord2 - [longitude, latitude]
 * @returns {number} Distance in meters rounded to nearest integer
 */
const calculateDistanceMeters = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const R = 6371000; // Earth's mean radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

/**
 * Detects whether a similar complaint of the same issue type exists within the geographic radius.
 * 
 * @param {Object} params
 * @param {string} params.issueType - The civic issue category code
 * @param {[number, number]} params.coordinates - [longitude, latitude]
 * @param {string|mongoose.Types.ObjectId} [params.excludeId] - Optional ID to exclude (e.g. self)
 * @param {number} [params.radiusMeters] - Search radius in meters (default: 100m)
 * @returns {Promise<{ isDuplicate: boolean, masterComplaintId: mongoose.Types.ObjectId|null, distanceMeters: number|null }>}
 */
const detectDuplicate = async ({
  issueType,
  coordinates,
  excludeId = null,
  radiusMeters = DEFAULT_DUPLICATE_RADIUS_METERS
}) => {
  try {
    if (!issueType || !coordinates || coordinates.length !== 2) {
      return { isDuplicate: false, masterComplaintId: null, distanceMeters: null };
    }

    const [lng, lat] = coordinates;

    const query = {
      issueType,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radiusMeters
        }
      }
    };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    // Find closest existing complaint of the same issue type within radius
    const existingMatch = await Complaint.findOne(query);

    if (!existingMatch) {
      return {
        isDuplicate: false,
        masterComplaintId: null,
        distanceMeters: null
      };
    }

    // Calculate exact distance
    const distanceMeters = calculateDistanceMeters(
      coordinates,
      existingMatch.location.coordinates
    );

    return {
      isDuplicate: true,
      masterComplaintId: existingMatch._id,
      distanceMeters
    };
  } catch (error) {
    console.error('Error during duplicate detection query:', error);
    // On unexpected database geospatial query error, fail safely without blocking complaint creation
    return {
      isDuplicate: false,
      masterComplaintId: null,
      distanceMeters: null
    };
  }
};

module.exports = {
  detectDuplicate,
  calculateDistanceMeters,
  DEFAULT_DUPLICATE_RADIUS_METERS
};
