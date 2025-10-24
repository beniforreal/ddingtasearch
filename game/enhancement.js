// 강화 데이터
const enhancementData = [
  { name: "1강", price: "5,000G", probability: "90%" },
  { name: "2강", price: "25,000G", probability: "80%" },
  { name: "3강", price: "50,000G", probability: "70%" },
  { name: "4강", price: "100,000G", probability: "60%" },
  { name: "5강", price: "180,000G", probability: "50%" },
  { name: "6강", price: "270,000G", probability: "40%" },
  { name: "7강", price: "320,000G", probability: "30%" },
  { name: "8강", price: "650,000G", probability: "20%" },
  { name: "9강", price: "700,000G", probability: "15%" },
  { name: "10강", price: "1,000,000G", probability: "10%" },
  { name: "11강", price: "1,100,000G", probability: "5%" },
  { name: "12강", price: "1,200,000G", probability: "3%" },
  { name: "13강", price: "1,300,000G", probability: "2%" },
  { name: "14강", price: "1,500,000G", probability: "1%" },
  { name: "15강", price: "2,000,000G", probability: "1%" },
];

// 아이템 정보
const items = {
  세이지곡괭이: {
    name: "세이지 곡괭이",
    image: "../img/세이지곡괭이.png",
  },
  세이지괭이: {
    name: "세이지 괭이",
    image: "../img/세이지괭이.png",
  },
};

// 현재 상태
let currentItem = "세이지곡괭이";
let currentLevel = 0;
let totalCost = 0;
let attemptCount = 0;
let isEnhancing = false;

// DOM 요소
const itemButtons = document.querySelectorAll(".item-btn");
const currentItemImage = document.getElementById("currentItemImage");
const currentItemName = document.getElementById("currentItemName");
const enhancementLevel = document.getElementById("enhancementLevel");
const currentLevelEl = document.getElementById("currentLevel");
const nextLevelEl = document.getElementById("nextLevel");
const enhancementCostEl = document.getElementById("enhancementCost");
const successRateEl = document.getElementById("successRate");
const totalCostEl = document.getElementById("totalCost");
const attemptCountEl = document.getElementById("attemptCount");
const enhanceBtn = document.getElementById("enhanceBtn");
const resetBtn = document.getElementById("resetBtn");
const resultOverlay = document.getElementById("resultOverlay");
const resultEffect = document.getElementById("resultEffect");
const resultMessage = document.getElementById("resultMessage");
const historyList = document.getElementById("historyList");

// 초기화
function init() {
  updateDisplay();

  // 아이템 선택 버튼 이벤트
  itemButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      itemButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentItem = btn.dataset.item;
      updateItemDisplay();
    });
  });

  // 강화 버튼 이벤트
  enhanceBtn.addEventListener("click", handleEnhance);

  // 초기화 버튼 이벤트
  resetBtn.addEventListener("click", handleReset);

  // 결과 오버레이 클릭 시 닫기
  resultOverlay.addEventListener("click", () => {
    resultOverlay.classList.remove("show");
    isEnhancing = false;
  });
}

// 화면 업데이트
function updateDisplay() {
  updateItemDisplay();
  updateEnhancementInfo();
  updateStats();
}

// 아이템 표시 업데이트
function updateItemDisplay() {
  const item = items[currentItem];
  currentItemImage.src = item.image;
  currentItemName.textContent = item.name;
  enhancementLevel.textContent = currentLevel > 0 ? `+${currentLevel}` : "+0";
}

// 강화 정보 업데이트
function updateEnhancementInfo() {
  currentLevelEl.textContent = currentLevel > 0 ? `${currentLevel}강` : "0강";

  if (currentLevel >= 15) {
    nextLevelEl.textContent = "최대 강화";
    enhancementCostEl.textContent = "-";
    successRateEl.textContent = "-";
    enhanceBtn.disabled = true;
    enhanceBtn.textContent = "최대 강화 달성";
  } else {
    const nextData = enhancementData[currentLevel];
    nextLevelEl.textContent = nextData.name;
    enhancementCostEl.textContent = nextData.price;
    successRateEl.textContent = nextData.probability;
    enhanceBtn.disabled = false;
    enhanceBtn.textContent = "강화하기";
  }
}

