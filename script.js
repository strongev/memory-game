const startBtn = document.getElementById("startBtn");
const nicknameInput = document.getElementById("nickname");
const emailInput = document.getElementById("email");
const gameContainer = document.getElementById("game-container");
const gameBoard = document.getElementById("game-board");
const leaderboard = document.getElementById("leaderboard");

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matches = 0;
let moves = 0;
let startTime;
let cards = [];

const scriptURL = "https://script.google.com/macros/s/AKfycbzfEczkJHmBLWiu72cQE-LkSLy7IWdyzAtUWN0f3sh_TvJxoqCnJArKQMuEsvr_o_zn3A/exec"; // 🔁 замени на свой URL

const images = [
  "1.png", "2.png", "3.png", "4.png",
  "5.png", "6.png", "7.png", "8.png"
];

startBtn.addEventListener("click", () => {
  const nickname = nicknameInput.value.trim();
  const email = emailInput.value.trim();

  if (!nickname || !email) {
    alert("Введіть нікнейм та email перед початком гри.");
    return;
  }

  document.querySelector(".form-container").classList.add("hidden");
  gameContainer.classList.remove("hidden");

  initGame();
});

function initGame() {
  const cardImages = [...images, ...images];
  shuffle(cardImages);

  gameBoard.innerHTML = "";
  matches = 0;
  moves = 0;
  startTime = Date.now();

  cardImages.forEach((img, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.image = img;

    const front = document.createElement("div");
    front.classList.add("front");
    front.style.backgroundImage = `url(assets/${img})`;

    const back = document.createElement("div");
    back.classList.add("back");
    back.textContent = "?";

    card.appendChild(front);
    card.appendChild(back);

    card.addEventListener("click", handleCardClick);

    gameBoard.appendChild(card);
  });

  loadLeaderboard();
}

function handleCardClick(e) {
  if (lockBoard) return;
  const card = e.currentTarget;
  if (card.classList.contains("flipped")) return;

  card.classList.add("flipped");

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves++;

  const isMatch = firstCard.dataset.image === secondCard.dataset.image;

  if (isMatch) {
    matches++;
    resetTurn();

    if (matches === 8) {
      const endTime = Date.now();
      const duration = Math.floor((endTime - startTime) / 1000);
      submitResult(nicknameInput.value, emailInput.value, duration, moves);
    }
  } else {
    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 1000);
  }
}

function resetTurn() {
  [firstCard, secondCard, lockBoard] = [null, null, false];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function submitResult(nickname, email, time, tries) {
  const data = new FormData();
  data.append("nickname", nickname);
  data.append("email", email);
  data.append("time", time);
  data.append("tries", tries);

  fetch(scriptURL, { method: "POST", body: data })
    .then(() => loadLeaderboard())
    .catch((error) => console.error("Error submitting result:", error));
}

function loadLeaderboard() {
  fetch(scriptURL)
    .then((res) => res.json())
    .then((data) => {
      leaderboard.innerHTML = "";
      data.sort((a, b) => Number(a.time) - Number(b.time));
      data.forEach((entry, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${entry.nickname} — ${entry.time}s, ${entry.tries} ходів`;
        leaderboard.appendChild(li);
      });
    })
    .catch((err) => console.error("Error loading leaderboard:", err));
}
