// 지역별 상품 데이터 (JSON에서 로드)
let regionData = {};
let ingredientDetails = {};

// DOM 요소들
const floatingSearchInput = document.getElementById('floatingSearchInput');
const tableBody = document.getElementById('tableBody');
const tabButtons = document.querySelectorAll('.tab-button');
const sectionTabs = document.getElementById('sectionTabs');
const sectionButtons = document.querySelectorAll('.section-button');
const priceHeader = document.getElementById('priceHeader');
const itemHeader = document.getElementById('itemHeader');
const itemHeaderText = document.getElementById('itemHeaderText');
const collectionInfo = document.getElementById('collectionInfo');
const costHeader = document.getElementById('costHeader');
const cookingLegend = document.getElementById('cookingLegend');
const cookingInfo = document.getElementById('cookingInfo');
const priceTimer = document.getElementById('priceTimer');
const timerDisplay = document.getElementById('timerDisplay');
const themeToggle = document.getElementById('themeToggle');
const toggleAllIcon = document.getElementById('toggleAllIcon');
const footerSearch = document.getElementById('footerSearch');

// 현재 선택된 지역과 섹션
let currentRegion = 'wild';
let currentSection = 'sell';

// 타이머 관련 변수
let timerInterval = null;
let originalTimerPosition = null;

// 요리 가격 변동일 (매월 1, 3, 9, 12, 15, 18, 21, 24, 27, 30일 오전 3시)
const priceChangeDays = [1, 3, 9, 12, 15, 18, 21, 24, 27, 30];

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
        nextChangeDate = new Date(now.getFullYear(), now.getMonth(), currentDay, 3, 0, 0);
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
            nextChangeDate = new Date(now.getFullYear(), now.getMonth() + 1, nextChangeDay, 3, 0, 0);
        } else {
            nextChangeDate = new Date(now.getFullYear(), now.getMonth(), nextChangeDay, 3, 0, 0);
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
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    timerDisplay.textContent = `${days}일 ${hours}시간 ${minutes}분 ${seconds}초`;
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
        priceTimer.classList.add('fixed');
    } else {
        priceTimer.classList.remove('fixed');
    }
}

// 테이블 렌더링 함수
function renderTable(productsToShow) {
    tableBody.innerHTML = '';
    
    if (productsToShow.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="no-results">검색 결과가 없습니다.</td></tr>';
        return;
    }
    
    productsToShow.forEach(product => {
        const row = document.createElement('tr');
        let priceDisplay = product.price;
        
        // 강화 섹션일 경우 확률 정보 추가
        if (currentRegion === 'grindel' && currentSection === 'enhancement' && product.probability) {
            priceDisplay += ` (${product.probability})`;
        }

        // 원재료 비용 계산 (요리 섹션에서만)
        let costCellHtml = '';
        if (currentRegion === 'grindel' && currentSection === 'cooking' && product.ingredients) {
            const costInfo = computeTotalIngredientCost(product.ingredients);
            const suffix = costInfo.unknownCount > 0 ? ' (일부 제외)' : '';
            costCellHtml = `<td class="price-cost">${formatNumber(costInfo.total)} G${suffix}</td>`;
        }
        
        if (currentRegion === 'grindel' && currentSection === 'cooking') {
            // 검색 중이고 재료 키워드가 포함된 경우 펼쳐진 상태로 표시
            const searchTerm = (floatingSearchInput.value || '').toLowerCase().trim();
            const isIngredientSearch = searchTerm && product.ingredients && product.ingredients.toLowerCase().includes(searchTerm);
            const toggleIcon = product.ingredients ? `<span class="row-toggle ${isIngredientSearch ? 'expanded' : ''}" aria-hidden="true">▶</span>` : '';
            if (product.ingredients) {
                row.classList.add('collapsible');
            }
            row.innerHTML = `
                <td>${toggleIcon}${product.name}</td>
                <td class="price">${priceDisplay}</td>
                ${costCellHtml}
            `;
        } else {
            row.innerHTML = `
                <td>${product.name}</td>
                <td class="price">${priceDisplay}</td>
            `;
        }
        
        // 검색 중이고 컬랙션북 아이템일 경우 파란색 스타일 적용
        if (floatingSearchInput.value.trim() !== '' && product.isCollection) {
            row.classList.add('collection-search-item');
        }
        
        tableBody.appendChild(row);

        // 재료 정보는 기존처럼 아래에 한 줄 표시 (요리 아이템이면 모든 탭에서 표시)
        if (product.ingredients) {
            const ingredientsRow = document.createElement('tr');
            const colSpan = (currentRegion === 'grindel' && currentSection === 'cooking') ? 3 : 2;
            ingredientsRow.classList.add('ingredients-row');
            
            // 검색 중이고 재료 키워드가 포함된 경우 펼쳐진 상태로 표시
            const searchTerm = (floatingSearchInput.value || '').toLowerCase().trim();
            const isIngredientSearch = searchTerm && product.ingredients.toLowerCase().includes(searchTerm);
            
            if (currentSection === 'cooking' && !isIngredientSearch) {
                ingredientsRow.classList.add('collapsed');
            }
            ingredientsRow.innerHTML = `
                <td colspan="${colSpan}" class="ingredients-display">${formatIngredients(product.ingredients)}</td>
            `;
            tableBody.appendChild(ingredientsRow);

            // 원재료 비용 합계 표시
            // (요청에 따라 재료 아래 별도 행 표시는 제거되었습니다)
        }
    });
}

