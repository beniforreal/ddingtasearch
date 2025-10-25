// 지역별 상품 데이터 (JSON에서 로드)
let regionData = {};
let ingredientDetails = {};
let expertiseData = {};

// DOM 요소들
const floatingSearchInput = document.getElementById("floatingSearchInput");
const tableBody = document.getElementById("tableBody");
const tabButtons = document.querySelectorAll(".tab-button");
const sectionTabs = document.getElementById("sectionTabs");
const sectionButtons = document.querySelectorAll(".section-button");
const priceHeader = document.getElementById("priceHeader");
const itemHeader = document.getElementById("itemHeader");
const itemHeaderText = document.getElementById("itemHeaderText");
const collectionInfo = document.getElementById("collectionInfo");
const costHeader = document.getElementById("costHeader");
const cookingLegend = document.getElementById("cookingLegend");
const cookingInfo = document.getElementById("cookingInfo");
const priceTimer = document.getElementById("priceTimer");
const timerDisplay = document.getElementById("timerDisplay");
const themeSwitch = document.getElementById("themeSwitch");
const toggleAllIcon = document.getElementById("toggleAllIcon");
const footerSearch = document.getElementById("footerSearch");
const calculatorBtn = document.getElementById("calculatorBtn");
const calculatorModal = document.getElementById("calculatorModal");
const closeCalculator = document.getElementById("closeCalculator");
const calculatorBody = document.getElementById("calculatorBody");

// 현재 선택된 지역과 섹션
let currentRegion = "wild";
let currentSection = "sell";

// 타이머 관련 변수
let timerInterval = null;
let originalTimerPosition = null;

// 요리 가격 변동일 (매월 1, 3, 9, 12, 15, 18, 21, 24, 27, 30일 오전 3시)
const priceChangeDays = [1, 3, 9, 12, 15, 18, 21, 24, 27, 30];

// 쿠키 관련 유틸리티 함수들
function setCookie(name, value, days = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

// ===== 요리 가격 저장소 (쿠키) =====
let cookingPriceStore = {};

function loadCookingPrices() {
  try {
    const raw = getCookie("cookingPrices");
    cookingPriceStore = raw ? JSON.parse(raw) : {};
  } catch (_) {
    cookingPriceStore = {};
  }
}

function saveCookingPrices() {
  try {
    setCookie("cookingPrices", JSON.stringify(cookingPriceStore));
  } catch (_) {
    /* ignore */
  }
}

function setCookingPrice(itemName, price) {
  if (!itemName) return;
  if (price === "" || price === null || isNaN(Number(price))) {
    delete cookingPriceStore[itemName];
  } else {
    cookingPriceStore[itemName] = Number(price);
  }
  saveCookingPrices();
}

function clearCookingPrices() {
  cookingPriceStore = {};
  saveCookingPrices();
}

// 컬렉션북 체크 상태 관리
let collectionCheckedItems = new Set();

// To-Do 로직은 todo.js로 분리됨 (함수들은 todo.js에서 정의)

// 드롭존 위치 업데이트 함수
function updateDropZonePosition() {
  const dropZone = document.getElementById("todoDropZone");
  const sidebarPanel = document.querySelector(".sidebar-panel");

  if (!dropZone || !sidebarPanel) return;

  // 사이드바의 실제 위치 계산
  const rect = sidebarPanel.getBoundingClientRect();
  dropZone.style.left = `${rect.left}px`;
  dropZone.style.width = `${rect.width}px`;
}

// 드래그 앤 드롭 기능 초기화
function initializeDragAndDrop() {
  const sidebarPanel = document.querySelector(".sidebar-panel");
  if (!sidebarPanel) return;

  // 드롭 존 설정
  let dragDepth = 0; // dragenter/leaves 추적

  sidebarPanel.addEventListener("dragover", (e) => {
    // 헤더나 입력 영역에서는 드래그 무시
    if (
      e.target.closest(".todo-header") ||
      e.target.closest(".todo-input-container")
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    sidebarPanel.classList.add("drag-over");
  });

  sidebarPanel.addEventListener("dragenter", (e) => {
    // 헤더나 입력 영역에서는 드래그 무시
    if (
      e.target.closest(".todo-header") ||
      e.target.closest(".todo-input-container")
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    dragDepth++;
    sidebarPanel.classList.add("drag-over");
  });

  sidebarPanel.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    // sidebar-panel를 완전히 벗어났을 때만 drag-over 제거
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) sidebarPanel.classList.remove("drag-over");
  });

  sidebarPanel.addEventListener("drop", (e) => {
    // 드롭존이 활성화되어 있으면 무시 (드롭존이 처리)
    const dropZone = document.getElementById("todoDropZone");
    if (dropZone && dropZone.classList.contains("active")) {
      return;
    }

    // 헤더나 입력 영역에서는 드롭 무시
    if (
      e.target.closest(".todo-header") ||
      e.target.closest(".todo-input-container")
    ) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    dragDepth = 0;
    sidebarPanel.classList.remove("drag-over");
    sidebarPanel.classList.remove("dragging-active");

    const draggedText = e.dataTransfer.getData("text/plain");
    if (draggedText) {
      addTodoItem(draggedText);
    }
  });

  // 스크롤 자동 처리
  let scrollInterval = null;

  sidebarPanel.addEventListener("dragover", (e) => {
    // 헤더나 입력 영역에서는 스크롤 처리 무시
    if (
      e.target.closest(".todo-header") ||
      e.target.closest(".todo-input-container")
    ) {
      return;
    }

    const rect = sidebarPanel.getBoundingClientRect();
    const scrollThreshold = 50; // 스크롤 시작 임계값

    // 상단 근처에서 스크롤 업
    if (e.clientY - rect.top < scrollThreshold) {
      if (!scrollInterval) {
        scrollInterval = setInterval(() => {
          sidebarPanel.scrollTop -= 10;
        }, 16); // 60fps
      }
    }
    // 하단 근처에서 스크롤 다운
    else if (rect.bottom - e.clientY < scrollThreshold) {
      if (!scrollInterval) {
        scrollInterval = setInterval(() => {
          sidebarPanel.scrollTop += 10;
        }, 16); // 60fps
      }
    }
    // 중간 영역에서는 스크롤 중지
    else {
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
    }
  });

  // 드래그 종료 시 스크롤 중지
  document.addEventListener("dragend", () => {
    if (scrollInterval) {
      clearInterval(scrollInterval);
      scrollInterval = null;
    }
    dragDepth = 0;
    sidebarPanel.classList.remove("drag-over");
    sidebarPanel.classList.remove("dragging-active");

    // 드롭 존 숨기기
    const dropZone = document.getElementById("todoDropZone");
    if (dropZone) {
      dropZone.classList.remove("active");
    }
  });

  // To-Do 드롭 존 설정
  const dropZone = document.getElementById("todoDropZone");
  if (dropZone) {
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    dropZone.addEventListener("dragenter", (e) => {
      e.preventDefault();
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const draggedText = e.dataTransfer.getData("text/plain");
      if (draggedText) {
        addTodoItem(draggedText);
      }

      // 드롭 존 숨기기
      dropZone.classList.remove("active");
      sidebarPanel.classList.remove("dragging-active");
      sidebarPanel.classList.remove("drag-over");
      dragDepth = 0;
    });
  }
}

// 컬렉션북 체크 상태 로드
function loadCollectionCheckedItems() {
  try {
    const saved = getCookie("collectionChecked");
    if (saved) {
      const items = JSON.parse(saved);
      collectionCheckedItems = new Set(items);
    }
  } catch (_) {
    // 쿠키 접근 실패 시 무시
  }
}

// 컬렉션북 체크 상태 저장
function saveCollectionCheckedItems() {
  try {
    const items = Array.from(collectionCheckedItems);
    setCookie("collectionChecked", JSON.stringify(items));
  } catch (_) {
    // 쿠키 저장 실패 시 무시
  }
}

// 컬렉션북 아이템 체크 토글
function toggleCollectionItem(itemName) {
  if (collectionCheckedItems.has(itemName)) {
    collectionCheckedItems.delete(itemName);
  } else {
    collectionCheckedItems.add(itemName);
  }
  saveCollectionCheckedItems();
  // 현재 표시된 테이블 다시 렌더링
  if (floatingSearchInput.value.trim() !== "") {
    searchProducts();
  } else {
    renderTable(getCurrentProducts());
  }
  // 컬렉션북 진행률 업데이트
  if (currentRegion === "collection") {
    updateCollectionProgress();
  }
}

// 컬렉션북 진행률 계산 및 표시
function updateCollectionProgress() {
  if (currentRegion !== "collection") return;

  const currentItems = regionData.collection[currentSection] || [];
  const totalItems = currentItems.length;
  const checkedItems = currentItems.filter((item) =>
    collectionCheckedItems.has(item.name)
  ).length;
  const remainingItems = totalItems - checkedItems;

  // 진행률 퍼센트 계산
  const progressPercent =
    totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  // 진행률 UI 생성 또는 업데이트
  let progressElement = document.getElementById("collectionProgress");
  if (!progressElement) {
    progressElement = document.createElement("div");
    progressElement.id = "collectionProgress";
    progressElement.className = "collection-progress";

    // 섹션 탭 다음에 삽입
    const sectionTabs = document.getElementById("sectionTabs");
    if (sectionTabs && sectionTabs.nextSibling) {
      sectionTabs.parentNode.insertBefore(
        progressElement,
        sectionTabs.nextSibling
      );
    } else if (sectionTabs) {
      sectionTabs.parentNode.appendChild(progressElement);
    }
  }

  // 섹션명 한글 변환
  const sectionNames = {
    blocks: "블록",
    nature: "자연",
    loot: "전리품",
    collectibles: "수집품",
  };

  const sectionName = sectionNames[currentSection] || currentSection;

  // 100% 완료 시 골드 애니메이션 클래스 추가
  const completedClass = progressPercent === 100 ? " completed" : "";

  progressElement.innerHTML = `
    <div class="progress-container">
      <div class="progress-header">
        <span class="progress-title">${sectionName} 컬렉션 진행률</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill${completedClass}" style="width: ${progressPercent}%">

        </div>
        <div class="progress-badge">${progressPercent}%</div>
      </div>
      <div class="progress-stats">
        <span class="percentage">
          <span class="number">${progressPercent}%</span>
          완료율
        </span>
        <span class="completed">
          <span class="number">${checkedItems}</span>
          완료
        </span>
        <span class="remaining">
          <span class="number">${remainingItems}</span>
          남음
        </span>
      </div>
    </div>
  `;

  progressElement.style.display = "block";
}

// 컬렉션북 진행률 숨기기
function hideCollectionProgress() {
  const progressElement = document.getElementById("collectionProgress");
  if (progressElement) {
    progressElement.style.display = "none";
  }
}

// 다음 가격 변동 시간 계산
function getNextPriceChangeTime() {
  const now = new Date();
  const currentDay = now.getDate();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentSecond = now.getSeconds();

  // 현재 시간이 오전 3시 이전인지 확인
  const isBefore3AM = currentHour < 3;

  // 오늘 날짜 기준으로 다음 변동일 찾기
  let nextChangeDay = null;
  let nextChangeDate = null;

  // 오늘 오전 3시가 지났는지 확인
  if (isBefore3AM && priceChangeDays.includes(currentDay)) {
    // 오늘 오전 3시가 아직 안 지났고, 오늘이 변동일이면 오늘 오전 3시
    nextChangeDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      currentDay,
      3,
      0,
      0
    );
  } else {
    // 다음 변동일 찾기
    for (let i = 0; i < priceChangeDays.length; i++) {
      const changeDay = priceChangeDays[i];
      if (changeDay > currentDay) {
        nextChangeDay = changeDay;
        break;
      }
    }

    // 이번 달에 다음 변동일이 없으면 다음 달 첫 번째 변동일
    if (nextChangeDay === null) {
      nextChangeDay = priceChangeDays[0];
      nextChangeDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        nextChangeDay,
        3,
        0,
        0
      );
    } else {
      nextChangeDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        nextChangeDay,
        3,
        0,
        0
      );
    }
  }

  return nextChangeDate;
}

