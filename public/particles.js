// 아주 간단한 파티클 이펙트

// 비
function createRain() {
  const rain = document.createElement('div');
  rain.className = 'rain-drop';
  rain.style.left = Math.random() * 100 + 'vw';
  rain.style.animationDuration = 0.5 + Math.random() * 0.5 + 's';
  document.body.appendChild(rain);

  setTimeout(() => {
    rain.remove();
  }, 1000);
}

// 눈
function createSnow() {
  const snow = document.createElement('div');
  snow.className = 'snow-flake';
  snow.style.left = Math.random() * 100 + 'vw';
  snow.style.animationDuration = 2 + Math.random() * 3 + 's';
  document.body.appendChild(snow);

  setTimeout(() => {
    snow.remove();
  }, 5000);
}

// 주기적으로 이펙트 생성
setInterval(() => {
  const theme = document.body.dataset.theme;
  if (theme === 'rain') {
    createRain();
  } else if (theme === 'snow') {
    createSnow();
  }
}, 200);

// CSS는 style.css에서 함께 관리 (rain-drop, snow-flake)

