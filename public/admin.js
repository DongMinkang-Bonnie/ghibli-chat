// 관리자 패널 기능
function deleteAllMessages() {
  if (confirm('정말 모든 메시지를 삭제하시겠습니까?')) {
    socket.emit('admin delete all');
  }
}

function sendAnnouncement() {
  const announcement = prompt('공지사항 내용을 입력하세요:');
  if (announcement) {
    socket.emit('admin announce', announcement);
  }
}

let roomLocked = false;
function lockRoom() {
  roomLocked = !roomLocked;
  alert(roomLocked ? '방이 잠겼습니다!' : '방이 열렸습니다!');
  // 추가 로직 (출입 제한) 필요 시 구현
}

function kickUser() {
  const socketId = prompt('강퇴할 사용자의 소켓 ID를 입력하세요:');
  if (socketId) {
    socket.emit('admin kick', socketId);
  }
}

function banUser() {
  const userId = prompt('벤할 사용자의 아이디를 입력하세요:');
  if (userId) {
    socket.emit('admin ban', userId);
  }
}