// JSON 데이터 로드 함수
async function loadData() {
    try {
        const [regionResponse, ingredientResponse] = await Promise.all([
            fetch('data/regionData.json'),
            fetch('data/ingredientDetails.json')
        ]);
        
        regionData = await regionResponse.json();
        ingredientDetails = await ingredientResponse.json();
        
        // 데이터 로드 완료 후 초기화
        initializeApp();
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 에러 발생 시 기본 데이터로 초기화
        initializeApp();
    }
}

// 요리 재료 문자열을 토큰별로 스타일링하여 HTML로 변환
function formatIngredients(ingredientsText) {
    // 분류 기준 세트
    const grindelGatherables = new Set(['토마토 베이스', '양파 베이스', '마늘 베이스', '코코넛', '파인애플']);
    const grindelPurchasesAndDerived = new Set(['소금', '요리용 달걀', '요리용 우유', '오일', '치즈 조각', '버터 조각', '요리용 소금']);
    const mixedProducts = new Set(['밀가루 반죽']); // 밀(바닐라) + 요리용 달걀(구매) 혼합
    const isBundleOrMeatOrSugar = (name) => name.includes('묶음') || name.startsWith('익힌 ') || name === '스테이크' || name === '설탕 큐브';

    const parts = ingredientsText.split('+').map(p => p.trim());
    const styledParts = parts.map(part => {
        // 수량 표기 제거 후 재료명 추출
        const name = part.replace(/\s*\d+개.*$/, '').trim();
        
        let className = 'ing';
        if (grindelGatherables.has(name)) {
            className += ' ing-gather';
        } else if (grindelPurchasesAndDerived.has(name)) {
            className += ' ing-buy';
        } else if (mixedProducts.has(name)) {
            className += ' ing-mixed';
        } else if (isBundleOrMeatOrSugar(name)) {
            className += ' ing-extra';
        }
        
        // 툴팁 데이터 속성 추가
        const detail = ingredientDetails[name];
        if (detail) {
            const tooltipText = `${detail.source}\n${detail.recipe}\n${detail.cost}`;
            return `<span class="${className}" data-tooltip="${tooltipText}">${part}</span>`;
        }
        
        return `<span class="${className}">${part}</span>`;
    });
    return `재료: ${styledParts.join(' + ')}`;
}

