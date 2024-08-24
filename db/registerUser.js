const bcrypt = require('bcrypt');
const User = require('./userModel');

const registerUser = async (email, password, displayName) => {
  try {
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return { status: 'failed', message: 'Email is already in use', index: 0 };
    }

    const existingUserByDisplayName = await User.findOne({ displayName });
    if (existingUserByDisplayName) {
      return {
        status: 'failed',
        message: 'Display name is already in use',
        index: 2,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      displayName,
      twofa: {
        status: 'verified',
        type: 'false',
      },
      totalxp: 0,
      wins: 0,
      played: 0,
      privateAccount: true,
    });

    await user.save();
    return { status: 'success', message: 'User registered successfully', index: 1 };
  } catch (error) {
    return { status: 'failed', message: 'Error registering user', index: 2 };
  }
};

module.exports = registerUser;
