import app from "../api";
import http from "http";
import IO, { Socket } from "socket.io";
import { IOTDataModel } from "../api/models/iot.model";

const server = http.createServer(app);
const io = new IO.Server(server);

io.on('connection', (socket: Socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('get-data', async (data: { limit: number, offset: number }) => {
        let dataFOund = await IOTDataModel.find().limit(data.limit).skip(data.offset);
        socket.emit('data', dataFOund);
    });

    socket.on('get-data-by-date', async (data: { limit: number, offset: number, date: string }) => {
        let dataFOund = await IOTDataModel.find({ time: data.date }).limit(data.limit).skip(data.offset);
        socket.emit('data', dataFOund);
    });
});

export default io;