// 타이머 업데이트 함수
function updateTimer() {
  const nextChangeTime = getNextPriceChangeTime();
  const now = new Date();
  const timeDiff = nextChangeTime.getTime() - now.getTime();

  if (timeDiff <= 0) {
    // 시간이 지났으면 다음 변동일로 업데이트
    const nextChangeTime = getNextPriceChangeTime();
    const newTimeDiff = nextChangeTime.getTime() - now.getTime();
    updateTimerDisplay(newTimeDiff);
  } else {
    updateTimerDisplay(timeDiff);
  }
}

// 타이머 표시 업데이트
function updateTimerDisplay(timeDiff) {
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  const prev = timerDisplay.textContent;
  timerDisplay.textContent = `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;

  // 타이머가 0으로 리셋되는 순간 감지 -> 저장된 요리 가격 초기화
  if (prev && prev !== timerDisplay.textContent) {
    const reachedZero = /^0일 0시간 0분 0초$/.test(prev);
    if (reachedZero) {
      clearCookingPrices();
    }
  }
}

// 타이머 시작
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }
  updateTimer(); // 즉시 한 번 실행
  timerInterval = setInterval(updateTimer, 1000);
}

// 타이머 중지
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// 스크롤 이벤트 핸들러
function handleScroll() {
  if (!priceTimer) return;

  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  // 원래 위치 저장 (한 번만)
  if (originalTimerPosition === null) {
    const rect = priceTimer.getBoundingClientRect();
    originalTimerPosition = rect.top + scrollTop;
  }

  // 스크롤이 원래 위치를 넘어가면 고정, 그렇지 않으면 원래 위치로
  if (scrollTop > originalTimerPosition) {
    priceTimer.classList.add("fixed");
  } else {
    priceTimer.classList.remove("fixed");
  }
}

// 검색 결과를 카테고리별로 렌더링하는 함수
function renderTableWithCategories(
  categorizedData,
  uncategorizedItems,
  isSearchResult = false
) {
  const container = document.querySelector(".table-container");
  container.innerHTML = "";

  // 카테고리별로 렌더링
  Object.keys(categorizedData).forEach((category) => {
    const products = categorizedData[category];
    if (products.length === 0) return;

    // 첫 번째 아이템으로 타입 판단
    const firstItem = products[0];
    const isCooking = firstItem.itemType === "cooking";
    const isEnhancement = category.startsWith("세레니티 - 강화");

    // 카테고리 제목
    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "process-category-title";

    // 이미지 이름 추출 (가장 오른쪽 토큰 사용: 예 "세레니티 - 판매 - 카이" -> "카이")
    let imageName = category;
    if (category.includes(" - ")) {
      const parts = category.split(" - ");
      imageName = parts[parts.length - 1].trim();
    }
    const fileName = imageName.replace(/\//g, ":");

    // 카테고리 이미지 추가
    const categoryImage = document.createElement("img");
    // 도구 강화인 경우 img/ 폴더, 그 외에는 img/npcs/ 폴더
    const isToolEnhancement = category.startsWith("세레니티 - 강화 - 세이지");
    // 도구 강화인 경우 공백 제거
    const imageFileName = isToolEnhancement
      ? fileName.replace(/\s+/g, "")
      : fileName;
    categoryImage.src = isToolEnhancement
      ? `img/${imageFileName}.png`
      : `img/npcs/${fileName}.png`;
    categoryImage.alt = imageName;
    categoryImage.className = "npc-icon";
    categoryImage.style.cursor = "pointer";
    categoryImage.onerror = function () {
      this.style.display = "none";
    };

    categoryImage.addEventListener("click", () => {
      showNpcModal(categoryImage.src, imageName);
    });

    categoryTitle.appendChild(categoryImage);

    const categoryText = document.createElement("span");
    categoryText.textContent = category;
    categoryTitle.appendChild(categoryText);

    container.appendChild(categoryTitle);

    // 테이블 생성
    const table = document.createElement("table");
    if (isCooking) {
      table.className = "cooking-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>
              <button
                id="toggleAllIcon-${category.replace(/\s+/g, "-")}"
                class="toggle-all-icon"
                title="전체 열기/닫기"
                aria-label="전체 열기/닫기"
              >
                <span class="row-toggle" aria-hidden="true">▶</span>
              </button>
              <span>요리명</span>
            </th>
            <th>가격 범위</th>
            <th>원재료 비용</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
    } else if (isEnhancement) {
      // 도구 강화 아이템이 있는지 확인
      const hasToolEnhancement = products.some((p) => p.isToolEnhancement);

      if (hasToolEnhancement) {
        // 도구 강화 테이블
        table.className = "tool-enhancement-table";
        const toolItem = products.find((p) => p.isToolEnhancement);
        const toolData = regionData.grindel?.toolEnhancement?.find(
          (t) => t.name === toolItem.toolName
        );

        if (toolData && toolData.headers) {
          const thead = document.createElement("thead");
          const headerRow = document.createElement("tr");
          toolData.headers.forEach((header) => {
            const th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
          });
          thead.appendChild(headerRow);
          table.appendChild(thead);

          const tbody = document.createElement("tbody");
          table.appendChild(tbody);
        } else {
          table.innerHTML = `
            <thead>
              <tr>
                <th>품목</th>
                <th>필요 재료</th>
                <th>필요 골드</th>
              </tr>
            </thead>
            <tbody></tbody>
          `;
        }
      } else {
        // 일반 강화 테이블
        table.className = "enhancement-table";
        table.innerHTML = `
          <thead>
            <tr>
              <th>품목</th>
              <th>필요 재료</th>
              <th>필요 골드</th>
            </tr>
          </thead>
          <tbody></tbody>
        `;
      }
    } else {
      table.innerHTML = `
        <thead>
          <tr>
            <th>품목</th>
            <th>${firstItem.recipe ? "재료" : "판매 가격"}</th>
          </tr>
        </thead>
        <tbody></tbody>
      `;
    }

    const tbody = table.querySelector("tbody");

    products.forEach((product) => {
      if (isCooking) {
        // 요리 아이템 렌더링
        const searchTerm = (floatingSearchInput.value || "")
          .toLowerCase()
          .trim();
        const recipeText = product.recipe || product.ingredients || "";
        const nameMatch = (product.name || "")
          .toLowerCase()
          .includes(searchTerm);
        const shouldExpand =
          !!searchTerm &&
          (recipeText.toLowerCase().includes(searchTerm) || nameMatch);
        const toggleIcon = recipeText
          ? `<span class="row-toggle ${
              shouldExpand ? "expanded" : ""
            }" aria-hidden="true">▶</span>`
          : "";

        const row = document.createElement("tr");
        if (recipeText) row.classList.add("collapsible");

        const itemImage = product.image
          ? `<img src="${product.image}" alt="${product.name}" class="cooking-item-image" />`
          : "";
        const priceDisplay = product.price.includes("-")
          ? product.price.replace(/-/g, " - ")
          : product.price;

        const costInfo = computeTotalIngredientCost(recipeText);
        const suffix = costInfo.unknownCount > 0 ? " (일부 제외)" : "";
        const costCellHtml = `<td class="price-cost">${formatNumber(
          costInfo.total
        )} G${suffix}</td>`;

        row.innerHTML = `
          <td>${toggleIcon}${itemImage}${product.name}</td>
          <td class="price">${priceDisplay}</td>
          ${costCellHtml}
        `;

        row.draggable = true;
        row.addEventListener("dragstart", (e) => {
          // 드롭 존 위치 업데이트
          updateDropZonePosition();
          const parts = [product.name];
          if (product.price) parts.push(product.price);
          if (recipeText) parts.push(recipeText);
          e.dataTransfer.setData("text/plain", parts.join("\n"));
          e.dataTransfer.effectAllowed = "copy";
          row.classList.add("dragging");
        });

        row.addEventListener("dragend", () => {
          row.classList.remove("dragging");
        });

        tbody.appendChild(row);

        // 재료 행 추가
        if (recipeText) {
          const ingredientsRow = document.createElement("tr");
          ingredientsRow.classList.add("ingredients-row");
          if (!shouldExpand) ingredientsRow.classList.add("collapsed");

          ingredientsRow.innerHTML = `
            <td colspan="3" class="ingredients-display">${formatIngredients(
              recipeText
            )}</td>
          `;

          ingredientsRow.draggable = true;
          ingredientsRow.addEventListener("dragstart", (e) => {
            // 드롭 존 위치 업데이트
            updateDropZonePosition();
            const parts = [product.name];
            if (product.price) parts.push(product.price);
            if (recipeText) parts.push(recipeText);
            e.dataTransfer.setData("text/plain", parts.join("\n"));
            e.dataTransfer.effectAllowed = "copy";
            ingredientsRow.classList.add("dragging");
          });

          ingredientsRow.addEventListener("dragend", () => {
            ingredientsRow.classList.remove("dragging");
          });

          tbody.appendChild(ingredientsRow);
        }
      } else if (isEnhancement) {
        // 강화 아이템 렌더링
        const row = document.createElement("tr");

        // 도구 강화 아이템인 경우 (검색 결과에서)
        if (product.isToolEnhancement && product.rowData) {
          product.rowData.forEach((cellData) => {
            const td = document.createElement("td");
            td.textContent = cellData;
            row.appendChild(td);
          });
        } else {
          // 일반 강화 아이템
          const itemNameHtml = `${product.name}${
            product.probability ? ` (${product.probability})` : ""
          }`;
          const recipeCell = product.recipe || "-";
          const priceCell = product.price || "-";

          row.innerHTML = `
            <td>${itemNameHtml}</td>
            <td class="price">${recipeCell}</td>
            <td class="price">${priceCell}</td>
          `;
        }

        row.draggable = true;
        row.addEventListener("dragstart", (e) => {
          // 드롭 존 위치 업데이트 및 표시
          updateDropZonePosition();
          const dropZone = document.getElementById("todoDropZone");
          const sidebarPanel = document.querySelector(".sidebar-panel");
          if (dropZone) {
            dropZone.classList.add("active");
          }
          if (sidebarPanel) {
            sidebarPanel.classList.add("dragging-active");
          }

          let dragText;
          if (product.isToolEnhancement && product.rowData) {
            dragText = `${product.toolName} - ${product.rowData.join(" / ")}`;
          } else {
            const parts = [product.name];
            if (product.recipe) parts.push(product.recipe);
            if (product.price) parts.push("비용 " + product.price);
            dragText = parts.join("\n");
          }
          e.dataTransfer.setData("text/plain", dragText);
          e.dataTransfer.effectAllowed = "copy";
          row.classList.add("dragging");
        });

        row.addEventListener("dragend", () => {
          row.classList.remove("dragging");
        });

        tbody.appendChild(row);
      } else {
        // 일반 아이템 렌더링
        const row = document.createElement("tr");
        const displayValue = product.recipe || product.price;
        row.innerHTML = `
          <td>${product.name}</td>
          <td class="price">${displayValue}</td>
        `;

        row.draggable = true;
        row.addEventListener("dragstart", (e) => {
          // 드롭 존 위치 업데이트
          updateDropZonePosition();
          const dragText = product.recipe
            ? `${product.name}\n${product.recipe}`
            : product.name;
          e.dataTransfer.setData("text/plain", dragText);
          e.dataTransfer.effectAllowed = "copy";
          row.classList.add("dragging");
        });

        row.addEventListener("dragend", () => {
          row.classList.remove("dragging");
        });

        tbody.appendChild(row);
      }
    });

    container.appendChild(table);
  });

  // 카테고리가 없는 아이템들도 렌더링 (있는 경우)
  if (uncategorizedItems.length > 0) {
    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "process-category-title";
    categoryTitle.textContent = "기타";
    container.appendChild(categoryTitle);

    renderTable(uncategorizedItems);
  }
}

