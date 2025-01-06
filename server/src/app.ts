import { createServer } from 'http';
import app from './api'; // index.ts
import { PORT, BASE_URL } from './config';
import { Server, Socket } from 'socket.io';
import { IOTDataModel } from './api/models/iot.model';

// Spin server
const server = createServer(app);

// Initialize Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket: Socket) => {
  console.log('a user connected');
  // fetch the last 10 data and send it to the client
  IOTDataModel.find().limit(10).select('-_id -__v').sort({ time: -1 }).exec()
  .then(data => {
    socket.emit('IOTData', data);
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('get-data', async (data: { limit: number, offset: number }) => {
    let dataFound = await IOTDataModel.find().limit(data.limit).skip(data.offset);
    socket.emit('data', dataFound);
  });

  socket.on('get-data-by-date', async (data: { limit: number, offset: number, date: string }) => {
    let dataFound = await IOTDataModel.find({ time: data.date }).limit(data.limit).skip(data.offset);
    socket.emit('data', dataFound);
  });
});

server.listen(PORT, () => console.info(`Server listening on ${BASE_URL}`));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err)
  console.log('Shutting down the server due to Uncaught Exception');
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: any) => {
  console.error('There was an unhandled rejection', err)
  console.log('Shutting down the server due to Unhandled Promise rejection');
  server.close(() => process.exit(1));
});

export default server;
export { io };