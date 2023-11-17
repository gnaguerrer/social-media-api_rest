const jwt = require('jwt-simple');
const moment = require('moment');

const jwtUtils = require('../services/jwt');

const auth = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({
      error: true,
      message: 'User not authenticate',
      data: null
    });
  }

  const token = req.headers.authorization.replace(/['"]/g, '');
  try {
    const payload = jwt.decode(token, jwtUtils.secret);

    if (payload.exp <= moment().unix()) {
      return res.status(401).json({
        error: true,
        message: 'Expired token',
        data: null
      });
    }
    req.user = payload;
  } catch (error) {
    return res.status(401).json({
      error: true,
      message: 'Invalid token',
      data: null
    });
  }

  next();
};

module.exports = { auth };
