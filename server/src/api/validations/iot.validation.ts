import Joi from "joi"

export const iotValidation = {
    register: (payload: any) => {
        const schema = Joi.object({
            mac: Joi.string().pattern(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/).message('Invalid MAC address, should be in the format xx:xx:xx:xx:xx:xx').required()
        });
        const { error } = schema.validate(payload);
        if (error) {
            throw { message: error.message, status: 400 }
        }
    },
    data: (payload: any) => {
        const schema = Joi.array().items(Joi.object({
            batteryVoltage: Joi.number().required(),
            temperature: Joi.number().required(),
            humidity: Joi.number().required(),
            soilMoisture: Joi.number().required(),
            isCharging: Joi.boolean().required(),
            time: Joi.string().required()
        }));
        const { error } = schema.validate(payload);
        if (error) {
            throw { message: error.message, status: 400 }
        }
    },
    token: (payload: any) => {
        const schema = Joi.object({
            mac: Joi.string().required()
        });
        const { error } = schema.validate(payload);
        if (error) {
            throw { message: error.message, status: 400 }
        }
    }
}