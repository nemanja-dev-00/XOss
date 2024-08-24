const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: false,
  },
  twofa: {
    status: {
      type: String,
      required: false,
      default: 'verified',
    },
    type: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  totalxp: {
    type: Number,
    required: true,
    default: 0,
  },
  wins: {
    type: Number,
    required: true,
    default: 0,
  },
  played: {
    type: Number,
    required: true,
    default: 0,
  },
  privateAccount: {
    type: Boolean,
    required: true,
    default: true,
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
