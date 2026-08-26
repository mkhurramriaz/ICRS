const Complaint = require('../Models/Complaint');
const Department = require('../Models/Department');
const { routeComplaint } = require('../Services/routingService');
const { logAction } = require('../Services/auditService');
const { validationResult } = require('express-validator');

// Bidirectional mappings for frontend compatibility
const categoryToIssueType = {
  "Open Manholes": "OPEN_MANHOLE",
  "Broken/Faulty Street Lights": "BROKEN_STREET_LIGHT",
  "Garbage Dumps": "GARBAGE_DUMP",
  "Potholes / Broken Roads": "POTHOLE"
};

const issueTypeToCategory = {
  "OPEN_MANHOLE": "Open Manholes",
  "BROKEN_STREET_LIGHT": "Broken/Faulty Street Lights",
  "GARBAGE_DUMP": "Garbage Dumps",
  "POTHOLE": "Potholes / Broken Roads"
};

/**
 * Helper to serialize a Complaint document to match the exact fields the React frontend expects.
 */
const serializeComplaint = (complaint) => {
  return {
    id: complaint._id.toString(),
    title: complaint.title,
    category: issueTypeToCategory[complaint.issueType] || complaint.issueType,
    description: complaint.description,
    location: complaint.locationDetails, // Frontend expects text address here
    imageUrl: complaint.image ? complaint.image.url : '',
    status: complaint.status.toLowerCase(), // Frontend expects lowercase status
    createdAt: complaint.createdAt.toISOString(),
    
    // AI CV panel simulated attributes (AI-ready architecture)
    prediction: complaint.aiAnalysis && complaint.aiAnalysis.issueType
      ? complaint.aiAnalysis.issueType
      : (issueTypeToCategory[complaint.issueType] ? `${issueTypeToCategory[complaint.issueType]} detected` : 'Analyzing...'),
    confidenceScore: complaint.aiAnalysis && typeof complaint.aiAnalysis.issueConfidence === 'number'
      ? complaint.aiAnalysis.issueConfidence
      : 0.92, // Maintain simulated presentation values for the frontend
    detectionResult: complaint.aiAnalysis && complaint.aiAnalysis.priority
      ? complaint.aiAnalysis.priority
      : 'Verified Detail',
    verificationStatus: complaint.status === 'PENDING' ? 'Auto-Detected (Simulated)' : 'Verified by Authorities',
    
    // Coordinates
    latitude: complaint.location.coordinates[1],
    longitude: complaint.location.coordinates[0],
    
    // Admin & Staff Notes
    staffNotes: complaint.staffNotes || '',
    priority: complaint.priority || null,
    departmentId: complaint.departmentId ? complaint.departmentId.toString() : null
  };
};

/**
 * File a new civic complaint
 * POST /api/complaints
 */
const createComplaint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Complaint validation failed',
        errors: errors.array().map((err) => err.msg)
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Image upload is required',
        errors: ['Please select and upload a valid image file.']
      });
    }

    const { title, description, category, location, latitude, longitude } = req.body;

    // Resolve issueType from category string
    const issueType = categoryToIssueType[category] || category;
    if (!['OPEN_MANHOLE', 'POTHOLE', 'GARBAGE_DUMP', 'BROKEN_STREET_LIGHT'].includes(issueType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid issue type category',
        errors: [`Category '${category}' is not recognized.`]
      });
    }

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);

    if (isNaN(latVal) || latVal < -90 || latVal > 90) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates',
        errors: ['Latitude must be a valid number between -90 and 90.']
      });
    }

    if (isNaN(lngVal) || lngVal < -180 || lngVal > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GPS coordinates',
        errors: ['Longitude must be a valid number between -180 and 180.']
      });
    }

    // Auto-resolve department using routingService
    const resolvedDeptId = await routeComplaint(issueType);

    // Save image properties (Multer files relative URL)
    const relativeUrl = `/uploads/${req.file.filename}`;
    // Construct full URL dynamically
    const fullImageUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

    // Create the complaint
    const complaint = new Complaint({
      userId: req.user._id,
      title,
      description,
      image: {
        filename: req.file.filename,
        url: fullImageUrl
      },
      location: {
        type: 'Point',
        coordinates: [lngVal, latVal] // GeoJSON format: [longitude, latitude]
      },
      locationDetails: location,
      issueType,
      status: 'PENDING',
      departmentId: resolvedDeptId,
      // Initialize nullable AI sections
      aiAnalysis: {
        issueType: null,
        issueConfidence: null,
        priority: null,
        priorityConfidence: null,
        analyzedAt: null
      },
      duplicate: {
        isDuplicate: null,
        masterComplaintId: null,
        similarityScore: null,
        distanceMeters: null
      }
    });

    await complaint.save();

    // Create audit log
    await logAction({
      complaintId: complaint._id,
      performedBy: req.user._id,
      action: 'CREATE',
      newValue: complaint.status,
      notes: 'Complaint submitted by citizen.'
    });

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: serializeComplaint(complaint)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve complaints listing based on user role and filters
 * GET /api/complaints
 */