// 비용 합계 계산
function computeTotalIngredientCost(ingredientsText) {
    let total = 0;
    let unknownCount = 0;
    const parts = ingredientsText.split('+').map(p => p.trim());
    parts.forEach(part => {
        const name = part.replace(/\s*\d+개.*$/, '').trim();
        const qtyMatch = part.match(/(\d+)개/);
        const qty = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;
        const detail = ingredientDetails[name];
        if (!detail) { unknownCount++; return; }
        const costMatch = detail.cost && detail.cost.match(/=\s*([\d,]+)G/);
        if (costMatch) {
            const unit = parseInt(costMatch[1].replace(/,/g, ''), 10);
            total += unit * qty;
        } else {
            unknownCount++;
        }
    });
    return { total, unknownCount };
}

function formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 검색 함수
function searchProducts() {
    const searchTerm = (floatingSearchInput.value || '').toLowerCase().trim();
    
    if (searchTerm === '') {
        updateHeader(false); // 검색이 아닐 때
        collectionInfo.style.display = 'none'; // 컬랙션북 안내 숨기기
        renderTable(getCurrentProducts());
        return;
    }
    
    updateHeader(true); // 검색 중일 때
    
    let allProducts = [];
    
    // 모든 검색에서 요리와 컬랙션북 아이템도 포함
    const allCollectionItems = [
        ...regionData.collection.blocks.map(item => ({...item, isCollection: true})),
        ...regionData.collection.nature.map(item => ({...item, isCollection: true})),
        ...regionData.collection.loot.map(item => ({...item, isCollection: true})),
        ...regionData.collection.collectibles.map(item => ({...item, isCollection: true}))
    ];
    
    const allCookingItems = regionData.grindel.cooking;
    
    if (currentRegion === 'wild') {
        allProducts = [...regionData.wild, ...allCookingItems, ...allCollectionItems];
    } else if (currentRegion === 'grindel') {
        // 그린델 지역의 모든 섹션에서 검색 + 컬랙션북
        allProducts = [
            ...regionData.grindel.sell,
            ...regionData.grindel.buy,
            ...regionData.grindel.process,
            ...regionData.grindel.cooking,
            ...regionData.grindel.enhancement,
            ...allCollectionItems
        ];
    } else if (currentRegion === 'collection') {
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
            ...allCollectionItems
        ];
    }
    
    const filteredProducts = allProducts.filter(product => {
        const nameMatch = product.name.toLowerCase().includes(searchTerm);
        const ingredientsMatch = product.ingredients && product.ingredients.toLowerCase().includes(searchTerm);
        const priceMatch = product.price && product.price.toLowerCase().includes(searchTerm);
        return nameMatch || ingredientsMatch || priceMatch;
    });
    
    // 컬랙션북 아이템이 검색 결과에 있는지 확인
    const hasCollectionItems = filteredProducts.some(product => product.isCollection);
    collectionInfo.style.display = hasCollectionItems ? 'block' : 'none';
    
    renderTable(filteredProducts);
}

// 현재 선택된 지역과 섹션의 데이터를 가져오는 함수
function getCurrentProducts() {
    if (currentRegion === 'wild') {
        return regionData.wild;
    } else if (currentRegion === 'grindel') {
        return regionData.grindel[currentSection];
    } else if (currentRegion === 'collection') {
        return regionData.collection[currentSection];
    }
    return [];
}

