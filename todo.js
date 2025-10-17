// To-Do List 관리 (분리 파일)
let todoList = [];

// To-Do List 쿠키 저장/로드
function loadTodoList() {
  try {
    const saved = getCookie("todoList");
    todoList = saved ? JSON.parse(saved) : [];
  } catch (_) {
    todoList = [];
  }
}

function saveTodoList() {
  try {
    setCookie("todoList", JSON.stringify(todoList));
  } catch (_) {
    // ignore
  }
}

// To-Do 아이템 추가
function addTodoItem(text) {
  if (!text || !text.trim()) return;
  const newTodo = {
    id: Date.now(),
    text: text.trim(),
    completed: false,
  };
  todoList.push(newTodo);
  saveTodoList();
  renderTodoList();
}

// To-Do 아이템 삭제
function deleteTodoItem(id) {
  todoList = todoList.filter((todo) => todo.id !== id);
  saveTodoList();
  renderTodoList();
}

// To-Do 아이템 완료 상태 토글
function toggleTodoItem(id) {
  const todo = todoList.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodoList();
    renderTodoList();
  }
}

// To-Do 아이템 편집 모드 토글
function toggleEditMode(id) {
  const todo = todoList.find((t) => t.id === id);
  if (!todo) return;

  const todoItem = document.querySelector(`[data-todo-id="${id}"]`);
  if (!todoItem) return;

  const textSpan = todoItem.querySelector(".todo-text");
  const editInput = todoItem.querySelector(".todo-edit-input");

  if (editInput) {
    // 편집 모드 종료
    const newText = editInput.value.trim();
    if (newText && newText !== todo.text) {
      todo.text = newText;
      saveTodoList();
      renderTodoList();
    }
    textSpan.style.display = "block";
    editInput.remove();
  } else {
    // 편집 모드 시작
    textSpan.style.display = "none";
    const input = document.createElement("textarea");
    input.className = "todo-edit-input";
    input.value = todo.text;
    input.maxLength = 200;
    input.rows = 2;
    textSpan.parentNode.insertBefore(input, textSpan.nextSibling);
    input.focus();
    input.select();

    // 편집 완료 이벤트
    input.addEventListener("blur", () => {
      const newText = input.value.trim();
      if (newText && newText !== todo.text) {
        todo.text = newText;
        saveTodoList();
        renderTodoList();
      }
      textSpan.style.display = "block";
      input.remove();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        input.blur();
      }
    });
  }
}

// To-Do List 초기화
function clearTodoList() {
  todoList = [];
  saveTodoList();
  renderTodoList();
}

// To-Do List 렌더링
function renderTodoList() {
  const todoListElement = document.getElementById("todoList");
  if (!todoListElement) return;

  if (todoList.length === 0) {
    todoListElement.innerHTML = '<li class="todo-empty">할 일이 없습니다</li>';
    return;
  }

  todoListElement.innerHTML = todoList
    .map(
      (todo) =>
        `<li class="todo-item ${
          todo.completed ? "completed-item" : ""
        }" data-todo-id="${todo.id}" draggable="true">
          <input type="checkbox" class="todo-checkbox" ${
            todo.completed ? "checked" : ""
          } onchange="toggleTodoItem(${todo.id})" />
          <span class="todo-text ${
            todo.completed ? "completed" : ""
          }" ondblclick="toggleEditMode(${
          todo.id
        })" title="더블클릭으로 편집">${todo.text}</span>
          <button class="todo-menu-btn" onclick="toggleTodoMenu(${
            todo.id
          })" title="메뉴">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5"/>
              <circle cx="8" cy="8" r="1.5"/>
              <circle cx="8" cy="13" r="1.5"/>
            </svg>
          </button>
          <div class="todo-dropdown" id="dropdown-${todo.id}">
            <button class="dropdown-item edit-item" onclick="handleEdit(${
              todo.id
            })">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              <span>수정</span>
            </button>
            <button class="dropdown-item delete-item" onclick="handleDelete(${
              todo.id
            })">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>삭제</span>
            </button>
          </div>
        </li>`
    )
    .join("");

  // 드래그 이벤트 리스너 추가
  const items = todoListElement.querySelectorAll(".todo-item");
  items.forEach((item) => {
    item.addEventListener("dragstart", handleDragStart);
    item.addEventListener("dragover", handleDragOver);
    item.addEventListener("drop", handleDrop);
    item.addEventListener("dragend", handleDragEnd);
  });
}

