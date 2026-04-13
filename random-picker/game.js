// ============================================================
// 게임 설정
// ============================================================
const SHAPES = ["circle", "heart", "triangle", "square"];
const COLORS = ["#ff0000", "#ffff00", "#00ff00", "#0000ff"];

const SHAPE_COUNT = {
  0: 2, // 2개
  1: 3, // 3개
  2: 4, // 4개
};

const SHAPE_LABELS = {
  0: "2개",
  1: "3개",
  2: "4개",
};

let currentStage = 0;
let isPlaying = false;

// ============================================================
// DOM 요소
// ============================================================
const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const stageButtons = document.querySelectorAll(".stage-btn");
const backBtn = document.getElementById("backBtn");
const retryBtn = document.getElementById("retryBtn");
const restartBtn = document.getElementById("restartBtn");
const shapeContainer = document.getElementById("shapeContainer");
const stageNumber = document.getElementById("stageNumber");
const countOverlay = document.getElementById("countOverlay");
const countdownNumber = document.getElementById("countdownNumber");
const soundIndicator = document.getElementById("soundIndicator");

// ============================================================
// 이벤트 리스너
// ============================================================
stageButtons.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const stage = parseInt(e.target.dataset.stage);
    startGame(stage);
  });
});

backBtn.addEventListener("click", goBackToStart);
retryBtn.addEventListener("click", retryStage);
restartBtn.addEventListener("click", restart);

// ============================================================
// 게임 로직
// ============================================================
function startGame(stage) {
  currentStage = stage;
  stageNumber.textContent = SHAPE_LABELS[stage];
  showScreen("gameScreen");
  playStage();
}

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function playStage() {
  isPlaying = true;
  const shapeCount = SHAPE_COUNT[currentStage];

  // 버튼 숨기기
  const buttonGroup = document.querySelector(".button-group");
  buttonGroup.style.display = "none";

  // 도형 컨테이너 비우기
  shapeContainer.innerHTML = "";
  shapeContainer.classList.toggle("four-shapes", shapeCount === 4);

  // 카운트다운 시작
  startCountdown(() => {
    displayShapes(shapeCount);
    buttonGroup.style.display = "flex";
    isPlaying = false;
  });
}

function startCountdown(onDone) {
  let remaining = 3;

  // UI 초기화
  countOverlay.classList.add("show");
  const dots = soundIndicator.querySelectorAll(".dot");
  dots.forEach((dot) => dot.classList.remove("off"));

  countdownNumber.textContent = String(remaining);
  playBeep();

  // 1초마다 카운트다운
  const timer = setInterval(() => {
    remaining -= 1;

    if (remaining > 0) {
      countdownNumber.textContent = String(remaining);
      playBeep();
      // 해당 점 비활성화 (오른쪽 -> 왼쪽 순서)
      if (dots[remaining]) {
        dots[remaining].classList.add("off");
      }
    } else {
      // 완료
      clearInterval(timer);
      countOverlay.classList.remove("show");
      onDone();
    }
  }, 1000);
}

function displayShapes(count) {
  // 중복 없는 색상 선택
  const selectedColors = getUniqueColors(count);

  // 도형 생성
  for (let i = 0; i < count; i++) {
    const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const svg = createShape(randomShape, selectedColors[i]);
    shapeContainer.appendChild(svg);
  }
}

function getUniqueColors(count) {
  // Fisher-Yates 셔플로 중복 없는 색상 선택
  const shuffled = [...COLORS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function createShape(shapeType, color) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 120 120");
  svg.setAttribute("width", "150");
  svg.setAttribute("height", "150");

  let shape;

  switch (shapeType) {
    case "circle":
      shape = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      shape.setAttribute("cx", "60");
      shape.setAttribute("cy", "60");
      shape.setAttribute("r", "45");
      shape.setAttribute("fill", color);
      break;

    case "heart":
      shape = document.createElementNS("http://www.w3.org/2000/svg", "path");
      shape.setAttribute(
        "d",
        "M60,108 C23,84 10,64 10,48 C10,29 24,18 39,18 C50,18 60,28 60,28 C60,28 70,18 81,18 C96,18 110,29 110,48 C110,64 97,84 60,108 Z",
      );
      shape.setAttribute("fill", color);
      break;

    case "triangle":
      shape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      shape.setAttribute("points", "60,12 110,105 10,105");
      shape.setAttribute("fill", color);
      break;

    case "square":
      shape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      shape.setAttribute("x", "15");
      shape.setAttribute("y", "15");
      shape.setAttribute("width", "90");
      shape.setAttribute("height", "90");
      shape.setAttribute("fill", color);
      break;
  }

  if (shape) {
    svg.appendChild(shape);
  }

  return svg;
}

function playBeep() {
  // Web Audio API를 사용하여 비프음 생성
  try {
    const audioContext = new (
      window.AudioContext || window.webkitAudioContext
    )();
    const now = audioContext.currentTime;
    const duration = 0.2;

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(audioContext.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    // 브라우저가 Web Audio API를 지원하지 않는 경우
    console.log("Audio not supported");
  }
}

function retryStage() {
  if (!isPlaying) {
    playStage();
  }
}

function goBackToStart() {
  if (!isPlaying) {
    showScreen("startScreen");
  }
}

function restart() {
  showScreen("startScreen");
}
