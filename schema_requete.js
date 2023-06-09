const Joi = require('joi');

const exposantSchema = Joi.object({
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    domain: Joi.string().required(),
});

const visiteurSchema = Joi.object({
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[0-9]{10}$/).required(),
    interest: Joi.string().required(),
});

module.exports = {
    exposantSchema,
    visiteurSchema
};