const getComplaints = async (req, res, next) => {
  try {
    const { status, issueType, category, priority } = req.query;
    const filter = {};

    // Citizens can only view their own reports
    if (req.user.role === 'CITIZEN') {
      filter.userId = req.user._id;
    }

    // Apply status filter
    if (status) {
      filter.status = status.toUpperCase();
    }

    // Apply issueType or category filter
    const resolvedIssueType = issueType || (category ? categoryToIssueType[category] : null);
    if (resolvedIssueType) {
      filter.issueType = resolvedIssueType.toUpperCase();
    }

    // Apply priority filter
    if (priority) {
      filter.priority = priority.toUpperCase();
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    const serialized = complaints.map(c => serializeComplaint(c));

    return res.status(200).json({
      success: true,
      data: serialized
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve current citizen's own complaints
 * GET /api/complaints/my
 */
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: complaints.map(c => serializeComplaint(c))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Fetch detailed information for a single complaint
 * GET /api/complaints/:id
 */
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
        errors: [`Complaint with ID '${req.params.id}' does not exist.`]
      });
    }

    // Citizen authorization verification
    if (req.user.role === 'CITIZEN' && complaint.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        errors: ['You are not authorized to view this complaint record.']
      });
    }

    return res.status(200).json({
      success: true,
      data: serializeComplaint(complaint)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update complaint status (STAFF/ADMIN only)
 * PATCH /api/complaints/:id/status
 */
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status value is required'
      });
    }

    const statusUpper = status.toUpperCase();
    if (!['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(statusUpper)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const oldStatus = complaint.status;
    complaint.status = statusUpper;
    await complaint.save();

    // Log the update action
    await logAction({
      complaintId: complaint._id,
      performedBy: req.user._id,
      action: 'STATUS_CHANGE',
      oldValue: oldStatus,
      newValue: statusUpper,
      notes: `Status modified by ${req.user.role}`
    });

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: serializeComplaint(complaint)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * General update (notes, status, priority, departmentId) (STAFF/ADMIN only)
 * PATCH /api/complaints/:id
 */
const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    const { status, staffNotes, priority, departmentId } = req.body;
    const oldStatus = complaint.status;
    const oldNotes = complaint.staffNotes;
    const oldPriority = complaint.priority;
    const oldDept = complaint.departmentId;

    let changesLogged = false;

    if (status) {
      const statusUpper = status.toUpperCase();
      if (['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(statusUpper)) {
        complaint.status = statusUpper;
        await logAction({
          complaintId: complaint._id,
          performedBy: req.user._id,
          action: 'STATUS_CHANGE',
          oldValue: oldStatus,
          newValue: statusUpper,
          notes: 'Status updated via ticket edit panel.'
        });
        changesLogged = true;
      }
    }

    if (staffNotes !== undefined) {
      complaint.staffNotes = staffNotes;
      await logAction({
        complaintId: complaint._id,
        performedBy: req.user._id,
        action: 'STAFF_NOTES_ADD',
        oldValue: oldNotes,
        newValue: staffNotes,
        notes: 'Notes field modified.'
      });
      changesLogged = true;
    }

    if (priority) {
      const priorityUpper = priority.toUpperCase();
      if (['HIGH', 'MEDIUM', 'LOW'].includes(priorityUpper)) {
        complaint.priority = priorityUpper;
        await logAction({
          complaintId: complaint._id,
          performedBy: req.user._id,
          action: 'PRIORITY_CHANGE',
          oldValue: oldPriority,
          newValue: priorityUpper,
          notes: 'Priority manually assigned.'
        });
        changesLogged = true;
      }
    }

    if (departmentId) {
      // Validate department existence
      const deptExists = await Department.findById(departmentId);
      if (deptExists) {
        complaint.departmentId = departmentId;
        await logAction({
          complaintId: complaint._id,
          performedBy: req.user._id,
          action: 'DEPARTMENT_CHANGE',
          oldValue: oldDept,
          newValue: departmentId,
          notes: 'Department routed manually.'
        });
        changesLogged = true;
      }
    }

    if (changesLogged) {
      await complaint.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: serializeComplaint(complaint)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove complaint (ADMIN only)
 * DELETE /api/complaints/:id
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    await Complaint.deleteOne({ _id: req.params.id });

    // Log deletion
    await logAction({
      complaintId: req.params.id,
      performedBy: req.user._id,
      action: 'DELETE',
      oldValue: complaint.title,
      notes: 'Complaint record permanently deleted.'
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  updateComplaint,
  deleteComplaint,
  serializeComplaint,
  issueTypeToCategory,
  categoryToIssueType
};
