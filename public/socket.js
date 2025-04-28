const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');
const onlineList = document.getElementById('online-users'); // 추가된 부분
let currentUserNickname = '';
let currentUserId = '';

// 로그인/회원가입 후 서버에 접속 정보 알림
function connectUser(nickname, id) {
  currentUserNickname = nickname;
  currentUserId = id;
  socket.emit('user connected', { nickname, id });
}

// 로컬 저장소에서 채팅 기록 불러오기
function loadMessages() {
  const saved = localStorage.getItem('chatMessages');
  if (saved) {
    messages.innerHTML = saved;
    messages.scrollTop = messages.scrollHeight;
  }
}

// 새로고침 시 메시지 불러오기
window.onload = loadMessages;

// 채팅 메시지 전송
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

// 서버로부터 채팅 메시지 수신
socket.on('chat message', function(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
  localStorage.setItem('chatMessages', messages.innerHTML);
});

// 서버로부터 전체 메시지 삭제 명령 수신
socket.on('admin delete all', () => {
  messages.innerHTML = '';
  localStorage.removeItem('chatMessages');
});

// 서버로부터 배경 변경 명령 수신
socket.on('admin background change', (theme) => {
  document.body.style.backgroundImage = `url(${theme})`;
});

// 서버로부터 전체 공지 수신
socket.on('admin announce', (announcement) => {
  alert(`📢 관리자 공지: ${announcement}`);
});

// 강퇴 당했을 때
socket.on('admin kick', () => {
  alert('⚠️ 강퇴당했습니다.');
  location.reload();
});

// 벤(Ban) 당했을 때
socket.on('admin ban', () => {
  alert('🚫 벤당했습니다. 더 이상 입장할 수 없습니다.');
  location.reload();
});

// 서버로부터 접속자 리스트 수신
socket.on('update user list', (users) => {
  if (onlineList) {
    onlineList.innerHTML = '<h4>접속자 목록</h4>';
    users.forEach(user => {
      const item = document.createElement('div');
      item.textContent = `👤 ${user.nickname}`;
      onlineList.appendChild(item);
    });
  }
});
