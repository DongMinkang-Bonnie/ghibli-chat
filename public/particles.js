// ─────────────────────────────────────────────────────────
// particles.js: 비/눈 이펙트 관리

(function() {
  // 1) CSS 스타일 주입
  const style = document.createElement('style');
  style.textContent = `
    .rain-drop {
      position: fixed;
      top: -20px;
      width: 2px;
      height: 15px;
      background: rgba(174,194,224,0.6);
      animation-name: rainFall;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    @keyframes rainFall {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(100vh); opacity: 0; }
    }

    .snow-flake {
      position: fixed;
      top: -20px;
      font-size: 18px;
      color: rgba(255,255,255,0.8);
      animation-name: snowFall;
      animation-timing-function: linear;
      animation-iteration-count: infinite;
    }
    @keyframes snowFall {
      0% { transform: translateY(0) translateX(0); opacity: 1; }
      100% { transform: translateY(100vh) translateX(20px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // 2) 파티클 생성 함수
  function createRain() {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = Math.random() * window.innerWidth + 'px';
    drop.style.animationDuration = (0.5 + Math.random()*0.5) + 's';
    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), 1000);
  }

  function createSnow() {
    const flake = document.createElement('div');
    flake.className = 'snow-flake';
    flake.innerText = '❄';
    flake.style.left = Math.random() * window.innerWidth + 'px';
    flake.style.animationDuration = (3 + Math.random()*2) + 's';
    document.body.appendChild(flake);
    setTimeout(() => flake.remove(), 6000);
  }

  // 3) 주기적으로 이펙트 생성 (theme에 따라)
  setInterval(() => {
    const theme = document.body.dataset.theme;
    if (theme === 'rain') {
      createRain();
    } else if (theme === 'snow') {
      createSnow();
    }
  }, 200);

})();
