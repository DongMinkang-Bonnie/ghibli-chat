let isAdmin = false;
let autoThemeTimer = null;

// 관리자 로그인
window.verifyAdmin = function() {
  const pw = document.getElementById('admin-password-input').value;
  if (pw === '75271356') {  // 관리자 비밀번호
    alert('관리자 모드 진입 성공!');
    isAdmin = true;
    document.getElementById('admin-login-popup').classList.add('hidden');
    document.getElementById('admin-panel').classList?.remove('hidden');
  } else {
    alert('비밀번호가 틀렸습니다.');
  }
};

// 전체 공지 보내기
window.broadcastMessage = function() {
  const message = prompt('전체 공지할 내용을 입력하세요:');
  if (message && isAdmin) {
    socket.emit('admin announce', message);
  }
};

// 배경 테마 변경
window.changeTheme = function(theme) {
  if (isAdmin) {
    socket.emit('admin background change', theme);
  }
};

// 콘솔 보기/숨기기
window.toggleConsole = function() {
  const log = document.getElementById('console-log');
  log.classList.toggle('hidden');
};

// 콘솔에 채팅 로그 남기기
socket.on('chat message', data => {
  const log = document.getElementById('console-log');
  if (!log.classList.contains('hidden')) {
    const div = document.createElement('div');
    div.textContent = `[채팅] ${data.text} (${data.time})`;
    log.appendChild(div);
  }
});

// 자동 테마 전환
window.toggleAutoTheme = function() {
  if (autoThemeTimer) {
    clearInterval(autoThemeTimer);
    autoThemeTimer = null;
    alert('자동 테마 전환 중단');
  } else {
    autoThemeTimer = setInterval(() => {
      const themes = ['spring', 'summer', 'autumn', 'winter', 'rain', 'snow', 'morning', 'day', 'evening', 'night'];
      const random = themes[Math.floor(Math.random() * themes.length)];
      changeTheme(random);
    }, 60000); // 1분마다 테마 랜덤 변경
    alert('자동 테마 전환 시작');
  }
};
