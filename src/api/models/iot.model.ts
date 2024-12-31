import mongoose, { Schema, Document } from "mongoose";
import { IOTDevice, IOTReqPayload, IOTReqTokenPayload } from "../../interface/iot";

const DeviceSchema = new Schema({
    mac: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    owner: { type: String, required: true },
    totpSecret: { type: String, required: true },
    token: { type: String, required: true },
    lastSeen: { type: Date, required: true },
    created: { type: Date, required: true }
});

const IOTDeviceModel = mongoose.model<IOTDevice & Document>("IOTDevice", DeviceSchema);

const IOTDataSchema = new Schema({
    batteryVoltage: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    soilMoisture: { type: Number, required: true },
    isCharging: { type: Boolean, required: true },
    time: { type: String, required: true }
});

const IOTDataModel = mongoose.model<IOTReqPayload & Document>("IOTData", IOTDataSchema);

export { IOTDeviceModel, IOTDataModel };