// 카테고리별 테이블 렌더링 (공통 함수)
function renderCategorizedTables(categorizedData, priceHeaderText = "재료") {
  const container = document.querySelector(".table-container");
  container.innerHTML = "";

  Object.keys(categorizedData).forEach((category) => {
    const products = categorizedData[category];

    // 카테고리 제목
    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "process-category-title";

    // 이미지 이름 추출 (가장 오른쪽 토큰 사용)
    // 예1: "햇살농가 - 보리" → "보리"
    // 예2: "세레니티 - 판매 - 카이" → "카이"
    // 예3: "식재료 가공 시설" → 그대로
    let imageName = category;
    if (category.includes(" - ")) {
      const parts = category.split(" - ");
      imageName = parts[parts.length - 1].trim();
    }

    // 파일명에서 슬래시를 콜론으로 변경 (파일시스템 제한)
    // 예: "도구/무기 제작 시설" → "도구:무기 제작 시설"
    const fileName = imageName.replace(/\//g, ":");

    // 카테고리 이미지 추가
    const categoryImage = document.createElement("img");
    // 도구 강화인 경우 img/ 폴더, 그 외에는 img/npcs/ 폴더
    const isToolEnhancement = category.startsWith("세레니티 - 강화 - 세이지");
    // 도구 강화인 경우 공백 제거
    const imageFileName = isToolEnhancement
      ? fileName.replace(/\s+/g, "")
      : fileName;
    categoryImage.src = isToolEnhancement
      ? `img/${imageFileName}.png`
      : `img/npcs/${fileName}.png`;
    categoryImage.alt = imageName;
    categoryImage.className = "npc-icon";
    categoryImage.style.cursor = "pointer";
    categoryImage.onerror = function () {
      this.style.display = "none"; // 이미지 로드 실패시 숨김
    };

    // 클릭 시 큰 이미지 모달 표시
    categoryImage.addEventListener("click", () => {
      showNpcModal(categoryImage.src, imageName);
    });

    categoryTitle.appendChild(categoryImage);

    // 카테고리 텍스트 추가
    const categoryText = document.createElement("span");
    categoryText.textContent = category;
    categoryTitle.appendChild(categoryText);

    container.appendChild(categoryTitle);

    // 테이블 생성
    const table = document.createElement("table");
    table.innerHTML = `
      <thead>
        <tr>
          <th>품목</th>
          <th>${priceHeaderText}</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    products.forEach((product) => {
      const row = document.createElement("tr");
      const displayValue = product.recipe || product.price;
      row.innerHTML = `
        <td>${product.name}</td>
        <td class="price">${displayValue}</td>
      `;

      // 드래그 가능하도록 설정
      row.draggable = true;
      row.addEventListener("dragstart", (e) => {
        // 드롭 존 위치 업데이트
        updateDropZonePosition();
        const dragText = product.recipe
          ? `${product.name}\n${product.recipe}`
          : product.name;
        e.dataTransfer.setData("text/plain", dragText);
        e.dataTransfer.effectAllowed = "copy";
        row.classList.add("dragging");
      });

      row.addEventListener("dragend", (e) => {
        row.classList.remove("dragging");
      });

      tbody.appendChild(row);
    });

    container.appendChild(table);
  });
}

// 가공 섹션 카테고리별 테이블 렌더링
function renderProcessTables(categorizedData) {
  renderCategorizedTables(categorizedData, "재료");
}

// 야생 섹션 카테고리별 테이블 렌더링
function renderWildTables(categorizedData) {
  renderCategorizedTables(categorizedData, "판매 가격");
}

// 판매 섹션 카테고리별 테이블 렌더링 (카이/로니 등)
function renderSellTables(categorizedData) {
  renderCategorizedTables(categorizedData, "판매 가격");
}

// 구매 섹션 카테고리별 테이블 렌더링 (밀키 등)
function renderBuyTables(categorizedData) {
  renderCategorizedTables(categorizedData, "구매 가격");
}

// 요리 섹션 카테고리별 테이블 렌더링
// table.js에서 재사용할 수 있도록 별칭을 노출
window.__renderCookingTablesFromScript = function renderCookingTables(
  categorizedData
) {
  const container = document.querySelector(".table-container");
  container.innerHTML = "";

  Object.keys(categorizedData).forEach((category) => {
    const products = categorizedData[category];

    // 카테고리 제목
    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "process-category-title";

    // 이미지 이름 추출
    const imageName = category;
    const fileName = imageName.replace(/\//g, ":");

    // 카테고리 이미지 추가
    const categoryImage = document.createElement("img");
    categoryImage.src = `img/npcs/${fileName}.png`;
    categoryImage.alt = imageName;
    categoryImage.className = "npc-icon";
    categoryImage.style.cursor = "pointer";
    categoryImage.onerror = function () {
      this.style.display = "none";
    };

    categoryImage.addEventListener("click", () => {
      showNpcModal(categoryImage.src, imageName);
    });

    categoryTitle.appendChild(categoryImage);

    const categoryText = document.createElement("span");
    categoryText.textContent = category;
    categoryTitle.appendChild(categoryText);

    container.appendChild(categoryTitle);

    // 요리 전용 테이블 생성
    const table = document.createElement("table");
    table.className = "cooking-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>
            <button
              id="toggleAllIcon"
              class="toggle-all-icon"
              title="전체 열기/닫기"
              aria-label="전체 열기/닫기"
            >
              <span class="row-toggle" aria-hidden="true">▶</span>
            </button>
            <span>요리명</span>
          </th>
          <th>가격 범위</th>
          <th>원재료 비용</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    products.forEach((product) => {
      const searchTerm = (floatingSearchInput.value || "").toLowerCase().trim();
      const recipeText = product.recipe || product.ingredients || "";
      const nameMatch = (product.name || "").toLowerCase().includes(searchTerm);
      const shouldExpand =
        !!searchTerm &&
        (recipeText.toLowerCase().includes(searchTerm) || nameMatch);
      const toggleIcon = recipeText
        ? `<span class="row-toggle ${
            shouldExpand ? "expanded" : ""
          }" aria-hidden="true">▶</span>`
        : "";

      const row = document.createElement("tr");
      if (recipeText) row.classList.add("collapsible");

      const itemImage = product.image
        ? `<img src="${product.image}" alt="${product.name}" class="cooking-item-image" />`
        : "";
      const priceDisplay = product.price.includes("-")
        ? product.price.replace(/-/g, " - ")
        : product.price;

      const costInfo = computeTotalIngredientCost(recipeText);
      const suffix = costInfo.unknownCount > 0 ? " (일부 제외)" : "";
      const costCellHtml = `<td class="price-cost">${formatNumber(
        costInfo.total
      )} G${suffix}</td>`;

      row.innerHTML = `
        <td>${toggleIcon}${itemImage}${product.name}</td>
        <td class="price">${priceDisplay}</td>
        ${costCellHtml}
      `;

      row.draggable = true;
      row.addEventListener("dragstart", (e) => {
        // 드롭 존 위치 업데이트 및 표시
        updateDropZonePosition();
        const dropZone = document.getElementById("todoDropZone");
        const sidebarPanel = document.querySelector(".sidebar-panel");
        if (dropZone) {
          dropZone.classList.add("active");
        }
        if (sidebarPanel) {
          sidebarPanel.classList.add("dragging-active");
        }

        const parts = [product.name];
        if (product.price) parts.push(product.price);
        if (recipeText) parts.push(recipeText);
        e.dataTransfer.setData("text/plain", parts.join("\n"));
        e.dataTransfer.effectAllowed = "copy";
        row.classList.add("dragging");
      });

      row.addEventListener("dragend", () => {
        row.classList.remove("dragging");
      });

      tbody.appendChild(row);

      // 재료 행 추가
      if (recipeText) {
        const ingredientsRow = document.createElement("tr");
        ingredientsRow.classList.add("ingredients-row");
        if (!shouldExpand) ingredientsRow.classList.add("collapsed");

        ingredientsRow.innerHTML = `
          <td colspan="3" class="ingredients-display">${formatIngredients(
            recipeText
          )}</td>
        `;

        ingredientsRow.draggable = true;
        ingredientsRow.addEventListener("dragstart", (e) => {
          // 드롭 존 위치 업데이트 및 표시
          updateDropZonePosition();
          const dropZone = document.getElementById("todoDropZone");
          const sidebarPanel = document.querySelector(".sidebar-panel");
          if (dropZone) {
            dropZone.classList.add("active");
          }
          if (sidebarPanel) {
            sidebarPanel.classList.add("dragging-active");
          }

          const parts = [product.name];
          if (product.price) parts.push(product.price);
          if (recipeText) parts.push(recipeText);
          e.dataTransfer.setData("text/plain", parts.join("\n"));
          e.dataTransfer.effectAllowed = "copy";
          ingredientsRow.classList.add("dragging");
        });

        ingredientsRow.addEventListener("dragend", () => {
          ingredientsRow.classList.remove("dragging");
        });

        tbody.appendChild(ingredientsRow);
      }
    });

    container.appendChild(table);
  });

  // 테이블 렌더링 후 전체 열기/닫기 버튼에 이벤트 리스너 추가
  const toggleAllIcons = container.querySelectorAll(".toggle-all-icon");
  toggleAllIcons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation(); // 이벤트 전파 방지
      toggleAllIngredients();
    });
  });
};
// 전역에서 기존 이름으로도 접근 가능하도록 래핑
function renderCookingTables(categorizedData) {
  return window.__renderCookingTablesFromScript(categorizedData);
}