// 통계 업데이트
function updateStats() {
  totalCostEl.textContent = totalCost.toLocaleString() + "G";
  attemptCountEl.textContent = attemptCount + "회";
}

// 강화 처리
async function handleEnhance() {
  if (isEnhancing || currentLevel >= 15) return;

  isEnhancing = true;
  enhanceBtn.disabled = true;

  const enhanceData = enhancementData[currentLevel];
  const cost = parseInt(enhanceData.price.replace(/,/g, "").replace("G", ""));
  const probability = parseInt(enhanceData.probability.replace("%", ""));

  // 비용 추가
  totalCost += cost;
  attemptCount++;

  // 강화 애니메이션
  currentItemImage.style.animation = "glow 1s";

  // 1초 후 결과 판정
  setTimeout(() => {
    const success = Math.random() * 100 < probability;
    showResult(success, currentLevel + 1);

    if (success) {
      currentLevel++;
    }

    // 기록 추가
    addHistory(success, currentLevel);

    // 화면 업데이트
    updateDisplay();

    // 애니메이션 초기화
    setTimeout(() => {
      currentItemImage.style.animation = "";
    }, 100);
  }, 1000);
}

// 결과 표시
function showResult(success, targetLevel) {
  resultOverlay.classList.add("show");

  if (success) {
    resultEffect.textContent = "✨";
    resultMessage.textContent = `강화 성공! +${targetLevel}`;
    resultMessage.className = "result-message success";

    // 성공 사운드 효과 (선택사항)
    // playSound('success');
  } else {
    resultEffect.textContent = "💥";
    resultMessage.textContent = "강화 실패...";
    resultMessage.className = "result-message failure";

    // 실패 애니메이션
    currentItemImage.style.animation = "shake 0.5s";
    setTimeout(() => {
      currentItemImage.style.animation = "";
    }, 500);

    // 실패 사운드 효과 (선택사항)
    // playSound('failure');
  }

  // 2초 후 자동으로 닫기
  setTimeout(() => {
    resultOverlay.classList.remove("show");
    isEnhancing = false;
  }, 2000);
}

// 기록 추가
function addHistory(success, level) {
  // "기록 없음" 메시지 제거
  const noHistory = historyList.querySelector(".no-history");
  if (noHistory) {
    noHistory.remove();
  }

  const historyItem = document.createElement("div");
  historyItem.className = `history-item ${success ? "success" : "failure"}`;

  const item = items[currentItem];
  const time = new Date().toLocaleTimeString("ko-KR");

  historyItem.innerHTML = `
        <div class="history-item-text">
            ${time} - ${item.name} ${level - 1}강 → ${
    success ? level + "강" : "실패"
  }
        </div>
        <div class="history-item-badge">${success ? "성공" : "실패"}</div>
    `;

  historyList.insertBefore(historyItem, historyList.firstChild);

  // 최대 20개 기록만 유지
  while (historyList.children.length > 20) {
    historyList.removeChild(historyList.lastChild);
  }
}

// 초기화
function handleReset() {
  if (confirm("강화를 초기화하시겠습니까? (기록은 유지됩니다)")) {
    currentLevel = 0;
    totalCost = 0;
    attemptCount = 0;
    updateDisplay();
  }
}

// 전체 초기화 (기록 포함)
function handleFullReset() {
  if (confirm("모든 데이터를 초기화하시겠습니까?")) {
    currentLevel = 0;
    totalCost = 0;
    attemptCount = 0;
    historyList.innerHTML = '<p class="no-history">강화 기록이 없습니다.</p>';
    updateDisplay();
  }
}

// 페이지 로드 시 초기화
document.addEventListener("DOMContentLoaded", init);
