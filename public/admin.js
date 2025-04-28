// 관리자 패널 기능

// 전체 메시지 삭제
function deleteAllMessages() {
    if (confirm('정말 모든 메시지를 삭제하시겠습니까?')) {
      socket.emit('admin delete all');
    }
  }
  
  // 공지사항 보내기
  function sendAnnouncement() {
    const announcement = prompt('공지사항 내용을 입력하세요:');
    if (announcement) {
      socket.emit('admin announce', announcement);
    }
  }
  
  // 방 잠금/해제 (심플 기능)
  let roomLocked = false;
  function lockRoom() {
    roomLocked = !roomLocked;
    if (roomLocked) {
      alert('방이 잠겼습니다! (출입 제한)');
      // 여기서 socket.emit('lock') 같은 추가 구현 가능
    } else {
      alert('방이 열렸습니다! (출입 가능)');
      // 여기서 socket.emit('unlock') 같은 추가 구현 가능
    }
  }
  
  // 배경 테마 변경 (관리자용)
  function changeBackground() {
    const themes = [
      'https://cdn.pixabay.com/photo/2015/10/28/15/51/rain-1015609_960_720.jpg', // 비
      'https://cdn.pixabay.com/photo/2017/01/18/15/44/snow-1997281_960_720.jpg', // 눈
      'https://cdn.pixabay.com/photo/2017/08/01/08/29/flowers-2566240_960_720.jpg', // 꽃
      'https://cdn.pixabay.com/photo/2016/09/21/11/34/landscape-1685431_960_720.jpg' // 바람
    ];
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    socket.emit('admin background change', randomTheme);
  }
  