// 강화 섹션 테이블 렌더링 (3컬럼: 품목, 필요재료, 필요골드)
function renderEnhancementTables(productsArray) {
  const container = document.querySelector(".table-container");
  container.innerHTML = "";

  const category = "세레니티 - 강화 - 로니";

  // 카테고리 제목
  const categoryTitle = document.createElement("h3");
  categoryTitle.className = "process-category-title";

  // 이미지 이름 추출
  const imageName = "로니";
  const fileName = imageName.replace(/\//g, ":");

  // 카테고리 이미지 추가
  const categoryImage = document.createElement("img");
  categoryImage.src = `img/npcs/${fileName}.png`;
  categoryImage.alt = imageName;
  categoryImage.className = "npc-icon";
  categoryImage.style.cursor = "pointer";
  categoryImage.onerror = function () {
    this.style.display = "none";
  };

  categoryImage.addEventListener("click", () => {
    showNpcModal(categoryImage.src, imageName);
  });

  categoryTitle.appendChild(categoryImage);

  const categoryText = document.createElement("span");
  categoryText.textContent = category;
  categoryTitle.appendChild(categoryText);

  container.appendChild(categoryTitle);

  // 강화 전용 3컬럼 테이블 생성
  const table = document.createElement("table");
  table.className = "enhancement-table";
  table.innerHTML = `
    <thead>
      <tr>
        <th>품목</th>
        <th>필요 재료</th>
        <th>필요 골드</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  productsArray.forEach((product) => {
    const row = document.createElement("tr");
    const itemNameHtml = `${product.name}${
      product.probability ? ` (${product.probability})` : ""
    }`;
    const recipeCell = product.recipe || "-";
    const priceCell = product.price || "-";

    row.innerHTML = `
      <td>${itemNameHtml}</td>
      <td class="price">${recipeCell}</td>
      <td class="price">${priceCell}</td>
    `;

    row.draggable = true;
    row.addEventListener("dragstart", (e) => {
      // 드롭 존 위치 업데이트 및 표시
      updateDropZonePosition();
      const dropZone = document.getElementById("todoDropZone");
      const sidebarPanel = document.querySelector(".sidebar-panel");
      if (dropZone) {
        dropZone.classList.add("active");
      }
      if (sidebarPanel) {
        sidebarPanel.classList.add("dragging-active");
      }

      const parts = [product.name];
      if (product.recipe) parts.push(product.recipe);
      if (product.price) parts.push("비용 " + product.price);
      e.dataTransfer.setData("text/plain", parts.join("\n"));
      e.dataTransfer.effectAllowed = "copy";
      row.classList.add("dragging");
    });

    row.addEventListener("dragend", () => {
      row.classList.remove("dragging");
    });

    tbody.appendChild(row);
  });

  container.appendChild(table);

  // 도구 강화 테이블 렌더링 (세이지 괭이, 세이지 곡괭이)
  if (regionData.grindel?.toolEnhancement) {
    regionData.grindel.toolEnhancement.forEach((tool) => {
      // 도구 제목
      const toolTitle = document.createElement("h3");
      toolTitle.className = "process-category-title";

      // 도구 이미지 추가
      const toolImage = document.createElement("img");
      // 공백 제거하여 파일명과 매칭
      const toolImageName = tool.name.replace(/\s+/g, "");
      toolImage.src = `img/${toolImageName}.png`;
      toolImage.alt = tool.name;
      toolImage.className = "npc-icon";
      toolImage.style.cursor = "pointer";
      toolImage.onerror = function () {
        this.style.display = "none";
      };

      // 클릭 시 큰 이미지 모달 표시
      toolImage.addEventListener("click", () => {
        showNpcModal(toolImage.src, tool.name);
      });

      toolTitle.appendChild(toolImage);

      // 도구 이름 텍스트 추가
      const toolText = document.createElement("span");
      toolText.textContent = tool.name;
      toolTitle.appendChild(toolText);

      container.appendChild(toolTitle);

      // 표 형태의 테이블 생성
      const toolTable = document.createElement("table");
      toolTable.className = "tool-enhancement-table";

      // 헤더 생성
      const thead = document.createElement("thead");
      const headerRow = document.createElement("tr");
      tool.headers.forEach((header) => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      toolTable.appendChild(thead);

      // 바디 생성
      const toolTbody = document.createElement("tbody");
      tool.rows.forEach((rowData) => {
        const row = document.createElement("tr");
        rowData.forEach((cellData) => {
          const td = document.createElement("td");
          td.textContent = cellData;
          row.appendChild(td);
        });

        // 드래그 기능 추가
        row.draggable = true;
        row.addEventListener("dragstart", (e) => {
          updateDropZonePosition();
          const dropZone = document.getElementById("todoDropZone");
          const sidebarPanel = document.querySelector(".sidebar-panel");
          if (dropZone) dropZone.classList.add("active");
          if (sidebarPanel) sidebarPanel.classList.add("dragging-active");

          const dragText = `${tool.name} - ${rowData.join(" / ")}`;
          e.dataTransfer.setData("text/plain", dragText);
          e.dataTransfer.effectAllowed = "copy";
          row.classList.add("dragging");
        });

        row.addEventListener("dragend", () => {
          row.classList.remove("dragging");
        });

        toolTbody.appendChild(row);
      });
      toolTable.appendChild(toolTbody);

      container.appendChild(toolTable);
    });
  }
}

// 테이블 렌더링 함수
function renderTable(productsToShow) {
  // 야생 지역이고 카테고리별 데이터인 경우
  if (
    currentRegion === "wild" &&
    typeof productsToShow === "object" &&
    !Array.isArray(productsToShow)
  ) {
    renderWildTables(productsToShow);
    return;
  }

  // 요리 섹션이고 카테고리별 데이터인 경우
  if (
    currentRegion === "grindel" &&
    currentSection === "cooking" &&
    typeof productsToShow === "object" &&
    !Array.isArray(productsToShow)
  ) {
    renderCookingTables(productsToShow);
    return;
  }

  // 그린델 판매/구매가 카테고리 객체인 경우 전용 렌더러 사용
  if (
    currentRegion === "grindel" &&
    currentSection === "sell" &&
    typeof productsToShow === "object" &&
    !Array.isArray(productsToShow)
  ) {
    renderSellTables(productsToShow);
    return;
  }

  if (
    currentRegion === "grindel" &&
    currentSection === "buy" &&
    typeof productsToShow === "object" &&
    !Array.isArray(productsToShow)
  ) {
    renderBuyTables(productsToShow);
    return;
  }

  // 가공 섹션이고 카테고리별 데이터인 경우
  if (
    currentRegion === "grindel" &&
    currentSection === "process" &&
    typeof productsToShow === "object" &&
    !Array.isArray(productsToShow)
  ) {
    renderProcessTables(productsToShow);
    return;
  }

  // 강화 섹션인 경우 카테고리별 렌더링 사용
  if (
    currentRegion === "grindel" &&
    currentSection === "enhancement" &&
    Array.isArray(productsToShow)
  ) {
    renderEnhancementTables(productsToShow);
    return;
  }

  // 가공 섹션이 아닐 때 원래 테이블 구조 복원
  const container = document.querySelector(".table-container");
  const existingTable = document.getElementById("productTable");

  if (!existingTable) {
    // 테이블 구조가 없으면 복원
    container.innerHTML = `
      <table id="productTable">
        <thead>
          <tr>
            <th id="itemHeader">
              <button
                id="toggleAllIcon"
                class="toggle-all-icon"
                title="전체 열기/닫기"
                aria-label="전체 열기/닫기"
                style="display: none"
              >
                <span class="row-toggle" aria-hidden="true">▶</span>
              </button>
              <span id="itemHeaderText">품목</span>
            </th>
            <th id="priceHeader">판매 가격</th>
            <th id="costHeader" style="display: none">원재료 비용</th>
          </tr>
        </thead>
        <tbody id="tableBody">
        </tbody>
      </table>
    `;

    // 전역 참조 업데이트
    const toggleAllIcon = document.getElementById("toggleAllIcon");
    if (toggleAllIcon) {
      toggleAllIcon.addEventListener("click", toggleAllIngredients);
    }
  }

  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  // 요리/강화 탭일 때 테이블에 클래스 추가/제거
  const productTable = document.getElementById("productTable");
  if (currentRegion === "grindel" && currentSection === "cooking") {
    productTable.classList.add("cooking-table");
    productTable.classList.remove("enhancement-table");
  } else if (currentRegion === "grindel" && currentSection === "enhancement") {
    productTable.classList.add("enhancement-table");
    productTable.classList.remove("cooking-table");
  } else {
    productTable.classList.remove("cooking-table");
    productTable.classList.remove("enhancement-table");
  }

  if (!productsToShow || productsToShow.length === 0) {
    const colspan =
      (currentRegion === "grindel" && currentSection === "cooking") ||
      (currentRegion === "grindel" && currentSection === "enhancement")
        ? 3
        : 2;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="no-results">검색 결과가 없습니다.</td></tr>`;
    return;
  }

  productsToShow.forEach((product) => {
    const row = document.createElement("tr");
    let priceDisplay = product.price;

    // 섹션별 표시 문자열 보정 (recipe/price 구조 대응)
    if (currentRegion === "grindel" && currentSection === "process") {
      // 가공 탭은 재료 문자열만 표시
      priceDisplay = product.recipe || product.price || "-";
    } else if (
      currentRegion === "grindel" &&
      currentSection === "enhancement"
    ) {
      // 강화 탭 본문은 재료만 표시 (가격은 하단 별도 행)
      priceDisplay = product.recipe || "-";
    }

    // 요리 섹션일 경우 가격 범위에 공백 추가
    if (
      currentRegion === "grindel" &&
      currentSection === "cooking" &&
      priceDisplay.includes("-")
    ) {
      priceDisplay = priceDisplay.replace(/-/g, " - ");
    }

    // 확률은 단계명 옆에만 표기하도록 변경 (본문에는 추가하지 않음)

    // 원재료 비용 계산 (요리 아이템만)
    let costCellHtml = "";
    const isCookingForCost =
      (currentRegion === "grindel" && currentSection === "cooking") ||
      product.itemType === "cooking";
    if (isCookingForCost && (product.recipe || product.ingredients)) {
      const recipeText = product.recipe || product.ingredients;
      const costInfo = computeTotalIngredientCost(recipeText);
      const suffix = costInfo.unknownCount > 0 ? " (일부 제외)" : "";
      costCellHtml = `<td class="price-cost">${formatNumber(
        costInfo.total
      )} G${suffix}</td>`;
    }

    // 요리 아이템 체크: currentSection이 cooking이거나 itemType이 cooking인 경우
    const isCookingItem =
      (currentRegion === "grindel" && currentSection === "cooking") ||
      product.itemType === "cooking";

    if (isCookingItem) {
      // 검색 중이면 이름 또는 재료 매치 시 자동 펼침
      const searchTerm = (floatingSearchInput.value || "").toLowerCase().trim();
      const recipeText = product.recipe || product.ingredients || "";
      const nameMatch = (product.name || "").toLowerCase().includes(searchTerm);
      const shouldExpand =
        !!searchTerm &&
        (recipeText.toLowerCase().includes(searchTerm) || nameMatch);
      const toggleIcon = recipeText
        ? `<span class="row-toggle ${
            shouldExpand ? "expanded" : ""
          }" aria-hidden="true">▶</span>`
        : "";
      if (recipeText) {
        row.classList.add("collapsible");
      }
      const itemImage = product.image
        ? `<img src="${product.image}" alt="${product.name}" class="cooking-item-image" />`
        : "";
      row.innerHTML = `
                <td>${toggleIcon}${itemImage}${product.name}</td>
                <td class="price">${priceDisplay}</td>
                ${costCellHtml}
            `;
    } else if (
      currentRegion === "grindel" &&
      currentSection === "enhancement"
    ) {
      // 강화 탭: 3컬럼 (품목, 필요재료, 필요골드)
      const itemNameHtml = `${product.name}${
        product.probability ? ` (${product.probability})` : ""
      }`;
      const recipeCell = priceDisplay; // recipe가 priceDisplay에 들어있음
      const priceCell = product.price || "-";

      row.innerHTML = `
                <td>${itemNameHtml}</td>
                <td class="price">${recipeCell}</td>
                <td class="price">${priceCell}</td>
            `;
    } else {
      // 컬렉션북 아이템인지 확인하고 체크박스 추가
      let itemNameHtml = product.name;
      if (product.isCollection) {
        const isChecked = collectionCheckedItems.has(product.name);
        itemNameHtml = `
          <div class="collection-item-container">
            <input type="checkbox" class="collection-checkbox" ${
              isChecked ? "checked" : ""
            } 
                   onchange="toggleCollectionItem('${product.name}')" />
            <span class="collection-item-name ${isChecked ? "checked" : ""}">${
          product.name
        }</span>
          </div>
        `;
      }

      row.innerHTML = `
                <td>${itemNameHtml}</td>
                <td class="price">${priceDisplay}</td>
            `;
    }

    // 체크된 컬렉션 아이템에 전체 행 스타일 적용
    if (product.isCollection && collectionCheckedItems.has(product.name)) {
      row.classList.add("collection-checked-row");
    }

    // 드래그 가능하도록 설정
    row.draggable = true;
    row.addEventListener("dragstart", (e) => {
      let dragText = product.name;

      // 드롭 존 위치 업데이트 및 표시
      updateDropZonePosition();
      const dropZone = document.getElementById("todoDropZone");
      const sidebarPanel = document.querySelector(".sidebar-panel");
      if (dropZone) {
        dropZone.classList.add("active");
      }
      if (sidebarPanel) {
        sidebarPanel.classList.add("dragging-active");
      }

      // 강화 탭: name, recipe, price를 줄바꿈으로 구분
      if (currentRegion === "grindel" && currentSection === "enhancement") {
        const parts = [product.name];
        if (product.recipe) parts.push(product.recipe);
        if (product.price) parts.push("비용 " + product.price);
        dragText = parts.join("\n");
      }
      // 요리 탭: name, price, recipe를 줄바꿈으로 구분
      else if (currentRegion === "grindel" && currentSection === "cooking") {
        const parts = [product.name];
        if (product.price) parts.push(product.price);
        if (product.recipe || product.ingredients) {
          parts.push(product.recipe || product.ingredients);
        }
        dragText = parts.join("\n");
      }
      // 가공 탭: name, recipe를 줄바꿈으로 구분
      else if (currentRegion === "grindel" && currentSection === "process") {
        const parts = [product.name];
        if (product.recipe) parts.push(product.recipe);
        dragText = parts.join("\n");
      }
      // 야생을 제외한 나머지 탭
      else if (currentRegion !== "wild") {
        if (product.recipe || product.ingredients) {
          const recipeText = product.recipe || product.ingredients;
          dragText = `${product.name}\n${recipeText}`;
        } else {
          // 제품에 ingredients가 없을 경우 상세 사전에서 레시피 사용
          const detail = ingredientDetails && ingredientDetails[product.name];
          const recipeText =
            detail && detail.recipe ? String(detail.recipe).trim() : "";
          if (recipeText) {
            dragText = `${product.name}\n${recipeText}`;
          }
        }
      }

      e.dataTransfer.setData("text/plain", dragText);
      e.dataTransfer.effectAllowed = "copy";
      row.classList.add("dragging");
    });

    row.addEventListener("dragend", (e) => {
      row.classList.remove("dragging");
    });

    tbody.appendChild(row);

    // 하위 행 표시
    // - 요리: 재료 포맷 표시
    const isCookingForIngredients =
      (currentRegion === "grindel" && currentSection === "cooking") ||
      product.itemType === "cooking";

    if (isCookingForIngredients && (product.recipe || product.ingredients)) {
      const ingredientsRow = document.createElement("tr");
      const colSpan = isCookingForIngredients ? 3 : 2;
      ingredientsRow.classList.add("ingredients-row");

      // 검색 중이면 이름 또는 재료 매치 시 자동 펼침
      const searchTerm = (floatingSearchInput.value || "").toLowerCase().trim();
      const recipeText = product.recipe || product.ingredients || "";
      const nameMatch = (product.name || "").toLowerCase().includes(searchTerm);
      const shouldExpand =
        !!searchTerm &&
        (recipeText.toLowerCase().includes(searchTerm) || nameMatch);

      if (isCookingForIngredients && !shouldExpand) {
        ingredientsRow.classList.add("collapsed");
      }

      ingredientsRow.innerHTML = `
                <td colspan="${colSpan}" class="ingredients-display">${formatIngredients(
        recipeText
      )}</td>
            `;

      // 재료 행도 드래그 가능하도록 설정
      ingredientsRow.draggable = true;
      ingredientsRow.addEventListener("dragstart", (e) => {
        // 드롭 존 위치 업데이트 및 표시
        updateDropZonePosition();
        const dropZone = document.getElementById("todoDropZone");
        const sidebarPanel = document.querySelector(".sidebar-panel");
        if (dropZone) {
          dropZone.classList.add("active");
        }
        if (sidebarPanel) {
          sidebarPanel.classList.add("dragging-active");
        }

        const parts = [product.name];
        if (product.price) parts.push(product.price);
        if (recipeText) parts.push(recipeText);
        const dragText = parts.join("\n");

        e.dataTransfer.setData("text/plain", dragText);
        e.dataTransfer.effectAllowed = "copy";
        ingredientsRow.classList.add("dragging");
      });

      ingredientsRow.addEventListener("dragend", (e) => {
        ingredientsRow.classList.remove("dragging");
      });

      tbody.appendChild(ingredientsRow);

      // 원재료 비용 합계 표시
      // (요청에 따라 재료 아래 별도 행 표시는 제거되었습니다)
    }
  });
}

