// 테이블 관련 렌더 함수들 (script.js의 전역 상태/유틸 사용)

function renderTableWithCategories(
  categorizedData,
  uncategorizedItems,
  isSearchResult = false
) {
  const container = document.querySelector(".table-container");
  container.innerHTML = "";

  Object.keys(categorizedData).forEach((category) => {
    const products = categorizedData[category];
    if (products.length === 0) return;

    const firstItem = products[0];
    const isCooking = firstItem.itemType === "cooking";
    const isEnhancement = category.startsWith("세레니티 - 강화");

    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "process-category-title";

    // 이미지 이름: 가장 오른쪽 토큰
    let imageName = category;
    if (category.includes(" - ")) {
      const parts = category.split(" - ");
      imageName = parts[parts.length - 1].trim();
    }
    const fileName = imageName.replace(/\//g, ":");

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

    const table = document.createElement("table");
    if (isCooking) {
      table.className = "cooking-table";
      table.innerHTML = `
        <thead>
          <tr>
            <th>
              <button id="toggleAllIcon-${category.replace(
                /\s+/g,
                "-"
              )}" class="toggle-all-icon" title="전체 열기/닫기" aria-label="전체 열기/닫기">
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
        row.addEventListener("dragend", () => row.classList.remove("dragging"));

        tbody.appendChild(row);

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
            // 드롭 존 표시
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
          ingredientsRow.addEventListener("dragend", () =>
            ingredientsRow.classList.remove("dragging")
          );
          tbody.appendChild(ingredientsRow);
        }
      } else if (isEnhancement) {
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
          // 드롭 존 표시
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
        row.addEventListener("dragend", () => row.classList.remove("dragging"));
        tbody.appendChild(row);
      } else {
        const row = document.createElement("tr");
        const displayValue = product.recipe || product.price;
        row.innerHTML = `
          <td>${product.name}</td>
          <td class="price">${displayValue}</td>
        `;
        row.draggable = true;
        row.addEventListener("dragstart", (e) => {
          // 드롭 존 표시
          const dropZone = document.getElementById("todoDropZone");
          const sidebarPanel = document.querySelector(".sidebar-panel");
          if (dropZone) {
            dropZone.classList.add("active");
          }
          if (sidebarPanel) {
            sidebarPanel.classList.add("dragging-active");
          }

          const dragText = product.recipe
            ? `${product.name}\n${product.recipe}`
            : product.name;
          e.dataTransfer.setData("text/plain", dragText);
          e.dataTransfer.effectAllowed = "copy";
          row.classList.add("dragging");
        });
        row.addEventListener("dragend", () => row.classList.remove("dragging"));
        tbody.appendChild(row);
      }
    });

    container.appendChild(table);
  });

  if (uncategorizedItems.length > 0) {
    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "process-category-title";
    categoryTitle.textContent = "기타";
    container.appendChild(categoryTitle);
    renderTable(uncategorizedItems);
  }

  // 테이블 렌더링 후 전체 열기/닫기 버튼에 이벤트 리스너 추가
  const toggleAllIcons = container.querySelectorAll(".toggle-all-icon");
  toggleAllIcons.forEach((icon) => {
    icon.addEventListener("click", (e) => {
      e.stopPropagation(); // 이벤트 전파 방지
      toggleAllIngredients();
    });
  });
}

function renderCategorizedTables(categorizedData, priceHeaderText = "재료") {
  const container = document.querySelector(".table-container");
  container.innerHTML = "";

  Object.keys(categorizedData).forEach((category) => {
    const products = categorizedData[category];

    const categoryTitle = document.createElement("h3");
    categoryTitle.className = "process-category-title";

    let imageName = category;
    if (category.includes(" - ")) {
      const parts = category.split(" - ");
      imageName = parts[parts.length - 1].trim();
    }
    const fileName = imageName.replace(/\//g, ":");

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
    categoryImage.addEventListener("click", () =>
      showNpcModal(categoryImage.src, imageName)
    );

    categoryTitle.appendChild(categoryImage);
    const categoryText = document.createElement("span");
    categoryText.textContent = category;
    categoryTitle.appendChild(categoryText);
    container.appendChild(categoryTitle);

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
      row.draggable = true;
      row.addEventListener("dragstart", (e) => {
        // 드롭 존 표시
        const dropZone = document.getElementById("todoDropZone");
        const sidebarPanel = document.querySelector(".sidebar-panel");
        if (dropZone) {
          dropZone.classList.add("active");
        }
        if (sidebarPanel) {
          sidebarPanel.classList.add("dragging-active");
        }

        const dragText = product.recipe
          ? `${product.name}\n${product.recipe}`
          : product.name;
        e.dataTransfer.setData("text/plain", dragText);
        e.dataTransfer.effectAllowed = "copy";
        row.classList.add("dragging");
      });
      row.addEventListener("dragend", () => row.classList.remove("dragging"));
      tbody.appendChild(row);
    });
    container.appendChild(table);
  });
}

function renderProcessTables(categorizedData) {
  renderCategorizedTables(categorizedData, "재료");
}

function renderWildTables(categorizedData) {
  renderCategorizedTables(categorizedData, "판매 가격");
}

function renderSellTables(categorizedData) {
  renderCategorizedTables(categorizedData, "판매 가격");
}

function renderBuyTables(categorizedData) {
  renderCategorizedTables(categorizedData, "구매 가격");
}

function renderCookingTables(categorizedData) {
  // 카테고리형 요리 테이블 렌더는 기존 구현을 사용하기 위해
  // script.js의 동일 함수에 위임하거나 이 파일에서 구현을 유지해도 됩니다.
  // 여기서는 기존 구현을 그대로 두기 위해 script.js의 함수가 존재하면 그걸 사용합니다.
  if (typeof window.__renderCookingTablesFromScript === "function") {
    return window.__renderCookingTablesFromScript(categorizedData);
  }
}
