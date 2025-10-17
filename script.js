// 지역별 상품 데이터 (JSON에서 로드)
let regionData = {};
let ingredientDetails = {};

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

// 테이블 렌더링 함수
function renderTable(productsToShow) {
  tableBody.innerHTML = "";

  // 요리 탭일 때 테이블에 cooking-table 클래스 추가/제거
  const productTable = document.getElementById("productTable");
  if (currentRegion === "grindel" && currentSection === "cooking") {
    productTable.classList.add("cooking-table");
  } else {
    productTable.classList.remove("cooking-table");
  }

  if (productsToShow.length === 0) {
    const colspan =
      currentRegion === "grindel" && currentSection === "cooking" ? 3 : 2;
    tableBody.innerHTML = `<tr><td colspan="${colspan}" class="no-results">검색 결과가 없습니다.</td></tr>`;
    return;
  }

  productsToShow.forEach((product) => {
    const row = document.createElement("tr");
    let priceDisplay = product.price;

    // 요리 섹션일 경우 가격 범위에 공백 추가
    if (
      currentRegion === "grindel" &&
      currentSection === "cooking" &&
      priceDisplay.includes("-")
    ) {
      priceDisplay = priceDisplay.replace(/-/g, " - ");
    }

    // 강화 섹션일 경우 확률 정보 추가
    if (
      currentRegion === "grindel" &&
      currentSection === "enhancement" &&
      product.probability
    ) {
      priceDisplay += ` (${product.probability})`;
    }

    // 원재료 비용 계산 (요리 섹션에서만)
    let costCellHtml = "";
    if (
      currentRegion === "grindel" &&
      currentSection === "cooking" &&
      product.ingredients
    ) {
      const costInfo = computeTotalIngredientCost(product.ingredients);
      const suffix = costInfo.unknownCount > 0 ? " (일부 제외)" : "";
      costCellHtml = `<td class="price-cost">${formatNumber(
        costInfo.total
      )} G${suffix}</td>`;
    }

    if (currentRegion === "grindel" && currentSection === "cooking") {
      // 검색 중이고 재료 키워드가 포함된 경우 펼쳐진 상태로 표시
      const searchTerm = (floatingSearchInput.value || "").toLowerCase().trim();
      const isIngredientSearch =
        searchTerm &&
        product.ingredients &&
        product.ingredients.toLowerCase().includes(searchTerm);
      const toggleIcon = product.ingredients
        ? `<span class="row-toggle ${
            isIngredientSearch ? "expanded" : ""
          }" aria-hidden="true">▶</span>`
        : "";
      if (product.ingredients) {
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

    tableBody.appendChild(row);

    // 재료 정보는 기존처럼 아래에 한 줄 표시 (요리 아이템이면 모든 탭에서 표시)
    if (product.ingredients) {
      const ingredientsRow = document.createElement("tr");
      const colSpan =
        currentRegion === "grindel" && currentSection === "cooking" ? 3 : 2;
      ingredientsRow.classList.add("ingredients-row");

      // 검색 중이고 재료 키워드가 포함된 경우 펼쳐진 상태로 표시
      const searchTerm = (floatingSearchInput.value || "").toLowerCase().trim();
      const isIngredientSearch =
        searchTerm && product.ingredients.toLowerCase().includes(searchTerm);

      if (currentSection === "cooking" && !isIngredientSearch) {
        ingredientsRow.classList.add("collapsed");
      }
      ingredientsRow.innerHTML = `
                <td colspan="${colSpan}" class="ingredients-display">${formatIngredients(
        product.ingredients
      )}</td>
            `;
      tableBody.appendChild(ingredientsRow);

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
    const [regionResponse, ingredientResponse] = await Promise.all([
      fetch("data/regionData.json"),
      fetch("data/ingredientDetails.json"),
    ]);

    regionData = await regionResponse.json();
    ingredientDetails = await ingredientResponse.json();

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
function computeTotalIngredientCost(ingredientsText) {
  let total = 0;
  let unknownCount = 0;
  const parts = ingredientsText.split("+").map((p) => p.trim());
  parts.forEach((part) => {
    const name = part.replace(/\s*\d+개.*$/, "").trim();
    const qtyMatch = part.match(/(\d+)개/);
    const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
    const detail = ingredientDetails[name];
    if (!detail) {
      unknownCount++;
      return;
    }
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

// 검색 함수
function searchProducts() {
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

  const allCookingItems = regionData.grindel.cooking;

  if (currentRegion === "wild") {
    allProducts = [
      ...regionData.wild,
      ...allCookingItems,
      ...allCollectionItems,
    ];
  } else if (currentRegion === "grindel") {
    // 그린델 지역의 모든 섹션에서 검색 + 컬랙션북
    allProducts = [
      ...regionData.grindel.sell,
      ...regionData.grindel.buy,
      ...regionData.grindel.process,
      ...regionData.grindel.cooking,
      ...regionData.grindel.enhancement,
      ...allCollectionItems,
    ];
  } else if (currentRegion === "collection") {
    // 컬랙션북 지역의 모든 섹션에서 검색 + 요리
    allProducts = [...allCookingItems, ...allCollectionItems];
  } else {
    // 모든 지역에서 검색
    allProducts = [
      ...regionData.wild,
      ...regionData.grindel.sell,
      ...regionData.grindel.buy,
      ...regionData.grindel.process,
      ...regionData.grindel.cooking,
      ...regionData.grindel.enhancement,
      ...allCollectionItems,
    ];
  }

  const filteredProducts = allProducts.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm);
    const ingredientsMatch =
      product.ingredients &&
      product.ingredients.toLowerCase().includes(searchTerm);
    const priceMatch =
      product.price && product.price.toLowerCase().includes(searchTerm);
    return nameMatch || ingredientsMatch || priceMatch;
  });

  // 컬랙션북 아이템이 검색 결과에 있는지 확인
  const hasCollectionItems = filteredProducts.some(
    (product) => product.isCollection
  );
  collectionInfo.style.display = hasCollectionItems ? "block" : "none";

  renderTable(filteredProducts);
}

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

  // 원재료 비용 헤더 토글 + 헤더 토글 아이콘 표시
  if (currentRegion === "grindel" && currentSection === "cooking") {
    if (costHeader) costHeader.style.display = "";
    if (toggleAllIcon) toggleAllIcon.style.display = "";
  } else {
    if (costHeader) costHeader.style.display = "none";
    if (toggleAllIcon) toggleAllIcon.style.display = "none";
  }

  if (isSearching) {
    priceHeader.textContent = "내용";
    if (itemHeaderText) itemHeaderText.textContent = "품목";
  } else if (currentRegion === "grindel") {
    priceHeader.textContent = headers[currentSection] || "가격";
    if (currentSection === "cooking") {
      if (itemHeaderText) itemHeaderText.textContent = "요리명";
    } else if (currentSection === "enhancement") {
      if (itemHeaderText) itemHeaderText.textContent = "강화 단계";
    } else {
      if (itemHeaderText) itemHeaderText.textContent = "품목";
    }
  } else if (currentRegion === "collection") {
    priceHeader.textContent = "달성 개수";
    if (itemHeaderText) itemHeaderText.textContent = "종류";
  } else {
    priceHeader.textContent = "판매 가격";
    if (itemHeaderText) itemHeaderText.textContent = "품목";
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

  // 그린델 또는 컬랙션북 지역일 때 섹션 탭 표시
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

// 섹션 전환 함수
function switchSection(section) {
  currentSection = section;
  updateSectionButtons();

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

// 이벤트 리스너
floatingSearchInput.addEventListener("input", searchProducts);

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
  
  // 계산기 모달 배경 클릭 시 닫기
   if (calculatorModal) {
     calculatorModal.addEventListener("click", (e) => {
       // 내부 calculator-content 클릭은 무시
       if (e.target === calculatorModal) {
         closeCalculatorModal();
       }
     });
   }

  // ESC 키로 계산기 모달 닫기
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      calculatorModal &&
      calculatorModal.classList.contains("show")
    ) {
      closeCalculatorModal();
    }
  });

  // 요리 탭 재료 접기/펼치기 위임 클릭 핸들러
  tableBody.addEventListener("click", (e) => {
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
  if (
    !toggleAllIcon ||
    currentRegion !== "grindel" ||
    currentSection !== "cooking"
  )
    return;
  const ingredientsRows = document.querySelectorAll(".ingredients-row");
  if (ingredientsRows.length === 0) return;
  const allCollapsed = Array.from(ingredientsRows).every((row) =>
    row.classList.contains("collapsed")
  );
  const icon = toggleAllIcon.querySelector(".row-toggle");
  if (icon) {
    if (allCollapsed) {
      icon.classList.remove("expanded");
    } else {
      icon.classList.add("expanded");
    }
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

  const cookingItems = regionData.grindel.cooking;
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

  // 제작비용 계산
  const costInfo = item.ingredients
    ? computeTotalIngredientCost(item.ingredients)
    : { total: 0 };

  // 선택된 요리 정보 표시
  const itemImage = item.image
    ? `<img src="${item.image}" alt="${item.name}" class="calculator-item-image" />`
    : "";
  selectedItemInfo.innerHTML = `
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

  // 입력 필드 (가격 저장소 자동 반영)
  calculationInputs.innerHTML = `
    <div class="input-row">
      <div class="input-group">
        <label>현재 가격 (G)</label>
        <input type="number" id="currentPrice" placeholder="현재 가격 입력" min="0" />
      </div>
      <div class="input-group">
        <label>갯수</label>
        <input type="number" id="quantity" placeholder="갯수 입력" min="0" />
      </div>
    </div>
  `;

  // 계산 결과 영역
  calculationResults.innerHTML = `
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

  // 저장된 가격 자동 반영
  loadCookingPrices();
  const savedPrice = cookingPriceStore[item.name];
  if (typeof savedPrice === "number" && !isNaN(savedPrice)) {
    currentPriceInput.value = String(savedPrice);
  }

  [currentPriceInput, quantityInput].forEach((input) => {
    input.addEventListener("input", () => {
      calculateResults(index, item, minPrice, maxPrice, costInfo.total);
    });
  });

  calculationArea.style.display = "block";
}

function hideCalculationArea() {
  const calculationArea = document.getElementById("calculationArea");
  if (calculationArea) {
    calculationArea.style.display = "none";
  }
}

function calculateResults(index, item, minPrice, maxPrice, costPerItem) {
  const currentPriceInput = document.getElementById("currentPrice");
  const quantityInput = document.getElementById("quantity");
  const comparisonAmount = document
    .getElementById("comparisonInfo")
    ?.querySelector(".comparison-amount");
  const costBreakdown = document.getElementById("costBreakdown");
  const profitCalculation = document.getElementById("profitCalculation");

  if (
    !currentPriceInput ||
    !quantityInput ||
    !costBreakdown ||
    !profitCalculation
  )
    return;

  const currentPrice = parseFloat(currentPriceInput.value) || 0;
  const quantity = parseInt(quantityInput.value) || 0;

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
    const totalCost = costPerItem * quantity;
    costBreakdown.textContent = `제작비용: -${formatNumber(totalCost)}G`;
  } else {
    costBreakdown.textContent = "제작비용: -";
  }

  // 수익 계산
  if (currentPrice > 0 && quantity > 0) {
    const totalRevenue = currentPrice * quantity;
    const totalCost = costPerItem * quantity;
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
}
