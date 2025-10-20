// ===== 공지사항 관련 함수 =====
let announcementData = [];
const announcementPanel = document.getElementById("announcementPanel");
const announcementContent = document.getElementById("announcementContent");
const closeAnnouncementBtn = document.getElementById("closeAnnouncementBtn");

// 쿠키 관련 유틸리티 함수들 (script.js에서 정의됨)
// setCookie, getCookie 함수는 script.js에서 전역으로 정의되어 있음

// 공지사항 데이터 로드
async function loadAnnouncements() {
  try {
    const response = await fetch("data/notice.json");
    announcementData = await response.json();
    renderAnnouncements();
  } catch (error) {
    console.error("공지사항 로드 실패:", error);
    if (announcementContent) {
      announcementContent.innerHTML = `<div class="announcement-empty">공지사항을 불러올 수 없습니다.</div>`;
    }
  }
}

// 공지사항 렌더링
function renderAnnouncements() {
  if (!announcementContent) return;

  if (
    !announcementData.announcements ||
    announcementData.announcements.length === 0
  ) {
    announcementContent.innerHTML = `<div class="announcement-empty">공지사항이 없습니다.</div>`;
    return;
  }

  const html = announcementData.announcements
    .map((announcement) => {
      const formattedDate = formatAnnouncementDate(announcement.date);
      return `
        <div class="announcement-item ${announcement.type}">
          <div class="announcement-item-header">
            <span class="announcement-icon">${announcement.icon || "📌"}</span>
            <span class="announcement-title">${announcement.title}</span>
            <span class="announcement-date">${formattedDate}</span>
          </div>
          <div class="announcement-text">${announcement.content}</div>
        </div>
      `;
    })
    .join("");

  announcementContent.innerHTML = html;
}

// 공지사항 날짜 포맷팅 (예: "2025-10-20" -> "10월 20일")
function formatAnnouncementDate(dateString) {
  try {
    const date = new Date(dateString + "T00:00:00");
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 오늘 날짜 확인
    if (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    ) {
      return "오늘";
    }

    // 어제 날짜 확인
    if (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    ) {
      return "어제";
    }

    // 일반 날짜
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}월 ${day}일`;
  } catch (_) {
    return dateString;
  }
}

// 공지 패널 토글
function toggleAnnouncementPanel() {
  if (!announcementPanel || !closeAnnouncementBtn) return;

  const isCollapsed = announcementPanel.classList.contains("collapsed");

  if (isCollapsed) {
    // 펼치기
    announcementPanel.classList.remove("collapsed");
    closeAnnouncementBtn.textContent = "−";
    closeAnnouncementBtn.title = "공지 접기";
    setCookie("announcementPanelCollapsed", "false", 30);
  } else {
    // 접기
    announcementPanel.classList.add("collapsed");
    closeAnnouncementBtn.textContent = "+";
    closeAnnouncementBtn.title = "공지 펼치기";
    setCookie("announcementPanelCollapsed", "true", 30);
  }
}

// 공지 패널 상태 복구
function restoreAnnouncementPanelState() {
  const collapsed = getCookie("announcementPanelCollapsed");
  if (collapsed === "true" && announcementPanel && closeAnnouncementBtn) {
    announcementPanel.classList.add("collapsed");
    closeAnnouncementBtn.textContent = "+";
    closeAnnouncementBtn.title = "공지 펼치기";
  }
}

// 공지 토글 버튼 이벤트
if (closeAnnouncementBtn) {
  closeAnnouncementBtn.addEventListener("click", toggleAnnouncementPanel);
}

// 접힌 상태에서 헤더 클릭으로 펼치기
if (announcementPanel) {
  const announcementHeader = announcementPanel.querySelector(
    ".announcement-header"
  );
  if (announcementHeader) {
    announcementHeader.addEventListener("click", (e) => {
      // 버튼 클릭은 제외 (버튼이 이미 토글 처리)
      if (
        e.target === closeAnnouncementBtn ||
        e.target.closest(".close-announcement-btn")
      ) {
        return;
      }
      // 접힌 상태일 때만 헤더 클릭으로 펼치기
      if (announcementPanel.classList.contains("collapsed")) {
        toggleAnnouncementPanel();
      }
    });
  }
}

// 공지사항 초기화 함수
function initializeNotice() {
  // 공지사항 로드 및 복구
  loadAnnouncements();
  restoreAnnouncementPanelState();
}

// DOM이 로드된 후 초기화 실행
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeNotice);
} else {
  initializeNotice();
}
