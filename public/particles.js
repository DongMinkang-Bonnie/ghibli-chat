(function() {
  const style = document.createElement('style');
  style.textContent = `
    .rain-drop {
      position: fixed;
      top: -20px;
      width: 2px;
      height: 15px;
      background: rgba(174,194,224,0.5);
      animation: rainFall 1s linear infinite;
      pointer-events: none;
      z-index: 9999;
    }
    @keyframes rainFall {
      to { transform: translateY(100vh); opacity: 0; }
    }

    .snow-flake {
      position: fixed;
      top: -20px;
      font-size: 18px;
      color: rgba(255,255,255,0.8);
      animation: snowFall 5s linear infinite;
      pointer-events: none;
      z-index: 9999;
    }
    @keyframes snowFall {
      0% { transform: translateY(0) translateX(0); opacity: 1; }
      100% { transform: translateY(100vh) translateX(20px); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  let particleTimer = null;

  function createRain() {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = Math.random() * window.innerWidth + 'px';
    document.body.appendChild(drop);
    setTimeout(() => drop.remove(), 2000);
  }

  function createSnow() {
    const flake = document.createElement('div');
    flake.className = 'snow-flake';
    flake.innerText = '❄';
    flake.style.left = Math.random() * window.innerWidth + 'px';
    document.body.appendChild(flake);
    setTimeout(() => flake.remove(), 8000);
  }

  function startParticles() {
    if (particleTimer) return;
    particleTimer = setInterval(() => {
      const theme = document.body.dataset.theme;
      if (theme === 'rain') createRain();
      if (theme === 'snow') createSnow();
    }, 200);
  }

  function stopParticles() {
    if (!particleTimer) return;
    clearInterval(particleTimer);
    particleTimer = null;
  }

  // 테마 감시
  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      if (m.attributeName === 'data-theme') {
        const theme = document.body.dataset.theme;
        if (theme === 'rain' || theme === 'snow') {
          startParticles();
        } else {
          stopParticles();
        }
      }
    });
  });
  observer.observe(document.body, { attributes: true });

  // 초기 테마 확인
  if (document.body.dataset.theme === 'rain' || document.body.dataset.theme === 'snow') {
    startParticles();
  }
})();
