const Joi = require("joi");
const JoiPhoneNumber = require("joi-phone-number");
const CustomJoi = Joi.extend(JoiPhoneNumber);


const exposantSchema = CustomJoi.object({
    nom: Joi.string().required(),
    prenom: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().custom((value, helpers) => {
        // Si le numéro ne commence pas par "+", on préfixe avec "+33"
        if (!value.startsWith("+")) {
            value = "+33" + value;
        }
        // Valider le numéro avec joi-phone-number
        const {error} = CustomJoi.string().phoneNumber({
            defaultCountry: "FR",
            format: "international",
            strict: true
        }).validate(value);

        if (error) {
            return helpers.error("Téléphone invalide");
        }
        return value;  // Si tout est correct, retourner le numéro de téléphone validé
    }).required(),
    domain: Joi.string().required(),
});

const visiteurSchema = CustomJoi.object({
    name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().custom((value, helpers) => {
        // Si le numéro ne commence pas par "+", on préfixe avec "+33"
        if (!value.startsWith("+")) {
            value = "+33" + value;
        }
        // Valider le numéro avec joi-phone-number
        const {error} = CustomJoi.string().phoneNumber({
            defaultCountry: "FR",
            format: "international",
            strict: true
        }).validate(value);

        if (error) {
            return helpers.error("Téléphone invalide");
        }
        return value;  // Si tout est correct, retourner le numéro de téléphone validé
    }).required(),
    interest: Joi.string().required(),
    message: Joi.string(),
});

module.exports = {
    exposantSchema,
    visiteurSchema
};