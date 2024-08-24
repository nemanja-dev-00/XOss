const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '2m';

const signToken = (email, password) => {
  return (token = jwt.sign({ email, password }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  }));
};

module.exports = signToken;
