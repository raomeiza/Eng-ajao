import { IOTDeviceModel, IOTDataModel } from "../models/iot.model";
import { IOTDevice, IOTReqPayload, IOTReqTokenPayload, IRegisterPayload } from "../../interface/iot";
import { Post, Response, Body, Header, Example, Res, Route, Tags, TsoaResponse, Request, Get, Query, Security } from "tsoa";
import { IErrorResponse, sendError, sendSuccess } from "../../utils/response-handler";
import { iotValidation } from "../validations/iot.validation";
import { generateTOTP, verifyTOTP } from "../../utils/totp";
import mongoose from "mongoose";
import { Transform, pipeline } from 'stream';
import { Transform as Json2csvTransform } from 'json2csv';
import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

//@ts-ignore
import { decode as base32Decode } from 'thirty-two';

import { decodeToken, signToken, verifyToken } from "../../utils/tokenizer";
import { io } from "../../app";

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
      @Header('Authorization') token: string,
      @Header('x-package') xPackage: string,
      @Request() req: any
    ): Promise<any> {
      try {
        xPackage = xPackage || req.headers['x-package'];
        if (!xPackage) {
            throw { message: 'Unauthorized', status: 401 };
        }
        const decodedPackage = base32Decode(xPackage).toString('utf8')
        const { mac, totp } = JSON.parse(decodedPackage)
        token = token.split(' ')[1] || token || req.headers.authorization.split(' ')[1] || req.headers.authorization;
        if (!token) {
            throw { message: 'Unauthorized', status: 401 };
        }
        // totp = totp || req.headers['x-totp'];
        // if (!totp) {
        //     throw { message: 'Unauthorized', status: 401 };
        // }

        const {expired, ...decodedIOT} = await decodeToken(token)
        if(!decodedIOT || !decodedIOT.mac || decodedIOT.mac !== payload.mac || !decodedIOT.id || decodedIOT.mac !== mac) {
            throw { message: 'Unauthorized', status: 401 }
        }

        const validTOTP = await verifyTOTP(decodedIOT.totpSecret, totp)

        if(!validTOTP) {
            throw { message: 'Unauthorized', status: 401 }
        }

        iotValidation.token(payload) // validate the payload

        const device = await IOTDeviceModel.findById(decodedIOT.id)
        if(!device) {
            throw { message: 'Device not found', status: 404 }
        }
        if(device.mac !== mac) {
            throw { message: 'Unauthorized', status: 401 }
        }
        const lastSeen = new Date()
        const newToken = await signToken({ id: device.id, mac: device.mac, lastSeen }) // sign token
        await IOTDeviceModel.findByIdAndUpdate(device.id, { token: newToken, lastSeen }) // update the device
        return await sendSuccess({ token: newToken })
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
      @Header('x-package') xPackage?: string
    ): Promise<any> {
      try {
        token = token?.split(' ')[1] || token || req.headers.authorization.split(' ')[1] || req.headers.authorization;
        if (!token) {
            throw { message: 'Unauthorized', status: 401 };
        }
        xPackage = xPackage || req.headers['x-package'];
        if (!xPackage) {
            throw { message: 'Unauthorized', status: 401 };
        }
        const decodedPackage = base32Decode(xPackage).toString('utf8')
        const { mac, totp } = JSON.parse(decodedPackage)
        if(!mac || !totp) {
            throw { message: 'Unauthorized', status: 401 }
        }

        const decodedIOT = await verifyToken(token)
        if(!decodedIOT || !decodedIOT.mac || !decodedIOT.id || decodedIOT.mac !== mac) {
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
        io.emit('IOTData', payload) // emit the data
        // the time field was in utc format, have lost one hour in the process of converting it to local time in the iot so we need to add one hour to the time
        payload = payload.map(data => ({ ...data, time: new Date(new Date(data.time).getTime() + 3600000).toISOString() }))
        await IOTDataModel.insertMany(payload.map(data => ({ ...data}))) // insert the data
        return await sendResponse(200, 'IOT data received successfully', {"X-API-Key": newToken})
      } catch (err: any) {
        return sendError(sendResponse, err)
      }
    }

    // lets create a get route for downloading the iot data. This route will be protected
    // it will need a query parameter of type which is either csv or json
    // we will fetch the data from the database and return it in the format requested
    // the user must be an admin to access this route
    @Get('data')
    @Response(200, 'IOT data fetched successfully')
    @Response(400, 'Invalid query parameter')
    @Response(500, 'Internal server error')
    // @Security('jwt', ['admin'])
    public async getData(
      @Query() type: 'csv' | 'json',
      @Request() req: ExpressRequest,
      @Res() sendResponse: TsoaResponse<400 | 500 | 200, { message: string }>,
      @Header('Authorization') token: string
    ): Promise<void> {
      try {
        token = token.split(' ')[1] || token || req?.headers?.authorization?.split(' ')[1] || req.headers.authorization as string
        if (!token) {
            throw { message: 'Unauthorized', status: 401 };
        }
        if (!['csv', 'json'].includes(type)) {
          return sendResponse(400, { message: 'Invalid query parameter' });
        }
  
        const res = req.res as ExpressResponse;

        const decoded = await verifyToken(token)
        if(!decoded /*|| !decoded.isAdmin*/) {
            throw { message: 'Unauthorized', status: 401 }
        }
  
        const cursor = IOTDataModel.find().cursor();
        let fileName = 'iot_data' + new Date().toISOString();
        if (type === 'json') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}.json"`);
  
          res.write('[');
          let first = true;
          cursor.on('data', (doc) => {
            if (!first) {
              res.write(',');
            }
            res.write(JSON.stringify(doc));
            first = false;
          });
          cursor.on('end', () => {
            res.write(']');
            res.end();
          });
          cursor.on('error', (err) => {
            //@ts-ignore
            return sendResponse(500, { message: 'Internal server error', error: err.message });
          });
        } else if (type === 'csv') {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}.csv"`);
  
          // Write CSV header
          res.write('time,batteryVoltage,temperature,humidity,soilMoisture,isCharging\n');
  
          cursor.on('data', (doc) => {
            const csvRow = `${String(doc.time).replace(',', '')
            },${doc.batteryVoltage},${doc.temperature},${doc.humidity},${doc.soilMoisture},${doc.isCharging}\n`;
            res.write(csvRow);
          });
          cursor.on('end', () => {
            res.end();
          });
          cursor.on('error', (err) => {
            //@ts-ignore
            return sendResponse(500, { message: 'Internal server error', error: err.message });
          });
        }
        } catch (error) {
        //@ts-ignore
        return sendResponse(500, { message: 'Internal server error', error: error.message });
      }
    }
  }