// 브라우저 감지 및 테마 적용 함수
function detectBrowserAndApplyTheme() {
  const userAgent = navigator.userAgent.toLowerCase();
  let browserTheme = "";

  if (userAgent.includes("chrome") && !userAgent.includes("edg")) {
    browserTheme = "chrome-theme";
  } else if (userAgent.includes("firefox")) {
    browserTheme = "firefox-theme";
  } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
    browserTheme = "safari-theme";
  } else if (userAgent.includes("edg")) {
    browserTheme = "edge-theme";
  } else if (userAgent.includes("opr") || userAgent.includes("opera")) {
    browserTheme = "opera-theme";
  } else {
    // 기본값으로 Chrome 테마 적용
    browserTheme = "chrome-theme";
  }

  // 기존 브라우저 테마 클래스 제거
  document.body.classList.remove(
    "chrome-theme",
    "firefox-theme",
    "safari-theme",
    "edge-theme",
    "opera-theme"
  );

  // 새로운 브라우저 테마 클래스 추가
  document.body.classList.add(browserTheme);

  console.log(`브라우저 감지: ${browserTheme}`);
}

// JSON 데이터 로드 함수
async function loadData() {
  try {
    const [regionResponse, ingredientResponse, expertiseResponse] =
      await Promise.all([
        fetch("data/regionData.json"),
        fetch("data/ingredientDetails.json"),
        fetch("data/expertise.json"),
      ]);

    regionData = await regionResponse.json();
    ingredientDetails = await ingredientResponse.json();
    expertiseData = await expertiseResponse.json();

    // 데이터 로드 완료 후 초기화
    initializeApp();
  } catch (error) {
    console.error("데이터 로드 실패:", error);
    // 에러 발생 시 기본 데이터로 초기화
    initializeApp();
  }
}

// 요리 재료 문자열을 토큰별로 스타일링하여 HTML로 변환
function formatIngredients(ingredientsText) {
  // 분류 기준 세트
  const grindelGatherables = new Set([
    "토마토 베이스",
    "양파 베이스",
    "마늘 베이스",
    "코코넛",
    "파인애플",
  ]);
  const grindelPurchasesAndDerived = new Set([
    "소금",
    "요리용 달걀",
    "요리용 우유",
    "오일",
    "치즈 조각",
    "버터 조각",
    "요리용 소금",
  ]);
  const mixedProducts = new Set(["밀가루 반죽"]); // 밀(바닐라) + 요리용 달걀(구매) 혼합
  const isBundleOrMeatOrSugar = (name) =>
    name.includes("묶음") ||
    name.startsWith("익힌 ") ||
    name === "스테이크" ||
    name === "설탕 큐브";

  const parts = ingredientsText.split("+").map((p) => p.trim());
  const styledParts = parts.map((part) => {
    // 수량 표기 제거 후 재료명 추출
    const name = part.replace(/\s*\d+개.*$/, "").trim();

    let className = "ing";
    if (grindelGatherables.has(name)) {
      className += " ing-gather";
    } else if (grindelPurchasesAndDerived.has(name)) {
      className += " ing-buy";
    } else if (mixedProducts.has(name)) {
      className += " ing-mixed";
    } else if (isBundleOrMeatOrSugar(name)) {
      className += " ing-extra";
    }

    // 툴팁 데이터 속성 추가
    const detail = ingredientDetails[name];
    if (detail) {
      const tooltipText = `${detail.source}\n${detail.recipe}\n${detail.cost}`;
      return `<span class="${className}" data-tooltip="${tooltipText}">${part}</span>`;
    }

    return `<span class="${className}">${part}</span>`;
  });
  return `재료: ${styledParts.join(" + ")}`;
}

// 비용 합계 계산
function computeTotalIngredientCost(ingredientsText, options = {}) {
  let total = 0;
  let unknownCount = 0;
  const { excludeBases = false } = options;
  const baseNames = new Set(["토마토 베이스", "양파 베이스", "마늘 베이스"]);
  const parts = ingredientsText.split("+").map((p) => p.trim());
  parts.forEach((part) => {
    const name = part.replace(/\s*\d+개.*$/, "").trim();
    if (excludeBases && baseNames.has(name)) {
      return; // 씨앗비용 사용 시 베이스 재료는 비용 제외
    }
    const qtyMatch = part.match(/(\d+)개/);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const detail = ingredientDetails[name];
    if (!detail) {
      unknownCount++;
      return;
    }
    // cost 형식 예: "8×7G = 56G" 또는 "1×1G = 1G" 등
    const costMatch = detail.cost && detail.cost.match(/=\s*([\d,]+)G/);
    if (costMatch) {
      const unit = parseInt(costMatch[1].replace(/,/g, ""), 10);
      total += unit * qty;
    } else {
      unknownCount++;
    }
  });
  return { total, unknownCount };
}

