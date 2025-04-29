const ADMIN_PASSWORD = "75271356"; // 관리자 비밀번호

let isAdmin = false;
let autoBackgroundInterval = null;

// 관리자 로그인
function openAdminLogin() {
  document.getElementById('admin-login').style.display = 'block';
}

function verifyAdmin() {
  const password = document.getElementById('admin-password').value;
  if (password === ADMIN_PASSWORD) {
    isAdmin = !isAdmin;
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-panel').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('theme-buttons').style.display = isAdmin ? 'block' : 'none';
    alert(isAdmin ? '개발자 모드 활성화되었습니다.' : '개발자 모드 해제되었습니다.');
  } else {
    alert('비밀번호가 틀렸습니다.');
  }
}

// 전체 채팅 삭제
function deleteAllMessages() {
  if (isAdmin) {
    socket.emit('admin delete all');
  }
}

// 공지 보내기
function sendAnnouncement() {
  if (isAdmin) {
    const announcement = prompt('보낼 공지 내용을 입력하세요:');
    if (announcement) {
      socket.emit('admin announce', announcement);
    }
  }
}

// 방 잠그기/열기
function lockRoom() {
  alert('(준비중) 방 잠금/해제 기능은 차후 업데이트될 예정입니다.');
}

// 배경 업로드
function uploadBackground() {
  if (isAdmin) {
    const url = prompt('배경 이미지 URL을 입력하세요:');
    if (url) {
      document.body.style.backgroundImage = `url('${url}')`;
      document.body.style.backgroundSize = 'cover';
    }
  }
}

// 테마 수동 변경
function toggleTheme(theme) {
  if (isAdmin) {
    socket.emit('admin background change', theme);
  }
}

// 비/눈 토글 효과
function toggleEffect(effect) {
  if (isAdmin) {
    const currentTheme = document.body.dataset.theme;
    if (currentTheme === effect) {
      document.body.dataset.theme = '';
      socket.emit('admin background change', '');
    } else {
      document.body.dataset.theme = effect;
      socket.emit('admin background change', effect);
    }
  }
}

// 시간대 변경 (아침/낮/저녁/밤)
function changeTime(time) {
  if (isAdmin) {
    socket.emit('admin background change', time);
  }
}

// 배경 자동 전환 토글
function toggleAutoBackground() {
  if (!isAdmin) return;

  if (autoBackgroundInterval) {
    clearInterval(autoBackgroundInterval);
    autoBackgroundInterval = null;
    alert('자동 배경 전환이 중지되었습니다.');
  } else {
    const sec = parseInt(document.getElementById('background-interval').value);
    if (isNaN(sec) || sec <= 0) {
      alert('전환 주기(초)를 입력하세요.');
      return;
    }
    autoBackgroundInterval = setInterval(() => {
      const themes = ['spring', 'summer', 'autumn', 'winter', 'rain', 'snow', 'morning', 'day', 'evening', 'night'];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      toggleTheme(randomTheme);
    }, sec * 1000);
    alert('자동 배경 전환이 시작되었습니다.');
  }
}

// 접속자 목록 토글
function toggleUserList() {
  const list = document.getElementById('online-users');
  list.style.display = list.style.display === 'none' ? 'block' : 'none';
}

// 접속자 목록 고정
function pinUserList() {
  const list = document.getElementById('online-users');
  list.style.position = 'fixed';
  list.style.top = '10px';
  list.style.right = '10px';
}

// 다크모드
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

// 하단 탭바
function showTab(tabName) {
  // 나중에 세부 탭별 기능 추가 가능
  alert(tabName + ' 탭 선택됨');
}
