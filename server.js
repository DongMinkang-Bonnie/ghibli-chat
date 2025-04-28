const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
  console.log('새 사용자가 연결되었습니다.');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
    console.log('사용자가 나갔습니다.');
  });
});

const PORT = 3000;
http.listen(PORT, '0.0.0.0', () => {
  console.log(`서버가 포트 ${PORT}에서 모든 IP에 대해 실행 중입니다.`);
});

