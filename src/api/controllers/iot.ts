import { IOTDeviceModel, IOTDataModel } from "../models/iot.model";
import { IOTDevice, IOTReqPayload, IOTReqTokenPayload, IRegisterPayload } from "../../interface/iot";
import { Post, Response, Body, Header, Example, Res, Route, Tags, TsoaResponse, Request } from "tsoa";
import { IErrorResponse, sendError, sendSuccess } from "../../utils/response-handler";
import { iotValidation } from "../validations/iot.validation";
import { generateTOTP, verifyTOTP } from "../../utils/totp";
import mongoose from "mongoose";
import { signToken, verifyToken } from "../../utils/tokenizer";

@Route('iot')
@Tags('IOT')
export class IOTController {
    @Example<IRegisterPayload>({
        mac: '00:00:00:00:00:00'
    })
    @Post('register')
    @Response(200, 'IOT device registered successfully')
    public async register(
      @Res() sendResponse: TsoaResponse<400 | 500 | 401, IErrorResponse>,
      @Body() payload: { mac: string },
      @Request() req: any,
      @Header('Authorization') user?: any
    ): Promise<any> {
      try {
        if(!user) {
            user = req.headers.authorization.split(' ')[1] || req.headers.authorization
        }
        if(!user) {
            throw { message: 'Unauthorized', status: 401 }
        }
        console.log('user', user)
        const decodedUser = await verifyToken(user)
        if(!decodedUser || !decodedUser.userId || !decodedUser.isAdmin) {
            throw { message: 'Unauthorized', status: 401 }
        }

        iotValidation.register(payload) // validate the payload
        const totpSecrets = await generateTOTP(payload.mac) // generate TOTP secret
        const id = new mongoose.Types.ObjectId()
        const tokent = await signToken({ id, mac: payload.mac, lastSeen: new Date() }) // sign token
        const device = await IOTDeviceModel.create({ _id: id, mac: payload.mac, name: payload.mac, owner: decodedUser.userId, totpSecret: totpSecrets.base32, token: tokent, lastSeen: new Date(), created: new Date() }) // create the device
        return await sendSuccess({ message: 'IOT device registered successfully', device })
      } catch (err: any) {
        return sendError(sendResponse, err)
      }
    }

    @Example<IOTReqTokenPayload>({
        totp: '123456',
        mac: '00:00:00:00:00:00'
    })
    @Post('new-token')
    @Response(200, 'New token generated successfully')
    public async newToken(
      @Res() sendResponse: TsoaResponse<400 | 500 | 401, IErrorResponse>,
      @Body() payload: { mac: string }, 
      @Header('Authorization') token: string
    ): Promise<any> {
      try {
        const decodedIOT = await verifyToken(token)
        if(!decodedIOT || !decodedIOT.mac || decodedIOT.mac !== payload.mac || !decodedIOT.id) {
            throw { message: 'Unauthorized', status: 401 }
        }
        iotValidation.token(payload) // validate the payload

        const device = await IOTDeviceModel.findById(decodedIOT.id)
        if(!device) {
            throw { message: 'Device not found', status: 404 }
        }
        if(device.mac !== payload.mac) {
            throw { message: 'Unauthorized', status: 401 }
        }
        const lastSeen = new Date()
        const newToken = await signToken({ id: device.id, mac: device.mac, lastSeen }) // sign token
        await IOTDeviceModel.findByIdAndUpdate(device.id, { token: newToken, lastSeen }) // update the device
        return await sendSuccess({ message: 'New token generated successfully', token: newToken })
      } catch (err: any) {
        return sendError(sendResponse, err)
      }
    }

    @Example<IOTReqPayload>({
        batteryVoltage: 3.7,
        temperature: 25,
        humidity: 50,
        soilMoisture: 30,
        isCharging: false,
        time: new Date().toISOString()
    })
    @Post('data')
    @Response(200, 'IOT data received successfully')
    public async data(
      @Res() sendResponse: TsoaResponse<200 | 400 | 500 | 401, string>,
      @Body() payload: IOTReqPayload[],
      @Example<IOTReqPayload[]>([{
        batteryVoltage: 3.7,
        temperature: 25,
        humidity: 50,
        soilMoisture: 30,
        isCharging: false,
        time: new Date().toISOString()
    }])
      @Request() req: any,
      @Header('Authorization') token?: string,
      @Header('x-forwarded-for') ip?: string,
      @Header('X-TOTP') totp?: string,
    ): Promise<any> {
      try {
        token = token?.split(' ')[1] || token || req.headers.authorization.split(' ')[1] || req.headers.authorization;
        if (!token) {
            throw { message: 'Unauthorized', status: 401 };
        }
        if (!totp) {
            totp = req.headers['X-TOTP'];
        }
        if (!totp) {
            throw { message: 'Unauthorized', status: 401 };
        }

        const decodedIOT = await verifyToken(token)
        if(!decodedIOT || !decodedIOT.mac || !decodedIOT.id) {
            throw { message: 'Unauthorized', status: 401 }
        }
        const device = await IOTDeviceModel.findById(decodedIOT.id)
        if(!device) {
            throw { message: 'Device not found', status: 404 }
        }
        const totpVerified = await verifyTOTP(device.totpSecret, totp) // verify the TOTP
        if(!totpVerified) {
            throw { message: 'Unauthorized', status: 401 }
        }
        device.lastSeen = new Date()
        let newToken = await signToken({ id: device.id, mac: device.mac, lastSeen: device.lastSeen }) // sign token
        device.token = newToken
        await device.save() // update the device
        iotValidation.data(payload) // validate the payload
        await IOTDataModel.insertMany(payload.map(data => ({ ...data}))) // insert the data
        return await sendResponse(200, 'IOT data received successfully', {"X-API-Key": newToken})
      } catch (err: any) {
        return sendError(sendResponse, err)
      }
    }
  }