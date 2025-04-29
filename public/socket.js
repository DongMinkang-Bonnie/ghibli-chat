const socket = io();

const form = document.getElementById('chat-form');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');

// 사용자 정보 저장
let myNickname = '';
let myId = '';
let myProfileImage = '';

function connectUser(nickname, id) {
  myNickname = nickname;
  myId = id;
  socket.emit('user connected', { id, nickname, profileImage: myProfileImage });
}

// 메시지 저장
function saveMessages() {
  localStorage.setItem('chatMessages', messages.innerHTML);
}

// 메시지 불러오기
function loadMessages() {
  const saved = localStorage.getItem('chatMessages');
  if (saved) {
    messages.innerHTML = saved;
  }
}

loadMessages();

// 채팅 입력
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value.trim()) {
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const data = {
      from: myNickname,
      text: input.value.trim(),
      time: time,
      profileImage: myProfileImage
    };
    socket.emit('chat message', data);
    input.value = '';
  }
});

// 채팅 받기
socket.on('chat message', function(data) {
  const now = new Date();
  const currentMinute = now.getMinutes();

  const item = document.createElement('li');
  item.classList.add(data.from === myNickname ? 'my-message' : 'other-message');
  
  const profile = document.createElement('img');
  profile.src = data.profileImage || 'https://via.placeholder.com/40';
  profile.style.width = '30px';
  profile.style.height = '30px';
  profile.style.borderRadius = '50%';
  profile.style.verticalAlign = 'middle';
  profile.style.marginRight = '8px';
  
  const nickname = document.createElement('span');
  nickname.style.fontWeight = 'bold';
  nickname.innerText = data.from + ' ';
  
  const text = document.createElement('span');
  text.innerText = data.text;
  
  const time = document.createElement('small');
  time.style.display = 'block';
  time.style.fontSize = '10px';
  time.style.color = '#888';
  time.innerText = data.time;
  
  item.appendChild(profile);
  item.appendChild(nickname);
  item.appendChild(text);
  item.appendChild(time);
  messages.appendChild(item);
  
  saveMessages();
  
  // 🔥 새 메시지 올 때마다 자동 스크롤 맨 아래
  messages.scrollTop = messages.scrollHeight;
});

// 접속자 목록 업데이트
socket.on('update user list', function(userList) {
  const userListContent = document.getElementById('user-list-content');
  userListContent.innerHTML = '';
  userList.forEach(user => {
    const div = document.createElement('div');
    div.innerText = user.nickname;
    userListContent.appendChild(div);
  });
});

// 전체 삭제 (관리자 기능)
socket.on('admin delete all', () => {
  messages.innerHTML = '';
  saveMessages();
});

// 방 배경 변경 (관리자 기능)
socket.on('admin background change', (theme) => {
  document.body.dataset.theme = theme;
});

// 공지사항 (관리자 기능)
socket.on('admin announce', (announcement) => {
  alert('📢 공지: ' + announcement);
});

// 강제 퇴장 (관리자 기능)
socket.on('admin kick', () => {
  alert('강제 퇴장되었습니다.');
  location.reload();
});
