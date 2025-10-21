// 검색 함수 (script.js의 전역 변수와 renderTable, renderTableWithCategories를 사용)
function searchProducts() {
  const searchTerm = (floatingSearchInput.value || "").toLowerCase().trim();

  if (searchTerm === "") {
    updateHeader(false);
    collectionInfo.style.display = "none";
    renderTable(getCurrentProducts());
    return;
  }

  updateHeader(true);

  let allProducts = [];

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

  const wildItems = [];
  if (regionData.wild && typeof regionData.wild === "object") {
    Object.entries(regionData.wild).forEach(([categoryName, category]) => {
      const itemsWithCategory = category.map((item) => ({
        ...item,
        categoryName,
      }));
      wildItems.push(...itemsWithCategory);
    });
  }

  const processItemsWithCategory = [];
  if (
    regionData.grindel.process &&
    typeof regionData.grindel.process === "object"
  ) {
    Object.entries(regionData.grindel.process).forEach(
      ([categoryName, category]) => {
        const itemsWithCategory = category.map((item) => ({
          ...item,
          categoryName,
        }));
        processItemsWithCategory.push(...itemsWithCategory);
      }
    );
  }

  // 판매
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

  // 구매
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

  // 강화
  const enhancementItems = (regionData.grindel?.enhancement || []).map(
    (item) => ({
      ...item,
      categoryName: "세레니티 - 강화 - 로니",
    })
  );

  // 도구 강화 (세이지 괭이, 세이지 곡괭이)
  const toolEnhancementItems = [];
  if (regionData.grindel?.toolEnhancement) {
    regionData.grindel.toolEnhancement.forEach((tool) => {
      tool.rows.forEach((rowData, index) => {
        toolEnhancementItems.push({
          name: `${tool.name} ${rowData[0]}`,
          price: rowData.slice(1).join(" / "),
          categoryName: `세레니티 - 강화 - ${tool.name}`,
          isToolEnhancement: true,
          toolName: tool.name,
          rowData: rowData,
        });
      });
    });
  }

  allProducts = [
    ...wildItems,
    ...sellItems,
    ...buyItems,
    ...processItemsWithCategory,
    ...allCookingItems,
    ...enhancementItems,
    ...toolEnhancementItems,
    ...allCollectionItems,
  ];

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

  const hasCollectionItems = filteredProducts.some(
    (product) => product.isCollection
  );
  collectionInfo.style.display = hasCollectionItems ? "block" : "none";

  const hasCategorizedItems = filteredProducts.some(
    (item) => item.categoryName
  );

  if (hasCategorizedItems) {
    const categorized = {};
    const uncategorized = [];
    filteredProducts.forEach((item) => {
      if (item.categoryName) {
        if (!categorized[item.categoryName])
          categorized[item.categoryName] = [];
        categorized[item.categoryName].push(item);
      } else {
        uncategorized.push(item);
      }
    });

    if (Object.keys(categorized).length > 0) {
      renderTableWithCategories(categorized, uncategorized, true);
    } else {
      renderTable(filteredProducts);
    }
  } else {
    renderTable(filteredProducts);
  }
}