// 헤더 텍스트 업데이트 함수
function updateHeader(isSearching = false) {
    const headers = {
        sell: '판매 가격',
        buy: '구매 가격',
        process: '재료',
        cooking: '가격 범위',
        enhancement: '필요 재료'
    };
    
    // 요리 범례 표시 토글
    if (currentRegion === 'grindel' && currentSection === 'cooking') {
        if (cookingLegend) cookingLegend.style.display = 'block';
        if (cookingInfo) cookingInfo.style.display = 'block';
    } else {
        if (cookingLegend) cookingLegend.style.display = 'none';
        if (cookingInfo) cookingInfo.style.display = 'none';
    }
    
    // 원재료 비용 헤더 토글 + 헤더 토글 아이콘 표시
    if (currentRegion === 'grindel' && currentSection === 'cooking') {
        if (costHeader) costHeader.style.display = '';
        if (toggleAllIcon) toggleAllIcon.style.display = '';
    } else {
        if (costHeader) costHeader.style.display = 'none';
        if (toggleAllIcon) toggleAllIcon.style.display = 'none';
    }
    
    if (isSearching) {
        priceHeader.textContent = '내용';
        if (itemHeaderText) itemHeaderText.textContent = '품목';
    } else if (currentRegion === 'grindel') {
        priceHeader.textContent = headers[currentSection] || '가격';
        if (currentSection === 'cooking') {
            if (itemHeaderText) itemHeaderText.textContent = '요리명';
        } else if (currentSection === 'enhancement') {
            if (itemHeaderText) itemHeaderText.textContent = '강화 단계';
        } else {
            if (itemHeaderText) itemHeaderText.textContent = '품목';
        }
    } else if (currentRegion === 'collection') {
        priceHeader.textContent = '달성 개수';
        if (itemHeaderText) itemHeaderText.textContent = '종류';
    } else {
        priceHeader.textContent = '판매 가격';
        if (itemHeaderText) itemHeaderText.textContent = '품목';
    }
}

// 탭 전환 함수
function switchRegion(region) {
    currentRegion = region;
    
    // 탭 버튼 활성화 상태 변경
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.region === region) {
            button.classList.add('active');
        }
    });
    
    // 그린델 또는 컬랙션북 지역일 때 섹션 탭 표시
    if (region === 'grindel') {
        sectionTabs.style.display = 'flex';
        currentSection = 'sell';
        showGrindelSections();
        updateSectionButtons();
    } else if (region === 'collection') {
        sectionTabs.style.display = 'flex';
        currentSection = 'blocks';
        showCollectionSections();
        updateSectionButtons();
    } else {
        sectionTabs.style.display = 'none';
    }
    
    // 검색어 초기화
    floatingSearchInput.value = '';
    
    // 요리 섹션 정보 박스 토글
    if (region === 'grindel' && currentSection === 'cooking') {
        if (cookingInfo) cookingInfo.style.display = 'block';
    } else {
        if (cookingInfo) cookingInfo.style.display = 'none';
    }
    
    // 헤더 업데이트
    updateHeader();
    
    // 해당 지역 데이터 표시
    renderTable(getCurrentProducts());
}

// 섹션 버튼 활성화 상태 업데이트
function updateSectionButtons() {
    sectionButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.section === currentSection) {
            button.classList.add('active');
        }
    });
}

