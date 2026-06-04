const API_KEY = "d5d25a75f8b10d3a23ea1558f9e3a5e5";

// DOM 요소
const clock = document.querySelector("#clock");
const dateDisplay = document.querySelector("#date-display");
const logoutBtn = document.querySelector("#logout-btn");
const loginForm = document.querySelector("#login-form");
const loginInput = document.querySelector("#login-form input");
const greeting = document.querySelector("#greeting");
const toDoContainer = document.querySelector("#todo-container");
const toDoForm = document.querySelector("#todo-form");
const toDoInput = document.querySelector("#todo-form input");
const toDoList = document.querySelector("#todo-list");
const weatherText = document.querySelector("#weather-text");
const cityText = document.querySelector("#city-text");

const USERNAME_KEY = "username";
const TODOS_KEY = "todos";
let toDos = [];

// 시계 날짜
function getClock() {
  const date = new Date();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  clock.innerText = `${hours}:${minutes}:${seconds}`;

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekIndex = date.getDay();
  const weekdays = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  dateDisplay.innerText = `${year}년 ${month}월 ${day}일 ${weekdays[weekIndex]}`;
}

// 로그인
function checkLoginStatus() {
  const savedUsername = localStorage.getItem(USERNAME_KEY);
  if (savedUsername === null) {
    loginForm.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    greeting.classList.add("hidden");
    toDoContainer.classList.add("hidden");
  } else {
    loginForm.classList.add("hidden");
    logoutBtn.classList.remove("hidden");
    greeting.innerText = `안녕하세요, ${savedUsername}님!`;
    greeting.classList.remove("hidden");
    toDoContainer.classList.remove("hidden");
    loadToDos();
  }
}

function onLoginSubmit(event) {
  event.preventDefault();
  const username = loginInput.value;
  localStorage.setItem(USERNAME_KEY, username);
  checkLoginStatus();
}

// 로그아웃
function onLogoutClick() {
  localStorage.removeItem(USERNAME_KEY);
  loginInput.value = "";
  toDos = [];
  toDoList.innerHTML = "";
  checkLoginStatus();
}

// 스토리지
function saveToDos() {
  localStorage.setItem(TODOS_KEY, JSON.stringify(toDos));
}

// 삭제 버튼
function deleteToDo(event) {
  const li = event.target.closest("li");
  toDos = toDos.filter((toDo) => toDo.id !== parseInt(li.id));
  li.remove();
  saveToDos();
}

// 완료 버튼
function toggleToDoComplete(event) {
  const li = event.target.closest("li");
  const span = li.querySelector(".todo-text");
  let isCompleted = false;

  toDos = toDos.map((toDo) => {
    if (toDo.id === parseInt(li.id)) {
      toDo.completed = !toDo.completed;
      isCompleted = toDo.completed;
    }
    return toDo;
  });

  if (isCompleted) {
    span.classList.add("completed");
  } else {
    span.classList.remove("completed");
  }
  saveToDos();
}

// 투두 아이템
function paintToDo(newTodo) {
  const li = document.createElement("li");
  li.id = newTodo.id;

  const span = document.createElement("span");
  span.className = "todo-text";
  span.innerText = newTodo.text;
  if (newTodo.completed) {
    span.classList.add("completed");
  }

  const btnGroup = document.createElement("div");
  btnGroup.className = "todo-btn-group";

  const completeBtn = document.createElement("button");
  completeBtn.innerText = "완료";
  completeBtn.className = "btn-complete";
  completeBtn.addEventListener("click", toggleToDoComplete);

  const deleteBtn = document.createElement("button");
  deleteBtn.innerText = "삭제";
  deleteBtn.className = "btn-delete";
  deleteBtn.addEventListener("click", deleteToDo);

  btnGroup.appendChild(completeBtn);
  btnGroup.appendChild(deleteBtn);

  li.appendChild(span);
  li.appendChild(btnGroup);
  toDoList.appendChild(li);
}

function handleToDoSubmit(event) {
  event.preventDefault();
  const newTodo = toDoInput.value;
  toDoInput.value = "";
  const newTodoObj = {
    text: newTodo,
    id: Date.now(),
    completed: false,
  };
  toDos.push(newTodoObj);
  paintToDo(newTodoObj);
  saveToDos();
}

function loadToDos() {
  toDoList.innerHTML = "";
  const savedToDos = localStorage.getItem(TODOS_KEY);
  if (savedToDos !== null) {
    const parsedToDos = JSON.parse(savedToDos);
    toDos = parsedToDos;
    parsedToDos.forEach(paintToDo);
  }
}

// 배경이미지
function getBackgroundImage() {
  const images = [
    "https://images.unsplash.com/photo-1780560034722-22b9695dd14c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1780519123579-2088d9560826?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1777836439057-f80dbde5703c?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  ];
  const chosenImage = images[Math.floor(Math.random() * images.length)];
  document.body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url('${chosenImage}')`;
}

// 날씨 데이터
function onGeoOk(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  const url = `https://openweathermap.org{lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      cityText.innerText = `@ ${data.name}`;
      weatherText.innerText = `${data.weather.main} / ${Math.round(data.main.temp)}°C`;
    })
    .catch(() => {
      weatherText.innerText = "날씨 연동 실패 (API 키 미기입)";
    });
}

function onGeoError() {
  weatherText.innerText = "위치 동의 거부됨";
}

function init() {
  getClock();
  setInterval(getClock, 1000);
  getBackgroundImage();
  navigator.geolocation.getCurrentPosition(onGeoOk, onGeoError);

  loginForm.addEventListener("submit", onLoginSubmit);
  logoutBtn.addEventListener("click", onLogoutClick);
  toDoForm.addEventListener("submit", handleToDoSubmit);

  checkLoginStatus();
}

document.addEventListener("DOMContentLoaded", init);
