import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import mongoose from 'mongoose';

const app = express();
const server = createServer(app);
const io = new Server(server);

mongoose.connect('mongodb://localhost/rocketsocket');

io.on('connection', (socket) => {
    console.log('Socket', socket.id);
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (_req, res) => {
    return res.json({
        message: 'Hello RocketSocket!'
    })
});

export { server, io };