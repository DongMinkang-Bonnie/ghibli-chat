const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 메모리 DB
const users = {};        // { id: { password, nickname, profileImage } }
const bannedUsers = new Set();
const onlineUsers = {};  // { socket.id: { id, nickname, profileImage } }
const rooms = {};        // { roomId: { name, isSecret, password, members: [], createdAt, maxUsers } }

// 미들웨어
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 라우팅
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 회원가입
app.post('/signup', (req, res) => {
  const { id, password, nickname } = req.body;
  if (users[id]) return res.status(400).send('이미 존재하는 아이디입니다.');
  users[id] = { password, nickname, profileImage: '' };
  res.send('회원가입 성공');
});

// 로그인
app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== password) return res.status(400).send('비밀번호가 틀렸습니다.');
  if (bannedUsers.has(id)) return res.status(403).send('접근 차단된 사용자입니다.');
  res.send({ nickname: user.nickname, profileImage: user.profileImage });
});

// 비밀번호 찾기
app.post('/recover', (req, res) => {
  const { id } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  const tempPassword = Math.random().toString(36).slice(-8);
  user.password = tempPassword;
  res.send({ tempPassword });
});

// 비밀번호 변경
app.post('/change-password', (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== oldPassword) return res.status(400).send('기존 비밀번호가 틀렸습니다.');
  user.password = newPassword;
  res.send('비밀번호 변경 완료');
});

// 계정 삭제
app.post('/delete-account', (req, res) => {
  const { id, password } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== password) return res.status(400).send('비밀번호가 틀렸습니다.');
  delete users[id];
  res.send('계정이 삭제되었습니다.');
});

// 방 생성
app.post('/create-room', (req, res) => {
  const { roomId, name, isSecret, password, maxUsers } = req.body;
  if (rooms[roomId]) return res.status(400).send('이미 존재하는 방입니다.');
  rooms[roomId] = {
    name,
    isSecret,
    password: isSecret ? password : null,
    members: [],
    createdAt: Date.now(),
    maxUsers: maxUsers || 8
  };
  res.send('방 생성 완료');
});

// 방 입장
app.post('/join-room', (req, res) => {
  const { roomId, id, password } = req.body;
  const room = rooms[roomId];
  if (!room) return res.status(400).send('방이 존재하지 않습니다.');
  if (room.isSecret && room.password !== password) return res.status(403).send('비밀번호가 틀렸습니다.');
  if (room.members.length >= room.maxUsers) return res.status(400).send('방 인원이 가득 찼습니다.');
  room.members.push(id);
  res.send('방 입장 성공');
});

// Socket.IO
io.on('connection', (socket) => {
  console.log('새 연결:', socket.id);

  socket.on('user connected', (userData) => {
    onlineUsers[socket.id] = userData; // { id, nickname, profileImage }
    io.emit('update user list', Object.values(onlineUsers));
  });

  socket.on('chat message', (data) => {
    io.emit('chat message', data); // { roomId, from, id, text, time, profileImage }
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
    console.log('연결 종료:', socket.id);
    delete onlineUsers[socket.id];
    io.emit('update user list', Object.values(onlineUsers));
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🌳 서버 실행중: http://localhost:${PORT}`);
});
