// 쿠킹 타이머 관련 DOM 요소들
let cookingTimerBtn, cookingTimerModal, closeCookingTimer, cookingTimerBody;

// 쿠킹 타이머 상태
let cookingTimerInterval = null;
let cookingTotalTime = 0;
let cookingCurrentTime = 0;
let cookingIsRunning = false;
let cookingWasRunningBeforeClose = false; // 모달 닫혀도 상태 유지
let cookingAudio = null;
let cookingSoundEnabled = true;
let cookingVolume = 0.5;

// 플로팅 위치/고정 상태
let floatingDragging = false;
let floatingPinned = false;
let floatingOffset = { x: 0, y: 0 };
let floatingPos = { left: null, top: null };

// 데이터 로드
let cookingTimesData = {};

async function loadCookingTimes() {
  try {
    const response = await fetch("data/cookingTimes.json");
    cookingTimesData = await response.json();
  } catch (error) {
    console.error("쿠킹 시간 데이터 로드 실패:", error);
  }
}

// 초기화
loadCookingTimes();

// 쿠킹 타이머 모달 열기
function openCookingTimer() {
  if (!cookingTimerModal || !cookingTimerBody) return;
  cookingTimerModal.classList.add("show");
  renderCookingTimer();
}

// 쿠킹 타이머 모달 닫기
function closeCookingTimerModal() {
  if (!cookingTimerModal) return;
  // 모달을 닫아도 타이머는 계속 유지 (UI만 닫음)
  cookingWasRunningBeforeClose = cookingIsRunning;
  cookingTimerModal.classList.remove("show");
}

// 쿠킹 타이머 렌더링
function renderCookingTimer() {
  if (!cookingTimerBody) return;

  const cookingTime = cookingTimesData.cooking?.defaultTime || 30;
  const bundleTime = cookingTimesData.bundle?.defaultTime || 3;
  const processingTime = cookingTimesData.processing?.defaultTime || 15;

  cookingTimerBody.innerHTML = `
    <div class="cooking-timer-container">
      <div class="cooking-timer-inputs">
        <div class="cooking-timer-input-group">
          <label>요리 개수</label>
          <input type="number" id="cookingCount" min="0" value="0" />
          <span class="cooking-timer-note">(개당 ${cookingTime}초)</span>
        </div>
        <div class="cooking-timer-input-group">
          <label>묶음 개수</label>
          <input type="number" id="bundleCount" min="0" value="0" />
          <span class="cooking-timer-note">(개당 ${bundleTime}초)</span>
        </div>
        <div class="cooking-timer-input-group">
          <label>가공 개수</label>
          <input type="number" id="processingCount" min="0" value="0" />
          <span class="cooking-timer-note">(개당 ${processingTime}초)</span>
        </div>
      </div>
      <div class="cooking-timer-settings">
        <div class="cooking-timer-setting-group">
          <label class="cooking-timer-setting-label">
            <input type="checkbox" id="cookingSoundToggle" ${
              cookingSoundEnabled ? "checked" : ""
            } />
            <span class="cooking-timer-checkmark"></span>
            완료 사운드 재생
          </label>
        </div>
        <div class="cooking-timer-setting-group">
          <label for="cookingVolumeSlider" class="cooking-timer-volume-label">볼륨</label>
          <div class="cooking-timer-volume-container">
            <input type="range" id="cookingVolumeSlider" min="0" max="1" step="0.1" value="${cookingVolume}" />
            <span id="cookingVolumeValue" class="cooking-timer-volume-value">${Math.round(
              cookingVolume * 100
            )}%</span>
          </div>
        </div>
        <div class="cooking-timer-test-group">
          <button id="testCookingSound" class="cooking-timer-test-btn">사운드 테스트</button>
          <button id="stopCookingSound" class="cooking-timer-stop-btn">끄기</button>
        </div>
      </div>
      <div class="cooking-timer-controls">
        <div class="cooking-timer-display" id="cookingTimerDisplay">00:00:00</div>
        <div class="cooking-timer-buttons">
          <button id="startCookingTimer" class="cooking-timer-action-btn">시작</button>
          <button id="stopCookingTimer" class="cooking-timer-action-btn" style="display:none;">정지</button>
          <button id="resetCookingTimer" class="cooking-timer-action-btn">초기화</button>
          <button id="stopAlarmSound" class="cooking-timer-alarm-btn">알람끄기</button>
        </div>
      </div>
    </div>
  `;

  // 이벤트 리스너
  const startBtn = cookingTimerBody.querySelector("#startCookingTimer");
  const stopBtn = cookingTimerBody.querySelector("#stopCookingTimer");
  const resetBtn = cookingTimerBody.querySelector("#resetCookingTimer");
  const cookingCount = cookingTimerBody.querySelector("#cookingCount");
  const bundleCount = cookingTimerBody.querySelector("#bundleCount");
  const processingCount = cookingTimerBody.querySelector("#processingCount");
  const soundToggle = cookingTimerBody.querySelector("#cookingSoundToggle");
  const volumeSlider = cookingTimerBody.querySelector("#cookingVolumeSlider");
  const volumeValue = cookingTimerBody.querySelector("#cookingVolumeValue");
  const testSoundBtn = cookingTimerBody.querySelector("#testCookingSound");
  const stopSoundBtn = cookingTimerBody.querySelector("#stopCookingSound");
  const stopAlarmBtn = cookingTimerBody.querySelector("#stopAlarmSound");

  startBtn?.addEventListener("click", startCookingTimer);
  stopBtn?.addEventListener("click", stopCookingTimer);
  resetBtn?.addEventListener("click", resetCookingTimer);
  cookingCount?.addEventListener("input", updateCookingTimer);
  bundleCount?.addEventListener("input", updateCookingTimer);
  processingCount?.addEventListener("input", updateCookingTimer);
  soundToggle?.addEventListener("change", toggleCookingSound);
  volumeSlider?.addEventListener("input", updateCookingVolume);
  testSoundBtn?.addEventListener("click", testCookingSound);
  stopSoundBtn?.addEventListener("click", stopCookingSound);
  stopAlarmBtn?.addEventListener("click", stopAlarmSound);

  updateCookingTimer();
}

