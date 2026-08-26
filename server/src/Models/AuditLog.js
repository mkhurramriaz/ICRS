const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    trim: true
  },
  oldValue: {
    type: String,
    default: null
  },
  newValue: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
