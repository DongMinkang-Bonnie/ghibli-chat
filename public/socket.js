document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  // 탭 전환 함수
  window.switchTab = function(tab) {
    document.querySelectorAll('.tab').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(tab).classList.remove('hidden');
    document.getElementById('current-tab').innerText =
      tab === 'friends' ? '친구' : tab === 'rooms' ? '채팅방' : '프로필';
  };

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
      document.getElementById('auth-section').classList.add('hidden');
      document.getElementById('main-section').classList.remove('hidden');
      switchTab('rooms');
      socket.emit('user connected', { id, nickname: data.nickname });
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
    .then(msg => {
      alert(msg);
      backToLogin();
    })
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
    .then(data => {
      alert(`임시 비밀번호: ${data.tempPassword}`);
      backToLogin();
    })
    .catch(err => alert('비밀번호 찾기 실패: ' + err.message));
  };

  // 비밀번호 변경
  window.changePassword = function() {
    const id = document.getElementById('changepw-id').value.trim();
    const oldPw = document.getElementById('changepw-old').value.trim();
    const newPw = document.getElementById('changepw-new').value.trim();
    fetch('/change-password', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id, oldPassword: oldPw, newPassword: newPw })
    })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      backToLogin();
    })
    .catch(err => alert('비밀번호 변경 실패: ' + err.message));
  };

  // 로그인 화면 복귀
  window.backToLogin = function() {
    document.querySelectorAll('#auth-section > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('login-box').classList.remove('hidden');
  };

  // 회원가입/복구/비번변경 화면 열기
  window.showSignup = function() {
    document.querySelectorAll('#auth-section > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('signup-box').classList.remove('hidden');
  };

  window.showRecover = function() {
    document.querySelectorAll('#auth-section > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('recover-box').classList.remove('hidden');
  };

  window.showChangePw = function() {
    document.querySelectorAll('#auth-section > div').forEach(div => div.classList.add('hidden'));
    document.getElementById('changepw-box').classList.remove('hidden');
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

  // 채팅 수신
  socket.on('chat message', data => {
    const li = document.createElement('li');
    li.textContent = `${data.text}   (${data.time})`;
    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
  });

  // 접속자 리스트 업데이트
  socket.on('update users', users => {
    const list = document.getElementById('online-users');
    list.innerHTML = '<h4>접속자 목록</h4>' + users.map(u => `<div>${u.nickname}</div>`).join('');
  });

  // 전체 공지 수신
  socket.on('admin announce', msg => {
    alert(`[공지] ${msg}`);
  });

  // 배경 테마 수신
  socket.on('admin background change', theme => {
    document.body.dataset.theme = theme;
  });
});
