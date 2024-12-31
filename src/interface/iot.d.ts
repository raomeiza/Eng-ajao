export interface IOTReqPayload {
    batteryVoltage: number;
    temperature: number;
    humidity: number;
    soilMoisture: number;
    isCharging: boolean;
    time: string;
}

export interface IOTReqTokenPayload {
    totp: string;
    mac: string;
}

export interface IOTDevice {
    mac: string;
    name: string;
    owner: string;
    totpSecret: string;
    totp: string;
    token: string;
    lastSeen: Date;
    created: String;
}

export interface IRegisterPayload {
    mac: string;
}