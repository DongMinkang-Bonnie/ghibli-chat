// ─────────────────────────────────────────────────────────
// 전역 변수
const socket = io();
let myId = '';
let myNickname = '';
let myProfileImage = '';
let currentRoomId = '';
const lastMessageTime = {}; // { roomId: { sender: lastTime } }

// ─────────────────────────────────────────────────────────
// 유틸: 서버로 유저 정보 전송
function connectUser() {
  socket.emit('user connected', { id: myId, nickname: myNickname, profileImage: myProfileImage });
}

// ─────────────────────────────────────────────────────────
// 로컬 채팅 기록 저장/불러오기
function saveMessages() {
  localStorage.setItem(`chat_${currentRoomId}`, document.getElementById('chat-messages').innerHTML);
}
function loadMessages() {
  const saved = localStorage.getItem(`chat_${currentRoomId}`);
  if (saved) document.getElementById('chat-messages').innerHTML = saved;
}

// ─────────────────────────────────────────────────────────
// 인증 섹션 함수들
function signup() {
  const id = $('#signup-id').value.trim();
  const pw = $('#signup-password').value;
  const nick = $('#signup-nickname').value.trim();
  fetch('/signup', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id, password: pw, nickname: nick})
  }).then(r=>r.text()).then(alert).catch(e=>alert(e));
}
function login() {
  const id = $('#login-id').value.trim();
  const pw = $('#login-password').value;
  fetch('/login',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id, password: pw})
  })
    .then(r=>r.json())
    .then(data=>{
      myId = id;
      myNickname = data.nickname;
      myProfileImage = data.profileImage || '';
      $('#auth-section').classList.add('hidden');
      $('#main-section').classList.remove('hidden');
      $('#user-info').innerText = `ID: ${myId} / ${myNickname}`;
      switchTab('friends');
      connectUser();
      loadRooms();
      loadFriends();
    })
    .catch(e=>alert('로그인 실패: '+e));
}
function recoverPassword() {
  const id = $('#recover-id').value.trim();
  fetch('/recover',{ method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id})
  }).then(r=>r.json()).then(d=>alert(`임시 비밀번호: ${d.tempPassword}`)).catch(e=>alert(e));
}
function changePassword() {
  const id = $('#pwchange-id').value.trim();
  const oldP = $('#pwchange-old').value;
  const newP = $('#pwchange-new').value;
  fetch('/change-password',{ method:'POST',headers:{'Content-Type':'application/json'},
    body: JSON.stringify({id, oldPassword: oldP, newPassword: newP})
  }).then(r=>r.text()).then(alert).catch(e=>alert(e));
}

// ─────────────────────────────────────────────────────────
// 탭 전환
function switchTab(tab) {
  ['friends','rooms','profile','chat'].forEach(t=>$('#tab-'+t).classList.add('hidden'));
  $('#chat-box').classList.add('hidden');
  $('#tab-'+tab).classList.remove('hidden');
  // 탭 버튼 활성화 표시
  [...$('#tabs').children].forEach(btn=> btn.classList.remove('active'));
  document.querySelector(`#tabs button[onclick*="'${tab}'"]`).classList.add('active');
}

// ─────────────────────────────────────────────────────────
// 친구 목록 (스텁)
function loadFriends() {
  // TODO: 실제 API 호출하여 친구 목록 가져오기
  const list = $('#friend-list');
  list.innerHTML = '<div>아직 친구가 없습니다.</div>';
}

// ─────────────────────────────────────────────────────────
// 방 목록 
function loadRooms(sort='recent') {
  // TODO: 실제 API GET /rooms?sort=...
  const dummy = [
    {roomId:'room1', name:'공개방 1', members:3},
    {roomId:'room2', name:'비밀방 2', members:1}
  ];
  if(sort==='empty') dummy.sort((a,b)=>a.members-b.members);
  const list = $('#room-list');
  list.innerHTML = '';
  dummy.forEach(r=>{
    const d = document.createElement('div');
    d.innerText = `${r.name} (${r.members}명)`;
    d.onclick = ()=>joinRoom(r.roomId);
    list.appendChild(d);
  });
}

