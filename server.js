const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 메모리 회원 정보 저장
const users = {};
const bannedUsers = new Set();
const onlineUsers = {};

// 정적 파일 서비스
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 메인 페이지
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 회원가입
app.post('/signup', (req, res) => {
  const { id, password, nickname } = req.body;
  if (users[id]) {
    return res.status(400).send('이미 존재하는 아이디입니다.');
  }
  users[id] = { password, nickname };
  res.send('회원가입 성공');
});

// 비밀번호 변경
app.post('/change-password', (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== oldPassword) return res.status(400).send('기존 비밀번호가 틀렸습니다.');
  user.password = newPassword;
  res.send('비밀번호가 성공적으로 변경되었습니다!');
});

// 로그인
app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== password) return res.status(400).send('비밀번호가 틀렸습니다.');
  if (bannedUsers.has(id)) return res.status(403).send('접근 차단된 사용자입니다.');
  res.send({ nickname: user.nickname });
});

// 비밀번호 찾기 (임시 비밀번호 발급)
app.post('/recover', (req, res) => {
  const { id } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  const tempPassword = Math.random().toString(36).slice(-8);
  user.password = tempPassword;
  res.send({ tempPassword });
});

// 소켓 통신
io.on('connection', (socket) => {
  console.log('사용자 연결:', socket.id);

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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
