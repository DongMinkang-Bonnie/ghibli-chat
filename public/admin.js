let isAdmin = false;
let autoThemeTimer = null;

// 관리자 모드 진입
window.verifyAdmin = function() {
  const password = document.getElementById('admin-password-input').value;
  if (password === '75271356') { // 관리자 비밀번호
    alert('관리자 모드 진입 성공!');
    isAdmin = true;
    document.getElementById('admin-login-popup').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
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

// 개발자 콘솔 보기
window.toggleConsole = function() {
  const log = document.getElementById('console-log');
  log.classList.toggle('hidden');
};

// 콘솔에 로그 남기기
socket.on('chat message', data => {
  const log = document.getElementById('console-log');
  if (!log.classList.contains('hidden')) {
    const div = document.createElement('div');
    div.textContent = `[채팅] ${data.text} (${data.time})`;
    log.appendChild(div);
  }
});

// 자동 테마 전환 (랜덤)
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
    }, 60000); // 1분마다 자동 변경
    alert('자동 테마 전환 시작');
  }
};

// 배경 이미지 업로드
window.uploadCustomBg = function() {
  const fileInput = document.getElementById('custom-bg');
  fileInput.click();
  fileInput.onchange = function() {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        document.body.style.backgroundImage = `url('${e.target.result}')`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        alert('커스텀 배경 적용 완료');
      };
      reader.readAsDataURL(file);
    }
  };
};
