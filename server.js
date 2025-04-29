const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

// 저장된 유저 목록
let users = [];

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 홈 접속
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// 더미 회원 데이터 (임시)
let members = [
  { id: 'test', password: '1234', nickname: '테스터' },
];

// 로그인
app.post('/login', (req, res) => {
  const { id, password } = req.body;
  const member = members.find(u => u.id === id && u.password === password);
  if (member) {
    res.json({ nickname: member.nickname });
  } else {
    res.status(400).send('아이디 또는 비밀번호가 틀렸습니다.');
  }
});

// 회원가입
app.post('/signup', (req, res) => {
  const { id, password, nickname } = req.body;
  if (members.some(u => u.id === id)) {
    res.status(400).send('이미 존재하는 아이디입니다.');
  } else {
    members.push({ id, password, nickname });
    res.send('회원가입 완료!');
  }
});

// 비밀번호 찾기
app.post('/recover', (req, res) => {
  const { id } = req.body;
  const member = members.find(u => u.id === id);
  if (member) {
    const tempPassword = Math.random().toString(36).substring(2, 8);
    member.password = tempPassword;
    res.json({ tempPassword });
  } else {
    res.status(400).send('존재하지 않는 아이디입니다.');
  }
});

// 비밀번호 변경
app.post('/change-password', (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  const member = members.find(u => u.id === id && u.password === oldPassword);
  if (member) {
    member.password = newPassword;
    res.send('비밀번호 변경 완료!');
  } else {
    res.status(400).send('아이디 또는 기존 비밀번호가 틀렸습니다.');
  }
});

// 소켓 연결
io.on('connection', (socket) => {
  console.log('사용자 접속:', socket.id);

  // 유저 접속 시
  socket.on('user connected', ({ id, nickname }) => {
    users.push({ id, nickname, socketId: socket.id });
    io.emit('update users', users);
  });

  // 채팅 메시지 수신
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });

  // 전체 공지
  socket.on('admin announce', (msg) => {
    io.emit('admin announce', msg);
  });

  // 배경 테마 변경
  socket.on('admin background change', (theme) => {
    io.emit('admin background change', theme);
  });

  // 접속 종료
  socket.on('disconnect', () => {
    console.log('사용자 퇴장:', socket.id);
    users = users.filter(u => u.socketId !== socket.id);
    io.emit('update users', users);
  });
});

// 서버 시작
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`서버 열림: http://localhost:${PORT}`);
});
