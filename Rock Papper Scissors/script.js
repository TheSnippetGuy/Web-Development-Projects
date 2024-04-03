let rockBtn = document.querySelector("#rock");
let paperBtn = document.querySelector("#paper");
let scissorsBtn = document.querySelector("#scissors");
let btns = document.querySelectorAll(".icons");
let result = document.querySelector("#result");
let submitBtn = document.querySelector("#submit");
let resetBtn = document.querySelector("#reset");
let userScore = document.querySelector(".user-score");
let compScore = document.querySelector(".comp-score");
userScore.innerText = 0;
compScore.innerText = 0;

let options = ["rock", "paper", "scissors"];

let computerChoice = options[Math.floor(Math.random() * 3)];

function addColor(btn1, btn2, btn3) {
  btn1.classList.add("active");
  btn2.classList.remove("active");
  btn3.classList.remove("active");
}

paperBtn.addEventListener("click", () => {
  userChoice = paperBtn.getAttribute("id");
  addColor(paperBtn, rockBtn, scissorsBtn);
});

rockBtn.addEventListener("click", () => {
  userChoice = rockBtn.getAttribute("id");
  addColor(rockBtn, paperBtn, scissorsBtn);
});

scissorsBtn.addEventListener("click", () => {
  userChoice = scissorsBtn.getAttribute("id");
  addColor(scissorsBtn, paperBtn, rockBtn);
});

function playGame() {
  if (userChoice === computerChoice) {
    drawGame();
  } else if (userChoice === "rock") {
    if (computerChoice === "scissors") {
      userWin();
    } else {
      computerWin();
    }
  } else if (userChoice === "paper") {
    if (computerChoice === "rock") {
      userWin();
    } else {
      computerWin();
    }
  } else if (userChoice === "scissors") {
    if (computerChoice === "paper") {
      userWin();
    } else {
      computerWin();
    }
  }
}

function drawGame() {
  result.classList.add("tied");
  result.innerText = `Game Draw...! Your Choice was ${userChoice} and computer Choice was ${computerChoice}  😤😤😤`;
  setTimeout(() => {
    result.classList.remove("tied");
  }, 2000);
}

function userWin() {
  result.classList.add("win");
  result.innerText = `Your Choice was ${userChoice} and computer Choice was ${computerChoice} Congrats.! You Win...!😍😍😍`;
  userScore.innerText++;
  setTimeout(() => {
    result.classList.remove("win");
  }, 2000);
}
function computerWin() {
  result.classList.add("lose");
  result.innerText = `Your Choice was ${userChoice} and computer Choice was ${computerChoice} Computer Win...! Better Luck Next Time...!😥😥😥`;
  compScore.innerText++;
  setTimeout(() => {
    result.classList.remove("lose");
  }, 2000);
}

submitBtn.addEventListener("click", () => {
  playGame();
  setTimeout(() => {
    resetGame();
  }, 2000);
});

function resetGame() {
  result.innerText = "";
  btns.forEach((btn) => {
    btn.classList.remove("active");
  });
  result.classList.remove("lose");
}

resetBtn.addEventListener("click", () => {
  userScore.innerText = 0;
  compScore.innerText = 0;
});
