const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const favicon = require('serve-favicon');

const port = 3000;

app.use(express.static('static'));

app.use(favicon(__dirname + '/static/favicon.ico'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

const users = {};

io.on('connection', (socket) => {
    socket.on('user joined', (name) => {
        users[socket.id] = name;
        socket.broadcast.emit('new user joined', name);
    });

    socket.on('chat message', (message) => {
        socket.broadcast.emit('new message', {name: users[socket.id], msg: message});
    });

    socket.on('send user list', (data) => {
        socket.emit('update user list', Object.values(users));
    });

    socket.on('start typing', (data) => {
        socket.broadcast.emit('user typing', {id: socket.id, name: users[socket.id]});
    });

    socket.on('stop typing', (data) => {
        socket.broadcast.emit('user stop typing', socket.id);
    });

    socket.on('disconnect', () => {
        socket.broadcast.emit('user left', users[socket.id]);
        delete users[socket.id];
    });
});

server.listen(port, () => {
    console.log(`Your app is listening at http://localhost:${port}`)
});