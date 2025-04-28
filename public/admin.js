// 관리자 기능 모음

// 전체 메시지 삭제
function deleteAllMessages() {
    if (confirm('정말 모든 메시지를 삭제하시겠습니까?')) {
      socket.emit('admin delete all');
    }
  }
  
  // 공지사항 보내기
  function sendAnnouncement() {
    const announcement = prompt('공지할 내용을 입력하세요:');
    if (announcement) {
      socket.emit('admin announce', announcement);
    }
  }
  
  // 방 잠금/해제 기능 (간단 버전)
  let roomLocked = false;
  function lockRoom() {
    roomLocked = !roomLocked;
    if (roomLocked) {
      alert('방이 잠겼습니다! (출입 제한)');
    } else {
      alert('방이 열렸습니다! (출입 가능)');
    }
  }
  