let draggedItem = null;

function handleDragStart(e) {
  // 체크박스나 메뉴 버튼 클릭 시 드래그 방지
  if (
    e.target.closest(".todo-checkbox") ||
    e.target.closest(".todo-menu-btn") ||
    e.target.closest(".todo-dropdown")
  ) {
    e.preventDefault();
    return;
  }

  draggedItem = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const afterElement = getDragAfterElement(e.clientY);
  const draggable = draggedItem;

  if (afterElement == null) {
    this.parentNode.appendChild(draggable);
  } else {
    this.parentNode.insertBefore(draggable, afterElement);
  }
}

function handleDrop(e) {
  e.preventDefault();

  // 새로운 순서로 todoList 업데이트
  const items = document.querySelectorAll(".todo-item");
  const newOrder = [];

  items.forEach((item) => {
    const id = parseInt(item.dataset.todoId);
    const todo = todoList.find((t) => t.id === id);
    if (todo) newOrder.push(todo);
  });

  todoList = newOrder;
  saveTodoList();
}

function handleDragEnd(e) {
  this.classList.remove("dragging");
  draggedItem = null;
}

function getDragAfterElement(y) {
  const todoListElement = document.getElementById("todoList");
  const draggableElements = [
    ...todoListElement.querySelectorAll(".todo-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// 드롭다운 메뉴 토글
function toggleTodoMenu(id) {
  const dropdown = document.getElementById(`dropdown-${id}`);
  const todoItem = document.querySelector(`[data-todo-id="${id}"]`);
  const allDropdowns = document.querySelectorAll(".todo-dropdown");

  // 다른 드롭다운 닫기
  allDropdowns.forEach((d) => {
    if (d.id !== `dropdown-${id}`) {
      d.classList.remove("show");

      // show-above 클래스는 트랜지션 후에 제거
      if (d.classList.contains("show-above")) {
        setTimeout(() => {
          d.classList.remove("show-above");
        }, 200);
      }
    }
  });

  // 현재 드롭다운 토글
  const isShowing = dropdown.classList.contains("show");

  if (!isShowing) {
    // 드롭다운 위치 계산 (아래쪽 공간이 부족하면 위로 표시)
    const todoItemRect = todoItem.getBoundingClientRect();
    const sidebarInner = document.querySelector(".sidebar-inner");
    const sidebarRect = sidebarInner.getBoundingClientRect();
    const dropdownHeight = 88; // 드롭다운 예상 높이

    // 사이드바 하단으로부터 얼마나 떨어져 있는지 계산
    const spaceBelow = sidebarRect.bottom - todoItemRect.bottom;

    // 아래쪽 공간이 부족하면 위쪽에 표시
    if (spaceBelow < dropdownHeight + 10) {
      dropdown.classList.add("show-above");
    } else {
      dropdown.classList.remove("show-above");
    }

    dropdown.classList.add("show");
  } else {
    dropdown.classList.remove("show");

    // show-above 클래스는 트랜지션 후에 제거
    if (dropdown.classList.contains("show-above")) {
      setTimeout(() => {
        dropdown.classList.remove("show-above");
      }, 200);
    }
  }
}

// 모든 드롭다운 닫기
function closeAllDropdowns() {
  const allDropdowns = document.querySelectorAll(".todo-dropdown");
  allDropdowns.forEach((d) => {
    d.classList.remove("show");

    // show-above 클래스는 트랜지션 후에 제거
    if (d.classList.contains("show-above")) {
      setTimeout(() => {
        d.classList.remove("show-above");
      }, 200); // 트랜지션 시간과 동일
    }
  });
}

// 수정 핸들러
function handleEdit(id) {
  closeAllDropdowns();
  toggleEditMode(id);
}

// 삭제 핸들러
function handleDelete(id) {
  closeAllDropdowns();
  deleteTodoItem(id);
}

// 스크롤 시 드롭다운 닫기
document.addEventListener("DOMContentLoaded", () => {
  const sidebarInner = document.querySelector(".sidebar-inner");
  if (sidebarInner) {
    sidebarInner.addEventListener("scroll", closeAllDropdowns);
  }

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".todo-menu-btn") &&
      !e.target.closest(".todo-dropdown")
    ) {
      closeAllDropdowns();
    }
  });
});