function formatNumber(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// 검색 함수는 search.js로 이동
/* function searchProducts() {
  const searchTerm = (floatingSearchInput.value || "").toLowerCase().trim();

  if (searchTerm === "") {
    updateHeader(false); // 검색이 아닐 때
    collectionInfo.style.display = "none"; // 컬랙션북 안내 숨기기
    renderTable(getCurrentProducts());
    return;
  }

  updateHeader(true); // 검색 중일 때

  let allProducts = [];

  // 모든 검색에서 요리와 컬랙션북 아이템도 포함
  const allCollectionItems = [
    ...regionData.collection.blocks.map((item) => ({
      ...item,
      isCollection: true,
    })),
    ...regionData.collection.nature.map((item) => ({
      ...item,
      isCollection: true,
    })),
    ...regionData.collection.loot.map((item) => ({
      ...item,
      isCollection: true,
    })),
    ...regionData.collection.collectibles.map((item) => ({
      ...item,
      isCollection: true,
    })),
  ];

  // 요리 아이템 평탄화 (타입 및 카테고리 정보 추가)
  const allCookingItems = [];
  if (
    regionData.grindel.cooking &&
    typeof regionData.grindel.cooking === "object"
  ) {
    Object.entries(regionData.grindel.cooking).forEach(
      ([categoryName, category]) => {
        const itemsWithType = category.map((item) => ({
          ...item,
          itemType: "cooking",
          categoryName: categoryName,
        }));
        allCookingItems.push(...itemsWithType);
      }
    );
  }

  // 야생 지역 아이템 평탄화 (카테고리 정보 추가)
  const wildItems = [];
  if (regionData.wild && typeof regionData.wild === "object") {
    Object.entries(regionData.wild).forEach(([categoryName, category]) => {
      const itemsWithCategory = category.map((item) => ({
        ...item,
        categoryName: categoryName,
      }));
      wildItems.push(...itemsWithCategory);
    });
  }

  // 가공 아이템 평탄화 (카테고리 정보 추가)
  const processItemsWithCategory = [];
  if (
    regionData.grindel.process &&
    typeof regionData.grindel.process === "object"
  ) {
    Object.entries(regionData.grindel.process).forEach(
      ([categoryName, category]) => {
        const itemsWithCategory = category.map((item) => ({
          ...item,
          categoryName: categoryName,
        }));
        processItemsWithCategory.push(...itemsWithCategory);
      }
    );
  }

  // 판매 아이템 (카테고리 구조 또는 배열 모두 지원)
  const sellItems = [];
  if (regionData.grindel?.sell) {
    if (Array.isArray(regionData.grindel.sell)) {
      sellItems.push(
        ...regionData.grindel.sell.map((item) => ({
          ...item,
          categoryName: "세레니티 - 판매",
        }))
      );
    } else {
      Object.entries(regionData.grindel.sell).forEach(([subCategory, arr]) => {
        sellItems.push(
          ...arr.map((item) => ({
            ...item,
            categoryName: `세레니티 - 판매 - ${subCategory}`,
          }))
        );
      });
    }
  }

  // 구매 아이템 (카테고리 구조 또는 배열 모두 지원)
  const buyItems = [];
  if (regionData.grindel?.buy) {
    if (Array.isArray(regionData.grindel.buy)) {
      buyItems.push(
        ...regionData.grindel.buy.map((item) => ({
          ...item,
          categoryName: "세레니티 - 구매",
        }))
      );
    } else {
      Object.entries(regionData.grindel.buy).forEach(([subCategory, arr]) => {
        buyItems.push(
          ...arr.map((item) => ({
            ...item,
            categoryName: `세레니티 - 구매 - ${subCategory}`,
          }))
        );
      });
    }
  }

  // 강화 아이템 (카테고리 정보 추가)
  const enhancementItems = (regionData.grindel?.enhancement || []).map(
    (item) => ({
      ...item,
      categoryName: "세레니티 - 강화 - 로니",
    })
  );

  // 모든 지역에서 항상 모든 섹션 검색
  allProducts = [
    ...wildItems,
    ...sellItems,
    ...buyItems,
    ...processItemsWithCategory,
    ...allCookingItems,
    ...enhancementItems,
    ...allCollectionItems,
  ];

  console.log("검색어:", searchTerm);
  console.log("전체 상품 수:", allProducts.length);
  console.log("판매 아이템:", sellItems.length);
  console.log("구매 아이템:", buyItems.length);
  console.log("가공 아이템:", processItemsWithCategory.length);
  console.log("요리 아이템:", allCookingItems.length);
  console.log("강화 아이템:", enhancementItems.length);
  console.log("야생 아이템:", wildItems.length);
  console.log("컬렉션 아이템:", allCollectionItems.length);

  const filteredProducts = allProducts.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm);
    const recipeText = (
      product.recipe ||
      product.ingredients ||
      ""
    ).toLowerCase();
    const ingredientsMatch = recipeText.includes(searchTerm);
    const priceText = String(product.price || "").toLowerCase();
    const priceMatch = priceText.includes(searchTerm);
    return nameMatch || ingredientsMatch || priceMatch;
  });

  console.log("필터링된 상품 수:", filteredProducts.length);
  console.log(
    "필터링된 상품들:",
    filteredProducts.map((p) => p.name)
  );

  // 컬랙션북 아이템이 검색 결과에 있는지 확인
  const hasCollectionItems = filteredProducts.some(
    (product) => product.isCollection
  );
  collectionInfo.style.display = hasCollectionItems ? "block" : "none";

  // 카테고리가 있는 아이템들을 그룹화
  const hasCategorizedItems = filteredProducts.some(
    (item) => item.categoryName
  );

  if (hasCategorizedItems) {
    // 카테고리별로 그룹화
    const categorized = {};
    const uncategorized = [];

    filteredProducts.forEach((item) => {
      if (item.categoryName) {
        if (!categorized[item.categoryName]) {
          categorized[item.categoryName] = [];
        }
        categorized[item.categoryName].push(item);
      } else {
        uncategorized.push(item);
      }
    });

    // 카테고리가 있으면 카테고리별로 렌더링, 없으면 일반 렌더링
    if (Object.keys(categorized).length > 0) {
      // 검색 결과임을 표시하기 위한 플래그 추가
      renderTableWithCategories(categorized, uncategorized, true);
    } else {
      renderTable(filteredProducts);
    }
  } else {
    renderTable(filteredProducts);
  }
} */

// 현재 선택된 지역과 섹션의 데이터를 가져오는 함수
function getCurrentProducts() {
  if (currentRegion === "wild") {
    return regionData.wild;
  } else if (currentRegion === "grindel") {
    return regionData.grindel[currentSection];
  } else if (currentRegion === "collection") {
    // 컬렉션북 아이템에 isCollection 속성 추가
    return regionData.collection[currentSection].map((item) => ({
      ...item,
      isCollection: true,
    }));
  }
  return [];
}

// 헤더 텍스트 업데이트 함수
function updateHeader(isSearching = false) {
  const headers = {
    sell: "판매 가격",
    buy: "구매 가격",
    process: "재료",
    cooking: "가격 범위",
    enhancement: "필요 재료",
  };

  // 요리 범례 표시 토글
  if (currentRegion === "grindel" && currentSection === "cooking") {
    if (cookingLegend) cookingLegend.style.display = "block";
    if (cookingInfo) cookingInfo.style.display = "block";
  } else {
    if (cookingLegend) cookingLegend.style.display = "none";
    if (cookingInfo) cookingInfo.style.display = "none";
  }

  // 컬렉션북 진행률 표시 토글
  if (currentRegion === "collection") {
    updateCollectionProgress();
  } else {
    hideCollectionProgress();
  }

  // DOM 요소를 다시 찾기 (가공 섹션 이후 재생성될 수 있음)
  const currentCostHeader = document.getElementById("costHeader");
  const currentToggleAllIcon = document.getElementById("toggleAllIcon");
  const currentPriceHeader = document.getElementById("priceHeader");
  const currentItemHeaderText = document.getElementById("itemHeaderText");

  // 원재료 비용 헤더 토글 + 헤더 토글 아이콘 표시
  if (currentRegion === "grindel" && currentSection === "cooking") {
    if (currentCostHeader) currentCostHeader.style.display = "";
    if (currentToggleAllIcon) currentToggleAllIcon.style.display = "";
  } else if (currentRegion === "grindel" && currentSection === "enhancement") {
    // 강화 탭은 3컬럼: 품목, 필요재료, 필요골드
    if (currentCostHeader) {
      currentCostHeader.style.display = "";
      currentCostHeader.textContent = "필요 골드";
    }
    if (currentToggleAllIcon) currentToggleAllIcon.style.display = "none";
  } else {
    if (currentCostHeader) currentCostHeader.style.display = "none";
    if (currentToggleAllIcon) currentToggleAllIcon.style.display = "none";
  }

  if (isSearching) {
    if (currentPriceHeader) currentPriceHeader.textContent = "내용";
    if (currentItemHeaderText) currentItemHeaderText.textContent = "품목";
  } else if (currentRegion === "grindel") {
    if (currentPriceHeader)
      currentPriceHeader.textContent = headers[currentSection] || "가격";
    if (currentSection === "cooking") {
      if (currentItemHeaderText) currentItemHeaderText.textContent = "요리명";
    } else if (currentSection === "enhancement") {
      if (currentItemHeaderText) currentItemHeaderText.textContent = "품목";
      if (currentPriceHeader) currentPriceHeader.textContent = "필요 재료";
    } else {
      if (currentItemHeaderText) currentItemHeaderText.textContent = "품목";
    }
  } else if (currentRegion === "collection") {
    if (currentPriceHeader) currentPriceHeader.textContent = "달성 개수";
    if (currentItemHeaderText) currentItemHeaderText.textContent = "종류";
  } else {
    if (currentPriceHeader) currentPriceHeader.textContent = "판매 가격";
    if (currentItemHeaderText) currentItemHeaderText.textContent = "품목";
  }
}

// 탭 전환 함수
function switchRegion(region) {
  currentRegion = region;

  // 탭 버튼 활성화 상태 변경
  tabButtons.forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.region === region) {
      button.classList.add("active");
    }
  });

  // 그린델 또는 컬랙션북 또는 전문가 지역일 때 섹션 탭 표시
  if (region === "grindel") {
    sectionTabs.style.display = "flex";
    currentSection = "sell";
    showGrindelSections();
    updateSectionButtons();
  } else if (region === "collection") {
    sectionTabs.style.display = "flex";
    currentSection = "blocks";
    showCollectionSections();
    updateSectionButtons();
  } else if (region === "expertise") {
    sectionTabs.style.display = "flex";
    currentSection = "gathering";
    showExpertiseSections();
    updateSectionButtons();
    renderExpertise();
    return;
  } else {
    sectionTabs.style.display = "none";
  }

  // 검색어 초기화
  floatingSearchInput.value = "";

  // 요리 섹션 정보 박스 토글
  if (region === "grindel" && currentSection === "cooking") {
    if (cookingInfo) cookingInfo.style.display = "block";
  } else {
    if (cookingInfo) cookingInfo.style.display = "none";
  }

  // 헤더 업데이트
  updateHeader();

  // 해당 지역 데이터 표시
  renderTable(getCurrentProducts());
}

// 섹션 버튼 활성화 상태 업데이트
function updateSectionButtons() {
  sectionButtons.forEach((button) => {
    button.classList.remove("active");
    if (button.dataset.section === currentSection) {
      button.classList.add("active");
    }
  });
}

// 그린델 섹션 표시 함수
function showGrindelSections() {
  sectionButtons.forEach((button) => {
    const section = button.dataset.section;
    if (
      ["sell", "buy", "process", "cooking", "enhancement"].includes(section)
    ) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  });
}

// 컬랙션북 섹션 표시 함수
function showCollectionSections() {
  sectionButtons.forEach((button) => {
    const section = button.dataset.section;
    if (["blocks", "nature", "loot", "collectibles"].includes(section)) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  });
}

// 전문가 섹션 표시 함수
function showExpertiseSections() {
  sectionButtons.forEach((button) => {
    const section = button.dataset.section;
    if (["gathering", "mining"].includes(section)) {
      button.style.display = "block";
    } else {
      button.style.display = "none";
    }
  });
}

// 섹션 전환 함수
function switchSection(section) {
  currentSection = section;
  updateSectionButtons();

  // 전문가 섹션일 때
  if (
    currentRegion === "expertise" &&
    ["gathering", "mining"].includes(section)
  ) {
    renderExpertise();
    return;
  }

  // 요리 섹션 정보 박스 토글
  if (currentRegion === "grindel" && section === "cooking") {
    if (cookingInfo) cookingInfo.style.display = "block";
  } else {
    if (cookingInfo) cookingInfo.style.display = "none";
  }

  updateHeader();
  // 검색어 초기화
  floatingSearchInput.value = "";
  renderTable(getCurrentProducts());
}

