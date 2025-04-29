// 간단한 particle 애니메이션 예제 (지브리 감성을 위한)
// 실제 완성도 높은 애니메이션은 Particle.js 라이브러리 등 추가 사용 필요

function clearParticles() {
  document.querySelectorAll('.particle').forEach(p => p.remove());
}

function createParticle(symbol, x, y, duration) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.innerText = symbol;
  p.style.left = `${x}px`;
  p.style.top = `${y}px`;
  p.style.animationDuration = `${duration}s`;
  document.body.appendChild(p);
}

function particlesRain() {
  clearParticles();
  for (let i = 0; i < 50; i++) {
    createParticle('💧', Math.random() * window.innerWidth, Math.random() * window.innerHeight, 3 + Math.random() * 2);
  }
}

function particlesSnow() {
  clearParticles();
  for (let i = 0; i < 50; i++) {
    createParticle('❄️', Math.random() * window.innerWidth, Math.random() * window.innerHeight, 5 + Math.random() * 3);
  }
}

// CSS for particles (inject style dynamically)
const style = document.createElement('style');
style.innerHTML = `
.particle {
  position: fixed;
  font-size: 24px;
  pointer-events: none;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes fall {
  0% { transform: translateY(0px); opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
}
`;
document.head.appendChild(style);