// 그린델 섹션 표시 함수
function showGrindelSections() {
    sectionButtons.forEach(button => {
        const section = button.dataset.section;
        if (['sell', 'buy', 'process', 'cooking', 'enhancement'].includes(section)) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
}

// 컬랙션북 섹션 표시 함수
function showCollectionSections() {
    sectionButtons.forEach(button => {
        const section = button.dataset.section;
        if (['blocks', 'nature', 'loot', 'collectibles'].includes(section)) {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
}

// 섹션 전환 함수
function switchSection(section) {
    currentSection = section;
    updateSectionButtons();
    
    // 요리 섹션 정보 박스 토글
    if (currentRegion === 'grindel' && section === 'cooking') {
        if (cookingInfo) cookingInfo.style.display = 'block';
    } else {
        if (cookingInfo) cookingInfo.style.display = 'none';
    }
    
    updateHeader();
    // 검색어 초기화
    floatingSearchInput.value = '';
    renderTable(getCurrentProducts());
}

// 이벤트 리스너
floatingSearchInput.addEventListener('input', searchProducts);

// 탭 버튼 이벤트 리스너
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        switchRegion(button.dataset.region);
    });
});

// 섹션 버튼 이벤트 리스너
sectionButtons.forEach(button => {
    button.addEventListener('click', () => {
        switchSection(button.dataset.section);
    });
});

// 앱 초기화 함수
function initializeApp() {
    updateHeader();
    renderTable(getCurrentProducts());
    
    // 초기 요리 정보 박스 상태 설정
    if (cookingInfo) cookingInfo.style.display = 'none';
    
    // 타이머 시작
    startTimer();
    
    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleScroll);

    // 다크 모드 초기화 및 이벤트 바인딩
    initTheme();
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // 전체 열기/닫기 아이콘 이벤트
    if (toggleAllIcon) {
        toggleAllIcon.addEventListener('click', toggleAllIngredients);
    }

    // 요리 탭 재료 접기/펼치기 위임 클릭 핸들러
    tableBody.addEventListener('click', (e) => {
        if (currentRegion !== 'grindel' || currentSection !== 'cooking') return;
        // tr.collapsible 또는 그 내부 클릭 시 처리
        let targetRow = e.target.closest('tr');
        if (!targetRow || !targetRow.classList.contains('collapsible')) return;
        const nextRow = targetRow.nextElementSibling;
        if (!nextRow || !nextRow.classList.contains('ingredients-row')) return;
        nextRow.classList.toggle('collapsed');
        // 토글 아이콘 회전
        const icon = targetRow.querySelector('.row-toggle');
        if (icon) icon.classList.toggle('expanded');
        // 전체 버튼 상태 업데이트
        updateToggleAllButton();
    });
}

// 페이지 로드 시 데이터 로드 시작
document.addEventListener('DOMContentLoaded', () => {
    loadData();
});

// 테마 적용/토글 로직
function initTheme() {
    try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeToggleIcon();
        } else {
            document.body.classList.remove('dark-theme');
            updateThemeToggleIcon();
        }
    } catch (_) {
        // localStorage 접근 실패 시 무시
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (_) { /* ignore */ }
    updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
    if (!themeToggle) return;
    const isDark = document.body.classList.contains('dark-theme');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', isDark ? '라이트 모드 전환' : '다크 모드 전환');
    themeToggle.setAttribute('title', isDark ? '라이트 모드 전환' : '다크 모드 전환');
}

// 전체 재료 열기/닫기 함수
function toggleAllIngredients() {
    if (currentRegion !== 'grindel' || currentSection !== 'cooking') return;
    
    const ingredientsRows = document.querySelectorAll('.ingredients-row');
    const collapsibleRows = document.querySelectorAll('.collapsible');
    
    if (ingredientsRows.length === 0) return;
    
    // 모든 재료 행이 접혀있는지 확인
    const allCollapsed = Array.from(ingredientsRows).every(row => row.classList.contains('collapsed'));
    
    // 모든 재료 행 토글
    ingredientsRows.forEach(row => {
        if (allCollapsed) {
            row.classList.remove('collapsed');
        } else {
            row.classList.add('collapsed');
        }
    });
    
    // 모든 토글 아이콘 상태 업데이트
    collapsibleRows.forEach(row => {
        const icon = row.querySelector('.row-toggle');
        if (icon) {
            if (allCollapsed) {
                icon.classList.add('expanded');
            } else {
                icon.classList.remove('expanded');
            }
        }
    });
    
    // 버튼 텍스트 업데이트
    updateToggleAllButton();
}

// 전체 토글 버튼 상태 업데이트
function updateToggleAllButton() {
    if (!toggleAllIcon || currentRegion !== 'grindel' || currentSection !== 'cooking') return;
    const ingredientsRows = document.querySelectorAll('.ingredients-row');
    if (ingredientsRows.length === 0) return;
    const allCollapsed = Array.from(ingredientsRows).every(row => row.classList.contains('collapsed'));
    const icon = toggleAllIcon.querySelector('.row-toggle');
    if (icon) {
        if (allCollapsed) {
            icon.classList.remove('expanded');
        } else {
            icon.classList.add('expanded');
        }
    }
}
