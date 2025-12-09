const Joi = require('joi');

const register = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8).pattern(/^(?=.*[A-Za-z])(?=.*\d)/),
    name: Joi.string().required().min(2).max(50),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    refreshToken: Joi.string().optional(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().optional(),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().min(8).pattern(/^(?=.*[A-Za-z])(?=.*\d)/),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(8).pattern(/^(?=.*[A-Za-z])(?=.*\d)/),
  }),
};

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword,
};
