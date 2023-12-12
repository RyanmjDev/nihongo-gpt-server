const jwt = require('jsonwebtoken');

function generateToken(user) {
    const payload = {
      userId: user._id,
      email: user.email,
    };
  
    const options = {
      expiresIn: '1d', // Set the expiration time for the token
    };
  
    const secretKey = process.env.JWT_SECRET; // Replace with your own secret key
  
    return jwt.sign(payload, secretKey, options);
  }

  module.exports = generateToken;