const Joi = require("@hapi/joi");

const registerValidation = (data) => {
  const Schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().min(6).email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string(),
  });
  return Schema.validate(data);
};
const loginValidation = (data) => {
  const Schema = Joi.object({
    email: Joi.string().min(6).email().required(),
    password: Joi.string().min(6).required(),
  });
  return Schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
