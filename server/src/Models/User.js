const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: ['CITIZEN', 'STAFF', 'ADMIN'],
      default: 'CITIZEN'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
    }
  },
  {
    timestamps: true
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Customize toJSON output to hide sensitive fields
userSchema.methods.toSafeJSON = function () {
  const userObject = this.toObject();
  delete userObject.passwordHash;
  delete userObject.__v;
  return userObject;
};

// Set toJSON options to hide passwordHash if accessed directly
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.passwordHash;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