// 시간 업데이트
function updateCookingTimer() {
  const cookingCount = parseInt(
    document.getElementById("cookingCount")?.value || 0
  );
  const bundleCount = parseInt(
    document.getElementById("bundleCount")?.value || 0
  );
  const processingCount = parseInt(
    document.getElementById("processingCount")?.value || 0
  );

  const cookingTime = cookingTimesData.cooking?.defaultTime || 30;
  const bundleTime = cookingTimesData.bundle?.defaultTime || 3;
  const processingTime = cookingTimesData.processing?.defaultTime || 15;

  cookingTotalTime =
    cookingCount * cookingTime +
    bundleCount * bundleTime +
    processingCount * processingTime;

  const display = cookingTimerBody.querySelector("#cookingTimerDisplay");
  if (display && !cookingIsRunning) {
    display.textContent = formatCookingTime(cookingTotalTime);
  }
  // 플로팅 업데이트
  const floatingDisplay = document.getElementById(
    "cookingTimerFloatingDisplay"
  );
  const floating = document.getElementById("cookingTimerFloating");
  if (floatingDisplay) {
    const seconds = cookingIsRunning ? cookingCurrentTime : cookingTotalTime;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    floatingDisplay.textContent = `${String(minutes).padStart(2, "0")}:${String(
      secs
    ).padStart(2, "0")}`;
  }
  if (floating) {
    floating.style.display =
      cookingCurrentTime > 0 || cookingTotalTime > 0 ? "block" : "none";
  }
}

// 쿠킹 타이머 시작
function startCookingTimer() {
  if (cookingIsRunning || cookingTotalTime === 0) return;

  cookingIsRunning = true;
  cookingCurrentTime = cookingTotalTime;

  const display = cookingTimerBody.querySelector("#cookingTimerDisplay");
  const startBtn = cookingTimerBody.querySelector("#startCookingTimer");
  const stopBtn = cookingTimerBody.querySelector("#stopCookingTimer");

  if (startBtn) startBtn.style.display = "none";
  if (stopBtn) stopBtn.style.display = "inline-block";

  // 플로팅 아이콘을 일시정지 모양으로
  const floatingIcon = document.getElementById("cookingTimerFloatingIcon");
  if (floatingIcon) {
    floatingIcon.innerHTML =
      '<path d="M6 5h4v14H6zM14 5h4v14h-4z"></path>'; // pause
  }

  cookingTimerInterval = setInterval(() => {
    cookingCurrentTime--;

    if (display) {
      display.textContent = formatCookingTime(cookingCurrentTime);
    }
    // 플로팅 남은시간 갱신
    const floatingDisplay = document.getElementById(
      "cookingTimerFloatingDisplay"
    );
    if (floatingDisplay) {
      const minutes = Math.floor(cookingCurrentTime / 60);
      const secs = cookingCurrentTime % 60;
      floatingDisplay.textContent = `${String(minutes).padStart(
        2,
        "0"
      )}:${String(secs).padStart(2, "0")}`;
    }

    if (cookingCurrentTime <= 0) {
      stopCookingTimer();
      playCookingCompleteSound();
    }
  }, 1000);
}

