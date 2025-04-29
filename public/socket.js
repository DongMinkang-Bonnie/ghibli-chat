document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  
  // 탭 전환
  document.querySelectorAll('#top-nav button').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.sec;
      document.querySelectorAll('.tab-section')
        .forEach(sec => sec.classList.remove('active'));
      document.getElementById(target).classList.add('active');
    });
  });

  // 로그인
  window.login = function() {
    const id = document.getElementById('login-id').value.trim();
    const password = document.getElementById('login-password').value.trim();
    fetch('/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id, password })
    })
    .then(res => res.json())
    .then(data => {
      document.getElementById('auth-section').style.display = 'none';
      document.getElementById('main-section').style.display = 'block';
      socket.emit('user connected', { id, nickname: data.nickname });
      document.getElementById('user-info').innerText = `${data.nickname}님`;
    })
    .catch(err => alert('로그인 실패: ' + err.message));
  };

  // 회원가입
  window.signup = function() {
    const id = document.getElementById('signup-id').value.trim();
    const password = document.getElementById('signup-password').value.trim();
    const nickname = document.getElementById('signup-nickname').value.trim();
    fetch('/signup', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id, password, nickname })
    })
    .then(res => res.text())
    .then(msg => alert(msg))
    .catch(err => alert('회원가입 실패: ' + err.message));
  };

  // 비밀번호 찾기
  window.recoverPassword = function() {
    const id = document.getElementById('recover-id').value.trim();
    fetch('/recover', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => alert(`임시 비밀번호: ${data.tempPassword}`))
    .catch(err => alert('비밀번호 찾기 실패: ' + err.message));
  };

  // 비밀번호 변경
  window.changePassword = function() {
    const id = document.getElementById('pwchange-id').value.trim();
    const oldPassword = document.getElementById('pwchange-old').value.trim();
    const newPassword = document.getElementById('pwchange-new').value.trim();
    fetch('/change-password', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id, oldPassword, newPassword })
    })
    .then(res => res.text())
    .then(msg => alert(msg))
    .catch(err => alert('비밀번호 변경 실패: ' + err.message));
  };

  // 다크모드 토글
  window.toggleDarkMode = function() {
    document.body.classList.toggle('dark-mode');
  };

  // 로그아웃
  window.logout = function() {
    location.reload();
  };

  // 하단 탭바 전환
  window.switchTab = function(tab) {
    document.querySelectorAll('.tab-section')
      .forEach(sec => sec.classList.remove('active'));
    document.getElementById(tab).classList.add('active');
  };

  // 채팅 전송
  const form = document.getElementById('chat-form');
  const input = document.getElementById('messageInput');
  const messages = document.getElementById('chat-messages');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    socket.emit('chat message', { text, time });
    input.value = '';
  });

  socket.on('chat message', data => {
    const li = document.createElement('li');
    li.textContent = `${data.text}   (${data.time})`;
    li.className = 'my-message'; // 기본 내 메시지 처리
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });

  // 접속자 목록 업데이트
  socket.on('update users', users => {
    const userList = document.getElementById('online-users');
    userList.innerHTML = '<h4>접속자 목록</h4>' + users.map(u => `<div>${u.nickname}</div>`).join('');
  });

  // 전체 공지 수신
  socket.on('admin announce', msg => {
    alert(`[공지] ${msg}`);
  });

  // 테마 변경 수신
  socket.on('admin background change', theme => {
    document.body.dataset.theme = theme;
  });
});
