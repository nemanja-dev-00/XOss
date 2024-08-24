const mongoose = require('mongoose');
const User = require('./userModel');

const updateUserAuthByEmail = async (email, two_fa_new) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        twofa: {
          type: two_fa_new,
          status: 'verified',
        },
      },
      { new: false }
    ).exec();
    return { status: 'success', message: 'Auth type updated', index: 0 };
  } catch (e) {
    return { status: 'failed', message: 'Error while updating auth type' };
  }
};

module.exports = updateUserAuthByEmail;
