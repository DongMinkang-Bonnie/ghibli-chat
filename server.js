const express = require('express');
const app = express();
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// 임시 메모리 기반 데이터베이스 (실제 서비스에서는 데이터베이스를 사용해야 함)
const users = {};         // { id: { password, nickname, profileImage } }
const bannedUsers = new Set();
const onlineUsers = {};   // { socket.id: { id, nickname } }
const rooms = {};         // { roomId: { name, isSecret, password, members: [userId], createdAt } }

// 미들웨어
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 기본 페이지 서빙
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 회원가입 API
app.post('/signup', (req, res) => {
  const { id, password, nickname } = req.body;
  if (users[id]) {
    return res.status(400).send('이미 존재하는 아이디입니다.');
  }
  users[id] = { password, nickname, profileImage: '' };
  res.send('회원가입 성공');
});

// 로그인 API
app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== password) return res.status(400).send('비밀번호가 틀렸습니다.');
  if (bannedUsers.has(id)) return res.status(403).send('접근 차단된 사용자입니다.');
  res.send({ nickname: user.nickname, profileImage: user.profileImage });
});

// 비밀번호 찾기 API (임시 비밀번호 발급)
app.post('/recover', (req, res) => {
  const { id } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  const tempPassword = Math.random().toString(36).slice(-8);
  user.password = tempPassword;
  res.send({ tempPassword });
});

// 비밀번호 변경 API
app.post('/change-password', (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== oldPassword) return res.status(400).send('기존 비밀번호가 틀렸습니다.');
  user.password = newPassword;
  res.send('비밀번호가 성공적으로 변경되었습니다!');
});

// 계정 삭제 API (추가 기능)
app.post('/delete-account', (req, res) => {
  const { id, password } = req.body;
  const user = users[id];
  if (!user) return res.status(400).send('존재하지 않는 아이디입니다.');
  if (user.password !== password) return res.status(400).send('비밀번호가 틀렸습니다.');
  delete users[id];
  res.send('계정이 삭제되었습니다.');
});

// (추가) 방 생성 API (공개/비밀)
app.post('/create-room', (req, res) => {
  const { roomId, name, isSecret, password, maxUsers } = req.body;
  if (rooms[roomId]) return res.status(400).send('이미 존재하는 방입니다.');
  // 일반 유저 최대 인원 8명, 관리자는 30명 (여기서는 간단히 숫자로 처리)
  rooms[roomId] = { name, isSecret, password: isSecret ? password : null, members: [], createdAt: Date.now(), maxUsers: maxUsers || 8 };
  res.send('방 생성 성공');
});

// (추가) 방 참여 API – 상세 구현은 생략(스텁)
app.post('/join-room', (req, res) => {
  const { roomId, id, password } = req.body;
  const room = rooms[roomId];
  if (!room) return res.status(400).send('방이 존재하지 않습니다.');
  if (room.isSecret && room.password !== password) return res.status(403).send('비밀번호가 틀렸습니다.');
  if (room.members.length >= room.maxUsers) return res.status(400).send('방 인원이 가득 찼습니다.');
  room.members.push(id);
  res.send('방 참여 성공');
});

// Socket.IO 실시간 통신
io.on('connection', (socket) => {
  console.log('새 연결:', socket.id);

  // 유저 접속 알림 (로그인 후 클라이언트에서 connectUser() 호출)
  socket.on('user connected', (userData) => {
    onlineUsers[socket.id] = userData; // { id, nickname }
    io.emit('update user list', Object.values(onlineUsers));
  });

  // 채팅 메시지 전달 (카톡 스타일)
  socket.on('chat message', (data) => {
    // data = { roomId (옵션), message, from }
    // 간단히 모든 클라이언트에게 메시지 브로드캐스트
    io.emit('chat message', data);
  });

  // 관리자 명령들
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

  // 개발자용 콘솔 로그 전송 (모든 이벤트 로그 보내기, 스텁)
  socket.on('log event', (log) => {
    console.log('로그 이벤트:', log);
  });

  socket.on('disconnect', () => {
    console.log('연결 종료:', socket.id);
    delete onlineUsers[socket.id];
    io.emit('update user list', Object.values(onlineUsers));
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});
