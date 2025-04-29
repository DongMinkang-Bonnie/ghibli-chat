// ─────────────────────────────────────────────────────────
// 관리자 비밀번호 설정
const ADMIN_PASSWORD = "75271356";
let isAdmin = false;
let autoThemeInterval = null;

// ─────────────────────────────────────────────────────────
// 개발자 모드 진입/해제
function openAdmin() {
  document.getElementById('admin-login-popup').classList.remove('hidden');
}

function verifyAdmin() {
  const input = document.getElementById('admin-password-input');
  const pwd = input.value;
  input.value = '';
  if (pwd === ADMIN_PASSWORD) {
    isAdmin = !isAdmin;
    // 팝업 숨기기
    document.getElementById('admin-login-popup').classList.add('hidden');
    // 관리자 패널/테마 컨트롤 토글
    document.getElementById('admin-panel').classList.toggle('hidden', !isAdmin);
    document.getElementById('theme-controls').classList.toggle('hidden', !isAdmin);
    alert(isAdmin ? '개발자 모드 활성화되었습니다.' : '개발자 모드 해제되었습니다.');
  } else {
    alert('비밀번호가 틀렸습니다.');
  }
}

// ─────────────────────────────────────────────────────────
// 서버 로그 콘솔 토글
function toggleConsole() {
  if (!isAdmin) return alert('관리자만 사용 가능합니다.');
  document.getElementById('console-log').classList.toggle('hidden');
}

// ─────────────────────────────────────────────────────────
// 공지사항 방송
function broadcastMessage() {
  if (!isAdmin) return alert('관리자만 사용 가능합니다.');
  const msg = prompt('공지 메시지를 입력하세요:');
  if (msg) {
    socket.emit('admin announce', msg);
  }
}

// ─────────────────────────────────────────────────────────
// 방 잠금/해제 (스텁)
function lockRoom() {
  if (!isAdmin) return alert('관리자만 사용 가능합니다.');
  // 실제 방잠금 로직은 서버 측 구현 필요
  alert('방 잠금/해제 기능은 곧 제공됩니다.');
}

// ─────────────────────────────────────────────────────────
// 자동 테마 전환 토글
function toggleAutoTheme() {
  if (!isAdmin) return alert('관리자만 사용 가능합니다.');
  if (autoThemeInterval) {
    clearInterval(autoThemeInterval);
    autoThemeInterval = null;
    alert('자동 배경 전환이 중지되었습니다.');
  } else {
    // 5분 주기 기본
    autoThemeInterval = setInterval(() => {
      const themes = ['spring','summer','autumn','winter','rain','snow','morning','day','evening','night'];
      const rnd = themes[Math.floor(Math.random() * themes.length)];
      toggleTheme(rnd);
    }, 5 * 60 * 1000);
    alert('자동 배경 전환이 시작되었습니다.');
  }
}

// ─────────────────────────────────────────────────────────
// 커스텀 배경 업로드
function uploadCustomBg() {
  if (!isAdmin) return alert('관리자만 사용 가능합니다.');
  const inp = document.getElementById('custom-bg');
  if (inp.files && inp.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      document.body.style.backgroundImage = `url('${e.target.result}')`;
      document.body.style.backgroundSize = 'cover';
    };
    reader.readAsDataURL(inp.files[0]);
  }
}

// ─────────────────────────────────────────────────────────
// 테마 수동 변경
function toggleTheme(theme) {
  if (!isAdmin) return alert('관리자만 사용 가능합니다.');
  socket.emit('admin background change', theme);
  document.body.dataset.theme = theme;
}

// ─────────────────────────────────────────────────────────
// 다크모드 토글
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// ─────────────────────────────────────────────────────────
// 접속자 목록 토글
function toggleOnlineUsers() {
  document.getElementById('online-users').classList.toggle('hidden');
}
