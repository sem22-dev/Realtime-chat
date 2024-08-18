
import express from 'express';
import { join } from 'node:path';
import { Server } from 'socket.io'

const app = express();

const server = app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});

const io = new Server(server, {
  connectionStateRecovery: {}
});

app.get('/', (req, res) => {
  res.sendFile(join(process.cwd(), 'index.html'));
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

