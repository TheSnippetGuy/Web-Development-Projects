let inputSlider = document.querySelector(".slider");
let passwordDisplay = document.querySelector(".length-display");
let inputDisplay = document.querySelector("#inputDisplay");
let copyBtn = document.querySelector(".copy-btn");
let includesUpperCase = document.querySelector("#uppercase");
let includesLowerCase = document.querySelector("#lowercase");
let includesDigit = document.querySelector("#numbers");
let includesSymbol = document.querySelector("#symbols");
let passwordStrength = document.querySelector(".password-strength");
let options = document.querySelectorAll("input[type=checkbox]");
let generatePassword = document.querySelector(".generate");
let notify = document.querySelector(".notify");

let password = "";
let passwordLength = 4;

let containsUpper = false;
let containsLower = false;
let containsDigit = false;
let containsSymbols = false;
let optionCount = 0;

const min = inputSlider.min;
const max = inputSlider.max;

function handleSliderValue() {
  passwordDisplay.innerText = passwordLength;
  inputSlider.value = passwordLength;
  const min = inputSlider.min;
  const max = inputSlider.max;
  inputSlider.style.backgroundSize =
    ((passwordLength - min) * 100) / (max - min) + "%100%";
}

handleSliderValue();

inputSlider.addEventListener("input", (evt) => {
  passwordLength = evt.target.value;
  handleSliderValue();
});

// Generating LowerCase Alphabets
function generateLowerCase() {
  return String.fromCharCode(Math.trunc(Math.random() * (123 - 97) + 97));
}

// Generating UpperCase Alphabets
function generateUpperCase() {
  return String.fromCharCode(
    Math.trunc(Math.random() * (123 - 97) + 97)
  ).toUpperCase();
}

// Generating LowerCase Symbols
function generateDigits() {
  return Math.trunc(Math.random() * 9);
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

let symbols = "`~!@#$%^&*()_+{}|/,.<>?";

//Generate Random Symbols
function generateSymbols() {
  return symbols[Math.trunc(Math.random() * symbols.length)];
}

function showStrength(strength, color) {
  passwordStrength.innerText = strength;
  passwordStrength.style.color = color;
}

showStrength("weak", "red");

function calcStrength() {
  if (includesUpperCase.checked) {
    containsUpper = true;
  }
  if (includesLowerCase.checked) {
    containsLower = true;
  }
  if (includesDigit.checked) {
    containsDigit = true;
  }
  if (includesSymbol.checked) {
    containsSymbols = true;
  }

  if (
    containsUpper &&
    containsLower &&
    (containsDigit || containsSymbols) &&
    passwordLength >= 6
  ) {
    showStrength("Strong", "Green");
  } else if (
    (containsUpper || containsLower) &&
    (containsDigit || containsSymbols) &&
    passwordLength >= 4
  ) {
    showStrength("Medium", "yellow");
  } else {
    showStrength("weak", "red");
  }
}

function handleOptions() {
  optionCount = 0;
  options.forEach((option) => {
    if (option.checked) {
      optionCount++;
    }
  });
  if (passwordLength < optionCount) {
    passwordLength = optionCount;
    handleSliderValue();
  }
}

options.forEach((option) => {
  option.addEventListener("change", handleOptions);
});

function shuffle(password) {
  let a = password.split(""),
    n = a.length;
  for (let i = n - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = a[i];
    a[i] = a[j];
    a[j] = temp;
  }
  return a.join("");
}

generatePassword.addEventListener("click", () => {
  if (optionCount <= 0) {
    return;
  }
  if (passwordLength < optionCount) {
    passwordLength = optionCount;
    handleSliderValue();
  }

  password = "";
  let randPassword = [];

  if (includesUpperCase.checked) {
    randPassword.push(generateUpperCase);
  }

  if (includesLowerCase.checked) {
    randPassword.push(generateLowerCase);
  }

  if (includesDigit.checked) {
    randPassword.push(generateDigits);
  }

  if (includesSymbol.checked) {
    randPassword.push(generateSymbols);
  }

  for (let i = 0; i < randPassword.length; i++) {
    password += randPassword[i]();
  }

  for (let i = 0; i < passwordLength - randPassword.length; i++) {
    let randIndex = getRandomInteger(0, randPassword.length);
    password += randPassword[randIndex]();
  }
  password = shuffle(password);

  inputDisplay.value = password;
  calcStrength();
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(inputDisplay.value);
    if (inputDisplay.value) {
      alert("Text Copied to Clipboard");
    }
  } catch (err) {
    alert("Copied to Failed");
  }
});
