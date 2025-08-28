/**
 * JWT utility functions
 * Token generation and verification utilities following FANG standards
 */

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const config = require('../config');

/**
 * Generate access token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    issuer: 'mern-backend',
    audience: 'mern-frontend'
  });
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'mern-backend',
    audience: 'mern-frontend'
  });
};

/**
 * Verify access token
 */
const verifyAccessToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, config.jwt.secret);
    return { success: true, payload: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (token) => {
  try {
    const decoded = await promisify(jwt.verify)(token, config.jwt.refreshSecret);
    return { success: true, payload: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Decode token without verification
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Get token expiration time
 */
const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  if (decoded && decoded.exp) {
    return new Date(decoded.exp * 1000);
  }
  return null;
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return expiration <= new Date();
};

/**
 * Get time until token expires (in seconds)
 */
const getTimeUntilExpiration = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 0;
  return Math.max(0, Math.floor((expiration - new Date()) / 1000));
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  getTimeUntilExpiration
};