// 쿠킹 타이머 정지
function stopCookingTimer() {
  if (cookingTimerInterval) {
    clearInterval(cookingTimerInterval);
    cookingTimerInterval = null;
  }

  cookingIsRunning = false;

  const startBtn = cookingTimerBody.querySelector("#startCookingTimer");
  const stopBtn = cookingTimerBody.querySelector("#stopCookingTimer");

  if (startBtn) startBtn.style.display = "inline-block";
  if (stopBtn) stopBtn.style.display = "none";

  // 플로팅 아이콘 상태를 재생으로 복귀
  const floatingIcon = document.getElementById("cookingTimerFloatingIcon");
  if (floatingIcon) {
    floatingIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
  }
}

// 쿠킹 타이머 초기화
function resetCookingTimer() {
  stopCookingTimer();
  cookingCurrentTime = 0;
  cookingTotalTime = 0;

  const cookingCount = document.getElementById("cookingCount");
  const bundleCount = document.getElementById("bundleCount");
  const processingCount = document.getElementById("processingCount");

  if (cookingCount) cookingCount.value = 0;
  if (bundleCount) bundleCount.value = 0;
  if (processingCount) processingCount.value = 0;

  const display = cookingTimerBody.querySelector("#cookingTimerDisplay");
  if (display) display.textContent = "00:00:00";

  // 플로팅 표시 리셋
  const floatingDisplay = document.getElementById(
    "cookingTimerFloatingDisplay"
  );
  if (floatingDisplay) floatingDisplay.textContent = "00:00";
}