// ─────────────────────────────────────────────────────────
// 방 만들기
function createRoom() {
  const id = prompt('방 ID:');
  if(!id) return;
  const name = prompt('방 이름:');
  const secret = confirm('비밀방으로 설정하시겠습니까?');
  let pw = '';
  if(secret) pw = prompt('비밀방 비밀번호:');
  const max = parseInt(prompt('최대 인원 (일반:8명)'))||8;
  fetch('/create-room',{ method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({roomId:id,name, isSecret:secret, password:pw, maxUsers:max})
  }).then(r=>r.text()).then(msg=>{
    alert(msg);
    loadRooms();
  }).catch(e=>alert(e));
}

// ─────────────────────────────────────────────────────────
// 방 입장
function joinRoom(roomId) {
  const pw = prompt('비밀방이면 비밀번호 입력:')||'';
  fetch('/join-room',{ method:'POST',headers:{'Content-Type':'application/json'},
    body: JSON.stringify({roomId, id:myId, password: pw})
  }).then(r=>r.text()).then(msg=>{
    alert(msg);
    currentRoomId = roomId;
    $('#chat-room-name').innerText = roomId;
    switchTab('chat');
    loadMessages();
  }).catch(e=>alert(e));
}

// ─────────────────────────────────────────────────────────
// 채팅 전송
$('#chat-form').addEventListener('submit', e=>{
  e.preventDefault();
  const txt = $('#messageInput').value.trim();
  if(!txt || !currentRoomId) return;
  const now = new Date();
  const time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  socket.emit('chat message',{ roomId:currentRoomId, from:myNickname, id:myId, text:txt, time, profileImage:myProfileImage });
  $('#messageInput').value = '';
});

// ─────────────────────────────────────────────────────────
// 채팅 수신
socket.on('chat message', data=>{
  if(data.roomId !== currentRoomId) return;
  const ul = $('#chat-messages');
  const li = document.createElement('li');
  li.className = data.id===myId ? 'my-message' : 'other-message';
  // 1분 간격 시간 표시
  const key = `${currentRoomId}_${data.id}`;
  if(!lastMessageTime[key] || lastMessageTime[key] !== data.time) {
    lastMessageTime[key] = data.time;
    li.innerHTML = `
      <img src="${data.profileImage||'https://via.placeholder.com/30'}" />
      <div class="text"><strong>${data.from}:</strong> ${data.text}</div>
      <small class="time">${data.time}</small>
    `;
  } else {
    li.innerHTML = `
      <img src="${data.profileImage||'https://via.placeholder.com/30'}" />
      <div class="text">${data.text}</div>
    `;
  }
  ul.appendChild(li);
  saveMessages();
  ul.scrollTop = ul.scrollHeight;
});

// ─────────────────────────────────────────────────────────
// 접속자 목록
$('#show-online').addEventListener('click', ()=>{
  $('#online-users').classList.toggle('hidden');
});
socket.on('update user list', list=>{
  const c = $('#online-users');
  c.innerHTML = '';
  list.forEach(u=>{
    const d = document.createElement('div');
    d.innerText = u.nickname;
    c.appendChild(d);
  });
});

// ─────────────────────────────────────────────────────────
// 기타: 프로필, 로그아웃 등
function openProfile() { switchTab('profile'); }
function saveProfile() { alert('프로필 저장 (stub)'); }
function uploadProfile() { alert('프로필 이미지 업로드 (stub)'); }
function deleteAccount() { if(confirm('삭제?')) alert('계정 삭제 (stub)'); }
function logout() { location.reload(); }

// ─────────────────────────────────────────────────────────
// DOM 헬퍼
function $(sel){ return document.querySelector(sel); }
