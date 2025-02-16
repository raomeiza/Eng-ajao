import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import InitiateMongoServer from '../config/db';
import { RegisterRoutes } from './routes/routes';
import express from "express";
import basicAuth from 'express-basic-auth';
const swaggerDocument = require('../../docs/swagger.json');
//import './telegram/telegram';
import expressError from '../utils/express.error';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import path from 'path';

// Instance of express
const app: express.Application = express();

//cors middleware
app.use(cors({
  credentials: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', preflightContinue: false, origin: '*',
}));

//app.use(xhub({ algorithm: 'sha1', secret: FACEBOOK_APP_SECRET || (()=> {throw new Error('FACEBOOK_APP_SECRET is not defined') })() }));
// Initiate Database Connection
InitiateMongoServer();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json({
  verify: (req, res, buf) => {
    //@ts-ignore
    req.rawBody = buf.toString();
  }
},
));

// app.use('/iot', (req, res, next) => {
//   console.log('IOT request', req.body);
//   console.log('IOt request headers', req.headers);
//   res.status(200).send('IOT request received');
// })

// set end point for ping and respond with pong
app.get('/ping', (req, res) => {
  res.send('pong');
}
);

// public folder
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

app.use(cors({
  credentials: true, methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', preflightContinue: false, origin: '*',
}));

RegisterRoutes(app)

// create and start the swagger server
app.use('/api-docs', basicAuth({
  users: { 'admin': 'admin' },
  challenge: true,
  realm: 'Imb4T3st4pp',
}), swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// @ts-ignore
app.use((err: any, req: express.Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>, res: express.Response<any, Record<string, any>>, next: express.NextFunction) => expressError(err, req, res, next));
// Routers


// for every uncaught error, log the error and send a 500 error
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err)
})

export default app;