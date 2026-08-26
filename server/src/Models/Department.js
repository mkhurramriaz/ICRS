const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    issueTypes: [
      {
        type: String,
        enum: ['OPEN_MANHOLE', 'POTHOLE', 'GARBAGE_DUMP', 'BROKEN_STREET_LIGHT'],
        required: true
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