// 이벤트 리스너 (search.js 로드 이후에 등록)
// 전역에서 바로 등록하지 않고 초기화 시점에 안전하게 등록

// 탭 버튼 이벤트 리스너
tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchRegion(button.dataset.region);
  });
});

// 섹션 버튼 이벤트 리스너
sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchSection(button.dataset.section);
  });
});

// 앱 초기화 함수
function initializeApp() {
  // 브라우저 감지 및 테마 적용
  detectBrowserAndApplyTheme();

  // 컬렉션북 체크 상태 로드
  loadCollectionCheckedItems();

  // To-Do List 초기화
  loadTodoList();
  renderTodoList();
  initializeDragAndDrop();

  updateHeader();
  renderTable(getCurrentProducts());

  // 초기 요리 정보 박스 상태 설정
  if (cookingInfo) cookingInfo.style.display = "none";

  // 타이머 시작
  startTimer();

  // 스크롤 이벤트 리스너 추가
  window.addEventListener("scroll", handleScroll);

  // 다크 모드 초기화 및 이벤트 바인딩
  initTheme();
  if (themeSwitch) {
    themeSwitch.addEventListener("change", toggleTheme);
  }

  // 전체 열기/닫기 아이콘 이벤트
  if (toggleAllIcon) {
    toggleAllIcon.addEventListener("click", toggleAllIngredients);
  }

  // 계산기 이벤트
  if (calculatorBtn) {
    calculatorBtn.addEventListener("click", openCalculator);
  }
  if (closeCalculator) {
    closeCalculator.addEventListener("click", closeCalculatorModal);
  }

  // To-Do List 이벤트
  const todoInput = document.getElementById("todoInput");
  const addTodoBtn = document.getElementById("addTodoBtn");
  const clearTodoBtn = document.getElementById("clearTodoBtn");

  if (todoInput && addTodoBtn) {
    addTodoBtn.addEventListener("click", () => {
      addTodoItem(todoInput.value);
      todoInput.value = "";
    });

    todoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        addTodoItem(todoInput.value);
        todoInput.value = "";
      }
    });
  }

  if (clearTodoBtn) {
    clearTodoBtn.addEventListener("click", clearTodoList);
  }

  // 계산기 모달 배경 클릭 시 닫기
  if (calculatorModal) {
    calculatorModal.addEventListener("click", (e) => {
      // 내부 calculator-content 클릭은 무시
      if (e.target === calculatorModal) {
        closeCalculatorModal();
      }
    });
  }

  // 검색 입력 이벤트 (search.js의 searchProducts가 로드되어 있음)
  if (floatingSearchInput && typeof searchProducts === "function") {
    floatingSearchInput.addEventListener("input", searchProducts);
  }

  // ESC 키로 모달 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // NPC 모달 닫기
      const npcModal = document.getElementById("npcModal");
      if (npcModal && npcModal.classList.contains("show")) {
        closeNpcModal();
      }
      // 계산기 모달 닫기
      else if (calculatorModal && calculatorModal.classList.contains("show")) {
        closeCalculatorModal();
      }
    }
  });

  // 요리 탭 재료 접기/펼치기 위임 클릭 핸들러
  const tableContainer = document.querySelector(".table-container");
  if (tableContainer) {
    tableContainer.addEventListener("click", (e) => {
      if (currentRegion !== "grindel" || currentSection !== "cooking") return;
      // tr.collapsible 또는 그 내부 클릭 시 처리
      let targetRow = e.target.closest("tr");
      if (!targetRow || !targetRow.classList.contains("collapsible")) return;
      const nextRow = targetRow.nextElementSibling;
      if (!nextRow || !nextRow.classList.contains("ingredients-row")) return;
      nextRow.classList.toggle("collapsed");
      // 토글 아이콘 회전
      const icon = targetRow.querySelector(".row-toggle");
      if (icon) icon.classList.toggle("expanded");
      // 전체 버튼 상태 업데이트
      updateToggleAllButton();
    });
  }
}

// 페이지 로드 시 데이터 로드 시작
document.addEventListener("DOMContentLoaded", () => {
  loadData();
});

// 테마 적용/토글 로직
function initTheme() {
  try {
    const saved = getCookie("theme");
    if (saved === "dark") {
      document.body.classList.add("dark-theme");
      updateThemeToggleIcon();
    } else {
      document.body.classList.remove("dark-theme");
      updateThemeToggleIcon();
    }
  } catch (_) {
    // 쿠키 접근 실패 시 무시
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-theme");
  const isDark = document.body.classList.contains("dark-theme");
  try {
    setCookie("theme", isDark ? "dark" : "light");
  } catch (_) {
    /* ignore */
  }
  updateThemeToggleIcon();

  // 다크 모드 토글 후에도 브라우저 테마 유지
  detectBrowserAndApplyTheme();
}

function updateThemeToggleIcon() {
  if (!themeSwitch) return;
  const isDark = document.body.classList.contains("dark-theme");
  themeSwitch.checked = !isDark;
}

// 전체 재료 열기/닫기 함수
function toggleAllIngredients() {
  if (currentRegion !== "grindel" || currentSection !== "cooking") return;

  const ingredientsRows = document.querySelectorAll(".ingredients-row");
  const collapsibleRows = document.querySelectorAll(".collapsible");

  if (ingredientsRows.length === 0) return;

  // 모든 재료 행이 접혀있는지 확인
  const allCollapsed = Array.from(ingredientsRows).every((row) =>
    row.classList.contains("collapsed")
  );

  // 모든 재료 행 토글
  ingredientsRows.forEach((row) => {
    if (allCollapsed) {
      row.classList.remove("collapsed");
    } else {
      row.classList.add("collapsed");
    }
  });

  // 모든 토글 아이콘 상태 업데이트
  collapsibleRows.forEach((row) => {
    const icon = row.querySelector(".row-toggle");
    if (icon) {
      if (allCollapsed) {
        icon.classList.add("expanded");
      } else {
        icon.classList.remove("expanded");
      }
    }
  });

  // 버튼 텍스트 업데이트
  updateToggleAllButton();
}

// 전체 토글 버튼 상태 업데이트
function updateToggleAllButton() {
  if (currentRegion !== "grindel" || currentSection !== "cooking") return;

  const currentToggleAllIcon = document.getElementById("toggleAllIcon");
  if (!currentToggleAllIcon) return;

  const ingredientsRows = document.querySelectorAll(".ingredients-row");
  if (ingredientsRows.length === 0) return;
  const allCollapsed = Array.from(ingredientsRows).every((row) =>
    row.classList.contains("collapsed")
  );
  const icon = currentToggleAllIcon.querySelector(".row-toggle");
  if (icon) {
    if (allCollapsed) {
      icon.classList.remove("expanded");
    } else {
      icon.classList.add("expanded");
    }
  }
}

// NPC 모달 관련 함수들
function showNpcModal(imageSrc, npcName) {
  // 기존 모달이 있으면 제거
  let existingModal = document.getElementById("npcModal");
  if (existingModal) {
    existingModal.remove();
  }

  // 모달 생성
  const modal = document.createElement("div");
  modal.id = "npcModal";
  modal.className = "npc-modal";
  modal.innerHTML = `
    <div class="npc-modal-content">
      <button class="npc-modal-close" onclick="closeNpcModal()">&times;</button>
      <img src="${imageSrc}" alt="${npcName}" class="npc-modal-image" />
      <div class="npc-modal-name">${npcName}</div>
    </div>
  `;

  document.body.appendChild(modal);

  // 모달 표시
  setTimeout(() => {
    modal.classList.add("show");
  }, 10);

  // 배경 클릭 시 닫기
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeNpcModal();
    }
  });
}

function closeNpcModal() {
  const modal = document.getElementById("npcModal");
  if (modal) {
    modal.classList.remove("show");
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

// 계산기 관련 함수들
function openCalculator() {
  if (!calculatorModal || !calculatorBody) return;

  calculatorModal.classList.add("show");
  renderCalculator();
}

function closeCalculatorModal() {
  if (!calculatorModal) return;
  calculatorModal.classList.remove("show");
}

function renderCalculator() {
  if (!calculatorBody || !regionData.grindel || !regionData.grindel.cooking)
    return;

  // 요리 아이템 평탄화 (카테고리 구조인 경우)
  let cookingItems = [];
  if (
    typeof regionData.grindel.cooking === "object" &&
    !Array.isArray(regionData.grindel.cooking)
  ) {
    Object.values(regionData.grindel.cooking).forEach((category) => {
      cookingItems.push(...category);
    });
  } else {
    cookingItems = regionData.grindel.cooking;
  }

  calculatorBody.innerHTML = "";

  // 가격 저장소 UI + 요리 선택 버튼들
  const selectDiv = document.createElement("div");
  selectDiv.className = "cooking-selector";
  selectDiv.innerHTML = `
    <div class="cooking-buttons-container">
      <div class="price-vault" id="priceVault">
        <div class="vault-header">
          <span class="vault-title">가격 저장소</span>
          <button class="vault-clear" id="clearVaultBtn" title="저장된 가격 모두 삭제">초기화</button>
        </div>
        <div class="vault-inputs" id="vaultInputs"></div>
      </div>
      <label class="selector-label">요리 선택</label>
      <div class="cooking-buttons" id="cookingButtons">
        ${cookingItems
          .map((item, index) => {
            const itemIcon = item.image
              ? `<img src="${item.image}" alt="${item.name}" class="cooking-btn-icon" />`
              : "";
            return `<button class="cooking-btn" data-index="${index}">${itemIcon}${item.name}</button>`;
          })
          .join("")}
      </div>
    </div>
  `;
  calculatorBody.appendChild(selectDiv);

  // 가격 저장소 인풋 생성
  loadCookingPrices();
  const vaultInputs = selectDiv.querySelector("#vaultInputs");
  if (vaultInputs) {
    vaultInputs.innerHTML = cookingItems
      .map((item) => {
        const saved = cookingPriceStore[item.name] ?? "";
        return `
          <div class="vault-card">
            <div class="vault-name">${item.name}</div>
            <input type="number" class="vault-price" data-name="${item.name}" placeholder="현재 가격(G)" min="0" value="${saved}" />
          </div>
        `;
      })
      .join("");

    // 입력 변경 -> 쿠키 저장
    vaultInputs.addEventListener("input", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (!target.classList.contains("vault-price")) return;
      const name = target.getAttribute("data-name");
      setCookingPrice(name, target.value);
    });
  }

  // 저장소 초기화 버튼
  const clearBtn = selectDiv.querySelector("#clearVaultBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearCookingPrices();
      // 입력값 비우기
      selectDiv.querySelectorAll(".vault-price").forEach((inp) => {
        inp.value = "";
      });
    });
  }

  // 계산 영역 (초기에는 숨김)
  const calculationDiv = document.createElement("div");
  calculationDiv.id = "calculationArea";
  calculationDiv.className = "calculation-area";
  calculationDiv.style.display = "none";
  calculationDiv.innerHTML = `
    <div class="selected-item-info" id="selectedItemInfo">
      <!-- 선택된 요리 정보가 여기에 표시됩니다 -->
    </div>
    <div class="calculation-inputs" id="calculationInputs">
      <!-- 입력 필드들이 여기에 표시됩니다 -->
    </div>
    <div class="calculation-results" id="calculationResults">
      <!-- 계산 결과가 여기에 표시됩니다 -->
    </div>
  `;
  calculatorBody.appendChild(calculationDiv);

  // 요리 선택 버튼 이벤트
  const cookingButtons = document.getElementById("cookingButtons");
  cookingButtons.addEventListener("click", (e) => {
    if (e.target.classList.contains("cooking-btn")) {
      const selectedIndex = parseInt(e.target.dataset.index);

      // 모든 버튼에서 active 클래스 제거
      document.querySelectorAll(".cooking-btn").forEach((btn) => {
        btn.classList.remove("active");
      });

      // 클릭된 버튼에 active 클래스 추가
      e.target.classList.add("active");

      showCalculationArea(selectedIndex, cookingItems[selectedIndex]);
    }
  });
}

