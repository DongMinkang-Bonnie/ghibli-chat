const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');
const userList = document.getElementById('user-list-content');

let currentUserNickname = '';
let currentUserId = '';

// 로그인 성공 시 서버에 유저 정보 보내기
function connectUser(nickname, id) {
  currentUserNickname = nickname;
  currentUserId = id;
  socket.emit('user connected', { nickname, id });
}

// 새로고침시 로컬 저장된 채팅 불러오기
function loadMessages() {
  const saved = localStorage.getItem('chatMessages');
  if (saved) {
    messages.innerHTML = saved;
    messages.scrollTop = messages.scrollHeight;
  }
}

window.onload = loadMessages;

// 채팅 메시지 전송
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    socket.emit('chat message', input.value);
    input.value = '';
  }
});

// 서버로부터 채팅 수신
socket.on('chat message', function(msg) {
  const item = document.createElement('li');
  item.textContent = msg;
  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
  localStorage.setItem('chatMessages', messages.innerHTML);
});

// 전체 삭제 명령 수신
socket.on('admin delete all', () => {
  messages.innerHTML = '';
  localStorage.removeItem('chatMessages');
});

// 배경 테마 변경 명령 수신
socket.on('admin background change', (theme) => {
  if (theme === 'spring') {
    document.body.style.backgroundImage = "url('https://cdn.pixabay.com/photo/2020/04/10/11/36/cherry-blossom-5024676_960_720.jpg')";
  } else if (theme === 'summer') {
    document.body.style.backgroundImage = "url('https://cdn.pixabay.com/photo/2017/07/27/20/50/summer-2543238_960_720.jpg')";
  } else if (theme === 'autumn') {
    document.body.style.backgroundImage = "url('https://cdn.pixabay.com/photo/2015/11/02/14/03/autumn-1016985_960_720.jpg')";
  } else if (theme === 'winter') {
    document.body.style.backgroundImage = "url('https://cdn.pixabay.com/photo/2016/11/18/15/02/winter-1837437_960_720.jpg')";
  } else if (theme === 'rain') {
    particlesRain();
  } else if (theme === 'snow') {
    particlesSnow();
  } else if (theme === 'morning') {
    document.body.style.backgroundColor = "#dff5f5";
  } else if (theme === 'day') {
    document.body.style.backgroundColor = "#aee1f9";
  } else if (theme === 'evening') {
    document.body.style.backgroundColor = "#ffa07a";
  } else if (theme === 'night') {
    document.body.style.backgroundColor = "#2c3e50";
  }
});

// 공지사항 수신
socket.on('admin announce', (announcement) => {
  alert(`📢 관리자 공지: ${announcement}`);
});

// 강퇴 명령 수신
socket.on('admin kick', () => {
  alert('⚠️ 강퇴당했습니다.');
  location.reload();
});

// 서버로부터 접속자 리스트 수신
socket.on('update user list', (users) => {
  if (userList) {
    userList.innerHTML = '';
    users.forEach(user => {
      const item = document.createElement('div');
      item.textContent = `👤 ${user.nickname}`;
      userList.appendChild(item);
    });
  }
});