// 시간 포맷팅
function formatCookingTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(secs).padStart(2, "0")}`;
}

// 사운드 토글
function toggleCookingSound() {
  const soundToggle = document.getElementById("cookingSoundToggle");
  cookingSoundEnabled = soundToggle.checked;
}

// 볼륨 업데이트
function updateCookingVolume() {
  const volumeSlider = document.getElementById("cookingVolumeSlider");
  const volumeValue = document.getElementById("cookingVolumeValue");

  cookingVolume = parseFloat(volumeSlider.value);
  volumeValue.textContent = `${Math.round(cookingVolume * 100)}%`;
}

// 테스트 사운드 재생
function testCookingSound() {
  if (!cookingSoundEnabled) {
    alert("사운드가 비활성화되어 있습니다.");
    return;
  }

  if (cookingAudio) {
    cookingAudio.pause();
    cookingAudio.currentTime = 0;
  }

  cookingAudio = new Audio("bgm/cooking-complete.mp3");
  cookingAudio.volume = cookingVolume;
  cookingAudio.play().catch((error) => {
    console.error("테스트 사운드 재생 실패:", error);
    alert("테스트 사운드 재생에 실패했습니다.");
  });
}

// 사운드 끄기
function stopCookingSound() {
  if (cookingAudio) {
    cookingAudio.pause();
    cookingAudio.currentTime = 0;
  }
}

// 알람 끄기 (즉시 사운드 중지)
function stopAlarmSound() {
  if (cookingAudio) {
    cookingAudio.pause();
    cookingAudio.currentTime = 0;
  }
}

// 완료 소리 재생
function playCookingCompleteSound() {
  if (!cookingSoundEnabled) {
    return;
  }

  if (cookingAudio) {
    cookingAudio.pause();
    cookingAudio.currentTime = 0;
  }

  cookingAudio = new Audio("bgm/cooking-complete.mp3");
  cookingAudio.volume = cookingVolume;
  cookingAudio.play().catch((error) => {
    console.error("소리 재생 실패:", error);
  });
}

// 플로팅 상태 저장/복원
function saveFloatingState() {
  try {
    localStorage.setItem(
      "cookingFloatingPinned",
      floatingPinned ? "1" : "0"
    );
    if (floatingPos.left !== null && floatingPos.top !== null) {
      localStorage.setItem(
        "cookingFloatingPos",
        JSON.stringify({ left: floatingPos.left, top: floatingPos.top })
      );
    }
  } catch (e) {
    // 무시
  }
}

function loadFloatingState() {
  try {
    const p = localStorage.getItem("cookingFloatingPinned");
    floatingPinned = p === "1";
    const pos = localStorage.getItem("cookingFloatingPos");
    if (pos) {
      const o = JSON.parse(pos);
      if (typeof o.left === "number" && typeof o.top === "number") {
        floatingPos.left = o.left;
        floatingPos.top = o.top;
      }
    }
  } catch (e) {
    // 무시
  }
}

// 플로팅 드래그 초기화
function initFloatingDrag(floatingEl, innerEl) {
  if (!floatingEl || !innerEl) return;

  // make floating fixed for free movement
  floatingEl.style.position = "fixed";
  // default position if none saved
  if (floatingPos.left === null || floatingPos.top === null) {
    floatingEl.style.right = "20px";
    floatingEl.style.bottom = "120px";
  } else {
    floatingEl.style.left = floatingPos.left + "px";
    floatingEl.style.top = floatingPos.top + "px";
    // remove right/bottom to avoid conflicts
    floatingEl.style.right = "auto";
    floatingEl.style.bottom = "auto";
  }

  function onPointerDown(e) {
    // ignore when clicking buttons or inputs inside
    if (e.target.closest("button") || e.target.closest("input")) return;
    // allow free movement (no pin UI)
    floatingDragging = true;
    const rect = floatingEl.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    floatingOffset.x = clientX - rect.left;
    floatingOffset.y = clientY - rect.top;
    innerEl.style.cursor = "grabbing";
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!floatingDragging) return;
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    if (clientX == null || clientY == null) return;
    let left = clientX - floatingOffset.x;
    let top = clientY - floatingOffset.y;

    // Constrain within viewport with small padding
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const elRect = floatingEl.getBoundingClientRect();
    left = Math.max(8, Math.min(vw - elRect.width - 8, left));
    top = Math.max(8, Math.min(vh - elRect.height - 8, top));

    floatingEl.style.left = left + "px";
    floatingEl.style.top = top + "px";
    floatingEl.style.right = "auto";
    floatingEl.style.bottom = "auto";

    // store for saving at end
    floatingPos.left = left;
    floatingPos.top = top;
  }

  function onPointerUp() {
    if (!floatingDragging) return;
    floatingDragging = false;
    innerEl.style.cursor = "pointer";
    saveFloatingState();
  }

  // pointer events (works with mouse & touch)
  innerEl.addEventListener("pointerdown", onPointerDown, { passive: false });
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", onPointerUp);
}

// 이벤트 리스너 등록
document.addEventListener("DOMContentLoaded", () => {
  cookingTimerBtn = document.getElementById("cookingTimerBtn");
  cookingTimerModal = document.getElementById("cookingTimerModal");
  closeCookingTimer = document.getElementById("closeCookingTimer");
  cookingTimerBody = document.getElementById("cookingTimerBody");
  // 플로팅 컨트롤
  const floating = document.getElementById("cookingTimerFloating");
  const floatingDisplay = document.getElementById(
    "cookingTimerFloatingDisplay"
  );
  const floatingToggle = document.getElementById("cookingTimerFloatingToggle");
  const floatingIcon = document.getElementById("cookingTimerFloatingIcon");
  const floatingStop = document.getElementById("cookingTimerFloatingStop");

  // load saved floating state
  loadFloatingState();

  // ensure floating is movable (remove pin UI)
  if (floating) {
    let inner = document.getElementById("cookingTimerFloatingInner");
    if (inner) {
      // initialize drag (no pin button)
      initFloatingDrag(floating, inner);
    }
  }

  if (cookingTimerBtn) {
    cookingTimerBtn.addEventListener("click", openCookingTimer);
  }

  if (closeCookingTimer) {
    closeCookingTimer.addEventListener("click", closeCookingTimerModal);
  }

  if (cookingTimerModal) {
    // 클릭으로 닫기 (더 정확한 타겟 감지)
    cookingTimerModal.addEventListener("click", (e) => {
      // 모달 배경을 직접 클릭했을 때만 닫기
      if (
        e.target === cookingTimerModal &&
        e.target !== e.currentTarget.querySelector(".cooking-timer-content")
      ) {
        closeCookingTimerModal();
      }
    });

    // 드래그로 닫기 방지 (터치 이벤트)
    cookingTimerModal.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    cookingTimerModal.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
  }

  // 플로팅 컨트롤 핸들러
  if (floating && floatingToggle && floatingStop) {
    // ensure floating shows when there's time
    // set initial icon according to running state
    if (floatingIcon) {
      floatingIcon.innerHTML = cookingIsRunning
        ? '<path d="M6 5h4v14H6zM14 5h4v14h-4z"></path>'
        : '<path d="M8 5v14l11-7z"></path>';
    }

    floatingToggle.addEventListener("click", () => {
      if (cookingIsRunning) {
        stopCookingTimer();
        // 일시정지 아이콘 -> 재생 아이콘
        if (floatingIcon) floatingIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
      } else {
        // 남은 시간이 있으면 재개
        if (cookingCurrentTime > 0) {
          startCookingTimer();
          // 재생 아이콘 -> 일시정지 아이콘
          if (floatingIcon)
            floatingIcon.innerHTML = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"></path>';
        }
      }
    });

    floatingStop.addEventListener("click", () => {
      stopCookingTimer();
      cookingCurrentTime = 0;
      if (floatingDisplay) floatingDisplay.textContent = "00:00";
      // 아이콘을 재생으로 복귀
      if (floatingIcon) floatingIcon.innerHTML = '<path d="M8 5v14l11-7z"></path>';
      // 알람 사운드 즉시 중지
      stopAlarmSound();
    });
  }
});

// ESC 키로 모달 닫기
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (cookingTimerModal && cookingTimerModal.classList.contains("show")) {
      closeCookingTimerModal();
    }
  }
});