function showCalculationArea(index, item) {
  const calculationArea = document.getElementById("calculationArea");
  const selectedItemInfo = document.getElementById("selectedItemInfo");
  const calculationInputs = document.getElementById("calculationInputs");
  const calculationResults = document.getElementById("calculationResults");

  if (
    !calculationArea ||
    !selectedItemInfo ||
    !calculationInputs ||
    !calculationResults
  )
    return;

  // 가격 범위 파싱
  const priceRange = item.price;
  const priceMatch = priceRange.match(/(\d+(?:,\d+)*)\s*-\s*(\d+(?:,\d+)*)/);
  const minPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : 0;
  const maxPrice = priceMatch ? parseInt(priceMatch[2].replace(/,/g, "")) : 0;

  // 제작비용 계산 (recipe 또는 ingredients 필드 사용)
  const recipeText = item.recipe || item.ingredients || "";
  const costInfo = recipeText
    ? computeTotalIngredientCost(recipeText)
    : { total: 0 };

  // 선택된 요리 정보 표시
  const itemImage = item.image
    ? `<img src="${item.image}" alt="${item.name}" class="calculator-item-image" />`
    : "";
  selectedItemInfo.innerHTML = /* html */ `
    <div class="item-header">
      <div class="item-title">
        ${itemImage}
        <h4>${item.name}</h4>
      </div>
      <div class="item-details">
        <div class="price-info">
          <span class="price-label">가격 범위:</span>
          <span class="price-range">${formatNumber(minPrice)}G - ${formatNumber(
    maxPrice
  )}G</span>
        </div>
        <div class="cost-info">
          <span class="cost-label">제작비용:</span>
          <span class="cost-amount">${formatNumber(costInfo.total)}G</span>
        </div>
        <div class="comparison-info" id="comparisonInfo">
          <span class="comparison-label">최저가 대비:</span>
          <span class="comparison-amount">-</span>
        </div>
      </div>
    </div>
  `;

  // 입력 필드 (가격 저장소 자동 반영) + 씨앗비용 토글/입력
  calculationInputs.innerHTML = /* html */ `
    <div class="seed-toggle">
      <label class="seed-checkbox">
        <input type="checkbox" id="useSeedCost" />
        <span class="seed-checkmark"></span>
        요리 베이스 비용 커스텀
    </div>
    <div class="input-row">
      <div class="input-group">
        <label>현재 가격 (G)</label>
        <input type="number" id="currentPrice" placeholder="현재 가격 입력" min="0" />
      </div>
      <div class="input-group">
        <label>요리 갯수</label>
        <input type="number" id="quantity" placeholder="요리 갯수 입력" min="0" />
      </div>
    </div>
    <div class="input-row seed-row" id="seedRow" style="display:none">
      <div class="input-group">
        <label>베이스 비용 (G)</label>
        <input type="number" id="seedCost" placeholder="요리 1개당 총 베이스 비용 입력" min="0" />
      </div>
    </div>
  `;

  // 계산 결과 영역
  calculationResults.innerHTML = /* html */ `
    <div class="results-grid">
      <div class="result-item cost-breakdown" id="costBreakdown">
        원재료 비용: -
      </div>
      <div class="result-item profit-calculation" id="profitCalculation">
        판매 순수익: -
      </div>
    </div>
  `;

  // 이벤트 리스너 추가
  const currentPriceInput = document.getElementById("currentPrice");
  const quantityInput = document.getElementById("quantity");
  const useSeedCost = document.getElementById("useSeedCost");
  const seedRow = document.getElementById("seedRow");
  const seedCostInput = document.getElementById("seedCost");

  // 저장된 가격 자동 반영
  loadCookingPrices();
  const savedPrice = cookingPriceStore[item.name];
  if (typeof savedPrice === "number" && !isNaN(savedPrice)) {
    currentPriceInput.value = String(savedPrice);
  }

  [currentPriceInput, quantityInput].forEach((input) => {
    input.addEventListener("input", () => {
      calculateResults(index, item, minPrice, maxPrice, recipeText);
    });
  });

  if (useSeedCost) {
    useSeedCost.addEventListener("change", () => {
      if (seedRow) seedRow.style.display = useSeedCost.checked ? "" : "none";
      calculateResults(index, item, minPrice, maxPrice, recipeText);
    });
  }
  if (seedCostInput) {
    seedCostInput.addEventListener("input", () => {
      calculateResults(index, item, minPrice, maxPrice, recipeText);
    });
  }

  calculationArea.style.display = "block";

  // 계산 영역으로 부드럽게 스크롤
  setTimeout(() => {
    calculationArea.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, 100);
}

function hideCalculationArea() {
  const calculationArea = document.getElementById("calculationArea");
  if (calculationArea) {
    calculationArea.style.display = "none";
  }
}

function calculateResults(index, item, minPrice, maxPrice, recipeText) {
  const currentPriceInput = document.getElementById("currentPrice");
  const quantityInput = document.getElementById("quantity");
  const comparisonAmount = document
    .getElementById("comparisonInfo")
    ?.querySelector(".comparison-amount");
  const costBreakdown = document.getElementById("costBreakdown");
  const profitCalculation = document.getElementById("profitCalculation");
  const useSeed = document.getElementById("useSeedCost")?.checked;
  const seedCost = parseFloat(document.getElementById("seedCost")?.value) || 0;

  if (
    !currentPriceInput ||
    !quantityInput ||
    !costBreakdown ||
    !profitCalculation
  )
    return;

  const currentPrice = parseFloat(currentPriceInput.value) || 0;
  const quantity = parseInt(quantityInput.value) || 0;

  // 재료 비용(개당) 계산: 씨앗비용 체크 시 베이스 재료 제외 + 씨앗비용 추가
  const costInfoNow = recipeText
    ? computeTotalIngredientCost(recipeText, { excludeBases: !!useSeed })
    : { total: 0 };
  const perItemCost = costInfoNow.total + (useSeed ? seedCost : 0);

  // 가격 비교 계산 (상단으로 이동)
  if (currentPrice > 0 && minPrice > 0 && comparisonAmount) {
    const priceIncrease = currentPrice - minPrice;
    const priceIncreasePercent = ((priceIncrease / minPrice) * 100).toFixed(1);

    if (priceIncrease > 0) {
      comparisonAmount.textContent = `+${priceIncreasePercent}% (+${formatNumber(
        priceIncrease
      )}G)`;
      comparisonAmount.className = "comparison-amount positive-change";
    } else if (priceIncrease < 0) {
      comparisonAmount.textContent = `${priceIncreasePercent}% (${formatNumber(
        priceIncrease
      )}G)`;
      comparisonAmount.className = "comparison-amount negative-change";
    } else {
      comparisonAmount.textContent = `0% (0G)`;
      comparisonAmount.className = "comparison-amount";
    }
  } else if (comparisonAmount) {
    comparisonAmount.textContent = "-";
    comparisonAmount.className = "comparison-amount";
  }

  // 제작비용 표시
  if (quantity > 0) {
    const totalCost = perItemCost * quantity;
    costBreakdown.textContent = `제작비용: -${formatNumber(totalCost)}G`;
  } else {
    costBreakdown.textContent = "제작비용: -";
  }

  // 수익 계산
  if (currentPrice > 0 && quantity > 0) {
    const totalRevenue = currentPrice * quantity;
    const totalCost = perItemCost * quantity;
    const profit = totalRevenue - totalCost;

    profitCalculation.textContent = `예상 수익: ${formatNumber(profit)}G`;

    // 수익이 음수면 빨간색으로 표시
    if (profit < 0) {
      profitCalculation.style.background = "#ffebee";
      profitCalculation.style.color = "#c62828";
    } else {
      profitCalculation.style.background = "";
      profitCalculation.style.color = "";
    }
  } else {
    profitCalculation.textContent = "예상 수익: -";
    profitCalculation.style.background = "";
    profitCalculation.style.color = "";
  }

  // 상단 선택된 요리 정보의 개당 제작비용 갱신
  const costAmountEl = document
    .getElementById("selectedItemInfo")
    ?.querySelector(".cost-amount");
  if (costAmountEl) {
    costAmountEl.textContent = `${formatNumber(perItemCost)}G`;
  }
}

// 쿠키 삭제 함수
function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// 전문가 렌더링 함수
function renderExpertise() {
  const container = document.querySelector(".table-container");
  if (!container) return;

  // 헤더 및 범례 숨기기
  if (cookingLegend) cookingLegend.style.display = "none";
  if (collectionInfo) collectionInfo.style.display = "none";

  container.innerHTML = "";

  // 채집 전문가와 채광 전문가 배열 가져오기
  const gatheringExpertise = expertiseData.gatheringExpertise || [];
  const miningExpertise = expertiseData.miningExpertise || [];

  if (gatheringExpertise.length === 0 && miningExpertise.length === 0) {
    container.innerHTML = "<p class='no-results'>전문가 데이터가 없습니다.</p>";
    return;
  }

  // 현재 선택된 섹션에 따라 렌더링
  if (currentSection === "gathering" && gatheringExpertise.length > 0) {
    renderExpertiseSection(gatheringExpertise, container);
  } else if (currentSection === "mining" && miningExpertise.length > 0) {
    renderExpertiseSection(miningExpertise, container);
  }
}

function renderExpertiseSection(expertiseArray, container) {
  // 각 전문가 스킬 렌더링
  expertiseArray.forEach((skill) => {
    // 스킬 제목
    const skillTitle = document.createElement("h3");
    skillTitle.className = "expertise-skill-title";
    skillTitle.innerHTML = `${skill.icon} ${skill.name}`;
    container.appendChild(skillTitle);

    // 레벨 테이블
    const table = document.createElement("table");
    table.className = "expertise-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>레벨</th>
          <th>요구 스킬 포인트</th>
          <th>필요 골드</th>
          <th>필요 어빌리티 스톤</th>
          <th>확률</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector("tbody");

    skill.levels.forEach((level) => {
      // 메인 행
      const row = document.createElement("tr");
      row.classList.add("expertise-row");

      row.innerHTML = `
        <td class="expertise-level">${level.level} LV</td>
        <td class="expertise-points">${level.skillPoints}</td>
        <td class="price">${level.gold}</td>
        <td class="expertise-stone">${level.abilityStone}</td>
        <td class="expertise-probability">${level.probability}</td>
      `;
      tbody.appendChild(row);

      // 효과 상세 행 (항상 표시)
      const descriptionRow = document.createElement("tr");
      descriptionRow.classList.add("expertise-description-row");
      descriptionRow.innerHTML = `
        <td colspan="5" class="expertise-description-display">${level.description}</td>
      `;
      tbody.appendChild(descriptionRow);
    });

    container.appendChild(table);
  });
}
