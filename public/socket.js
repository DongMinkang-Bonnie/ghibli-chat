const socket = io();
const form = document.getElementById('chat-form');
const input = document.getElementById('messageInput');
const messages = document.getElementById('messages');

let lastMessageTime = {}; // { senderId: timestamp }

// 로컬 저장된 채팅 기록 불러오기
function loadMessages() {
  const saved = localStorage.getItem('chatMessages');
  if (saved) {
    messages.innerHTML = saved;
    messages.scrollTop = messages.scrollHeight;
  }
}
window.onload = loadMessages;

// 채팅 전송 (카톡 스타일: 하단 입력 후 자동 스크롤)
form.addEventListener('submit', function(e) {
  e.preventDefault();
  if (input.value) {
    const msgData = {
      message: input.value,
      from: currentUserNickname,
      senderId: currentUserId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    socket.emit('chat message', msgData);
    input.value = '';
  }
});

// 메시지 수신 및 출력 (카톡 스타일 말풍선 처리, 1분 간격 시간 표시)
socket.on('chat message', function(data) {
  // data = { message, from, senderId, time }
  const now = data.time;
  const sender = data.senderId;
  let displayTime = '';
  if (!lastMessageTime[sender] || timeDifference(lastMessageTime[sender], now) >= 1) {
    displayTime = now;
    lastMessageTime[sender] = now;
  }
  
  const li = document.createElement('li');
  // 메시지 정렬 (현재는 발신자에 따라 왼쪽/오른쪽 구분하는 로직 스텁)
  li.className = (sender === currentUserId) ? 'message-right' : 'message-left';
  li.innerHTML = `<strong>${data.from}:</strong> ${data.message}`;
  if (displayTime) {
    li.innerHTML += `<div class="message-info">${displayTime}</div>`;
  }
  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
  localStorage.setItem('chatMessages', messages.innerHTML);
});

// 유저 접속 목록 업데이트
socket.on('update user list', function(users) {
  const userListDiv = document.getElementById('user-list-content');
  if (userListDiv) {
    userListDiv.innerHTML = '<h4>접속자 목록</h4>';
    users.forEach(user => {
      userListDiv.innerHTML += `<div>👤 ${user.nickname}</div>`;
    });
  }
});

// 관리자 명령 수신
socket.on('admin delete all', () => {
  messages.innerHTML = '';
  localStorage.removeItem('chatMessages');
});

socket.on('admin background change', (theme) => {
  // theme를 받은 경우, particles.js 또는 CSS 배경 변경 코드 실행
  // 여기서는 단순한 예제로 처리
  if (theme === 'rain' || theme === 'snow') {
    // particles.js 애니메이션 함수 호출 (별도 particles.js에 구현)
    if (theme === 'rain') particlesRain();
    else if (theme === 'snow') particlesSnow();
  } else {
    document.body.style.backgroundImage = `url(${theme})`;
  }
});

socket.on('admin announce', (announcement) => {
  alert(`📢 관리자 공지: ${announcement}`);
});

socket.on('admin kick', () => {
  alert('⚠️ 강퇴당했습니다.');
  location.reload();
});

socket.on('admin ban', () => {
  alert('🚫 벤당했습니다. 더 이상 입장할 수 없습니다.');
  location.reload();
});

// 유틸리티: 시간 차 계산 (분 단위)
function timeDifference(prev, current) {
  // prev, current는 "HH:MM" 문자열
  const [h1, m1] = prev.split(':').map(Number);
  const [h2, m2] = current.split(':').map(Number);
  return (h2 * 60 + m2) - (h1 * 60 + m1);
}
