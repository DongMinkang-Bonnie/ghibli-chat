const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

const users = {}; // { id: { password, nickname, profileImage } }
const onlineUsers = {}; // { socket.id: { nickname, id } }
const bannedUsers = new Set();

app.use(express.static('public'));
app.use(bodyParser.json());

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// 회원가입
app.post('/signup', (req, res) => {
  const { id, password, nickname } = req.body;
  if (users[id]) {
    return res.status(400).send('이미 존재하는 아이디입니다.');
  }
  users[id] = { password, nickname, profileImage: '' };
  res.send('회원가입 성공');
});

// 로그인
app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== password) return res.status(400).send('비밀번호가 틀렸습니다.');
  if (bannedUsers.has(id)) return res.status(403).send('접근이 차단된 사용자입니다.');
  res.send({ nickname: user.nickname, profileImage: user.profileImage });
});

// socket.io
io.on('connection', (socket) => {
  console.log('새 연결:', socket.id);

  socket.on('user connected', (nicknameAndId) => {
    onlineUsers[socket.id] = nicknameAndId;
    io.emit('update user list', Object.values(onlineUsers));
  });

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });

  socket.on('admin delete all', () => {
    io.emit('admin delete all');
  });

  socket.on('admin background change', (theme) => {
    io.emit('admin background change', theme);
  });

  socket.on('admin announce', (announcement) => {
    io.emit('admin announce', announcement);
  });

  socket.on('admin kick', (socketId) => {
    io.to(socketId).emit('admin kick');
  });

  socket.on('admin ban', (userId) => {
    bannedUsers.add(userId);
    io.emit('admin update ban', userId);
  });

  socket.on('disconnect', () => {
    console.log('연결 끊김:', socket.id);
    delete onlineUsers[socket.id];
    io.emit('update user list', Object.values(onlineUsers));
  });
});

http.listen(PORT, () => {
  console.log(`서버가 실행 중입니다: http://localhost:${PORT}`);
});
