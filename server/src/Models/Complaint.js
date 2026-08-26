const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    image: {
      filename: {
        type: String,
        required: [true, 'Image filename is required']
      },
      url: {
        type: String,
        required: [true, 'Image URL is required']
      }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        validate: {
          validator: function (val) {
            if (val.length !== 2) return false;
            const [lng, lat] = val;
            return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
          },
          message: 'Coordinates must be valid: longitude between -180 and 180, and latitude between -90 and 90.'
        }
      }
    },
    locationDetails: {
      type: String,
      required: [true, 'Location details/address are required'],
      trim: true
    },
    issueType: {
      type: String,
      enum: ['OPEN_MANHOLE', 'POTHOLE', 'GARBAGE_DUMP', 'BROKEN_STREET_LIGHT'],
      required: [true, 'Issue type is required']
    },
    priority: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW', null],
      default: null
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
      default: 'PENDING'
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    staffNotes: {
      type: String,
      default: ''
    },
    aiAnalysis: {
      issueType: { type: String, default: null },
      issueConfidence: { type: Number, default: null },
      priority: { type: String, default: null },
      priorityConfidence: { type: Number, default: null },
      analyzedAt: { type: Date, default: null }
    },
    duplicate: {
      isDuplicate: { type: Boolean, default: null },
      masterComplaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
      similarityScore: { type: Number, default: null },
      distanceMeters: { type: Number, default: null }
    }
  },
  {
    timestamps: true
  }
);

// Create 2dsphere index for location queries
complaintSchema.index({ location: '2dsphere' });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
