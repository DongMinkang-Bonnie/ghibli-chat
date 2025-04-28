// particle 애니메이션 제어

function particlesRain() {
    clearParticles();
    for (let i = 0; i < 50; i++) {
      createParticle('💧', Math.random() * window.innerWidth, Math.random() * window.innerHeight, 1);
    }
  }
  
  function particlesSnow() {
    clearParticles();
    for (let i = 0; i < 50; i++) {
      createParticle('❄️', Math.random() * window.innerWidth, Math.random() * window.innerHeight, 2);
    }
  }
  
  function createParticle(symbol, x, y, speed) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.innerText = symbol;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.animationDuration = `${5 + Math.random() * 5}s`;
    particle.dataset.speed = speed;
    document.body.appendChild(particle);
  }
  
  function clearParticles() {
    const existingParticles = document.querySelectorAll('.particle');
    existingParticles.forEach(p => p.remove());
  }
  
  // 애니메이션 이동 제어
  setInterval(() => {
    const particles = document.querySelectorAll('.particle');
    particles.forEach(p => {
      let top = parseFloat(p.style.top);
      let speed = parseFloat(p.dataset.speed);
      top += speed;
      if (top > window.innerHeight) {
        top = -20;
        p.style.left = `${Math.random() * window.innerWidth}px`;
      }
      p.style.top = `${top}px`;
    });
  }, 30);
  