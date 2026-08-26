const Complaint = require('../Models/Complaint');
const Department = require('../Models/Department');

// Mappings for category calculations
const issueTypeToCategory = {
  "OPEN_MANHOLE": "Open Manholes",
  "BROKEN_STREET_LIGHT": "Broken/Faulty Street Lights",
  "GARBAGE_DUMP": "Garbage Dumps",
  "POTHOLE": "Potholes / Broken Roads"
};

/**
 * Retrieves aggregated statistics for display in the client dashboard.
 * - Citizens only see their own metrics.
 * - Staff/Admins see system-wide metrics.
 * GET /api/dashboard/summary
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'CITIZEN') {
      filter.userId = req.user._id;
    }

    // 1. Core Status Counts
    const total = await Complaint.countDocuments(filter);
    const pending = await Complaint.countDocuments({ ...filter, status: 'PENDING' });
    const inProgress = await Complaint.countDocuments({ ...filter, status: 'IN_PROGRESS' });
    const resolved = await Complaint.countDocuments({ ...filter, status: 'RESOLVED' });
    const rejected = await Complaint.countDocuments({ ...filter, status: 'REJECTED' });

    // 2. Issue Type (Category) Breakdown
    const issueTypeCounts = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$issueType', count: { $sum: 1 } } }
    ]);

    const byCategory = {
      "Open Manholes": 0,
      "Broken/Faulty Street Lights": 0,
      "Garbage Dumps": 0,
      "Potholes / Broken Roads": 0
    };

    issueTypeCounts.forEach(item => {
      const categoryName = issueTypeToCategory[item._id];
      if (categoryName) {
        byCategory[categoryName] = item.count;
      }
    });

    // 3. Priority Breakdown
    const priorityCounts = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const byPriority = {
      "HIGH": 0,
      "MEDIUM": 0,
      "LOW": 0,
      "UNASSIGNED": 0
    };

    priorityCounts.forEach(item => {
      const priorityName = item._id ? item._id.toUpperCase() : 'UNASSIGNED';
      byPriority[priorityName] = item.count;
    });

    // 4. Department Breakdown
    const deptCounts = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: '$departmentId', count: { $sum: 1 } } }
    ]);

    const byDepartment = {};
    
    // Resolve department object IDs to printable names
    for (const item of deptCounts) {
      if (item._id) {
        const dept = await Department.findById(item._id);
        const name = dept ? dept.name : 'Unknown Department';
        byDepartment[name] = (byDepartment[name] || 0) + item.count;
      } else {
        byDepartment['Unassigned'] = (byDepartment['Unassigned'] || 0) + item.count;
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        total,
        pending,
        inProgress,
        resolved,
        rejected,
        byCategory,
        byPriority,
        byDepartment
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
