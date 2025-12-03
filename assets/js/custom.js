document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("contact-form");
  const resultDiv = document.getElementById("form-result");
  if (!form) return;

  const fields = {
    vardas: form.vardas,
    pavarde: form.pavarde,
    email: form.email,
    telefonas: form.telefonas,
    adresas: form.adresas,
    dizainas: form.dizainas,
    turinys: form.turinis || form.turinys,
    patogumas: form.patogumas
  };

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.disabled = true;

  function setError(input, message) {
    input.classList.add("input-error");

    let error = input.nextElementSibling;
    if (!error || !error.classList.contains("error-text")) {
      error = document.createElement("div");
      error.className = "error-text";
      input.parentNode.insertBefore(error, input.nextSibling);
    }
    error.textContent = message;
  }

  function clearError(input) {
    input.classList.remove("input-error");
    let error = input.nextElementSibling;
    if (error && error.classList.contains("error-text")) {
      error.textContent = "";
    }
  }

  // showErrors = true – rodo klaidas, false – tikrina tyliai (mygtukui)
  function validateField(name, showErrors = true) {
    const input = fields[name];
    if (!input) return true;
    const value = input.value.trim();
    let errorMessage = "";

    // Privaloma
    if (!value) {
      errorMessage = "Šis laukas privalomas.";
    } else {
      if (name === "vardas" || name === "pavarde") {
        const nameRegex = /^[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž\s'-]+$/;
        if (!nameRegex.test(value)) {
          errorMessage = "Naudokite tik raides.";
        }
      }

      if (name === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = "Neteisingas el. pašto formatas.";
        }
      }

      if (name === "adresas") {
        if (value.length < 4) {
          errorMessage = "Adresas per trumpas.";
        }
      }

      if (name === "dizainas" || name === "turinys" || name === "patogumas") {
        const num = Number(value);
        if (Number.isNaN(num) || num < 1 || num > 10) {
          errorMessage = "Įveskite skaičių nuo 1 iki 10.";
        }
      }

      if (name === "telefonas") {
        // Švelnesnė validacija – leidžia 86..., 6..., +3706...
        const digits = value.replace(/\D/g, "");
        if (
          !(
            /^3706\d{7}$/.test(digits) || // +3706xxxxxxx
            /^86\d{7}$/.test(digits) ||   // 86xxxxxxx
            /^6\d{7}$/.test(digits)       // 6xxxxxxx
          )
        ) {
          errorMessage = "Įveskite teisingą tel. numerį (pvz. 86xxxxxxx).";
        }
      }
    }

    if (showErrors) {
      if (errorMessage) {
        setError(input, errorMessage);
      } else {
        clearError(input);
      }
    }

    return !errorMessage;
  }

  function updateSubmitState() {
    let allValid = true;
    for (const name in fields) {
      if (!validateField(name, false)) {
        allValid = false;
      }
    }
    if (submitBtn) {
      submitBtn.disabled = !allValid;
    }
  }

  function handlePhoneInput(e) {
    let digits = e.target.value.replace(/\D/g, "");

    // Konvertuojam dažniausius variantus
    if (digits.startsWith("06")) {
      // 86xxxxxxx -> 3706xxxxxxx
      digits = "3706" + digits.slice(2);
    } else if (digits.startsWith("6")) {
      // 6xxxxxxx -> 3706xxxxxxx
      digits = "370" + digits;
    }

    if (digits.startsWith("370")) {
      e.target.value = "+" + digits; // +3706xxxxxxx
    } else {
      e.target.value = digits; // paliekam tik skaičius, jei kas kita
    }
  }

  Object.keys(fields).forEach((name) => {
    const input = fields[name];
    if (!input) return;

    if (name === "telefonas") {
      input.addEventListener("input", (e) => {
        handlePhoneInput(e);
        validateField("telefonas", true);
        updateSubmitState();
      });
    } else {
      input.addEventListener("input", () => {
        // Validuojam tik tą lauką, kurį dabar pildo
        validateField(name, true);
        updateSubmitState();
      });
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    // Paskutinė patikra
    updateSubmitState();
    if (submitBtn && submitBtn.disabled) return;

    const formData = {
      vardas: fields.vardas.value.trim(),
      pavarde: fields.pavarde.value.trim(),
      email: fields.email.value.trim(),
      telefonas: fields.telefonas.value.trim(),
      adresas: fields.adresas.value.trim(),
      dizainas: fields.dizainas.value.trim(),
      turinys: fields.turinys.value.trim(),
      patogumas: fields.patogumas.value.trim()
    };

    console.log(formData);

    const diz = Number(formData.dizainas);
    const tur = Number(formData.turinys);
    const pat = Number(formData.patogumas);
    const avg = ((diz + tur + pat) / 3).toFixed(1);

    if (resultDiv) {
      resultDiv.innerHTML = `
        <h5>Įvesti duomenys:</h5>
        <p>
          Vardas: <strong>${formData.vardas}</strong><br>
          Pavardė: <strong>${formData.pavarde}</strong><br>
          El. paštas: <strong>${formData.email}</strong><br>
          Tel. numeris: <strong>${formData.telefonas}</strong><br>
          Adresas: <strong>${formData.adresas}</strong><br>
          Dizaino vertinimas: <strong>${formData.dizainas}/10</strong><br>
          Turinio vertinimas: <strong>${formData.turinys}/10</strong><br>
          Patogumo vertinimas: <strong>${formData.patogumas}/10</strong>
        </p>
        <p style="font-size: 1.2rem; color: #ff6600;">
          <strong>${formData.vardas} ${formData.pavarde} vidurkis:</strong> ${avg}
        </p>
      `;
    }

    showSuccessPopup();
  });

  /* ====== ŽAIDIMO KODAS  ====== */

  const gameBoard = document.getElementById("game-board");
  const gameDifficultySelect = document.getElementById("game-difficulty");
  const gameStartBtn = document.getElementById("game-start-btn");
  const gameResetBtn = document.getElementById("game-reset-btn");
  const gameMovesSpan = document.getElementById("game-moves");
  const gameMatchesSpan = document.getElementById("game-matches");
  const gameMessageDiv = document.getElementById("game-message");
  const bestEasySpan = document.getElementById("best-easy");
  const bestHardSpan = document.getElementById("best-hard");
  const gameTimerSpan = document.getElementById("game-timer");

  let gameRunning = false; // ar žaidimas šiuo metu aktyvus

  // Duomenų rinkinys – bent 6 unikalūs elementai
  const cardIcons = [
    "⚡", "💻", "🐱", "📐", "📡", "🔋",
    "🤖", "🧠", "🎧", "📊", "🔌", "🛰️"
  ];

  // Būsena
  let currentCards = [];
  let moves = 0;
  let matches = 0;
  let totalPairs = 0;

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;

  // Laikmatis
  let timerInterval = null;
  let elapsedSeconds = 0;

  function updateTimerDisplay() {
    if (gameTimerSpan) {
      gameTimerSpan.textContent = `${elapsedSeconds} s`;
    }
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function startTimer() {
    // pradeda skaičiuoti nuo 0 kiekvienam naujam žaidimui
    stopTimer();
    elapsedSeconds = 0;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      elapsedSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function resetSelection() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }

  function resetGameState() {
    moves = 0;
    matches = 0;
    totalPairs = 0;
    resetSelection();
    stopTimer();
    elapsedSeconds = 0;
    updateTimerDisplay();

    if (gameMovesSpan) gameMovesSpan.textContent = "0";
    if (gameMatchesSpan) gameMatchesSpan.textContent = "0";
    if (gameMessageDiv) gameMessageDiv.textContent = "";
  }

  // Highscore iš localStorage
  function loadBestScores() {
    const bestEasy = localStorage.getItem("memoryBest_easy");
    const bestHard = localStorage.getItem("memoryBest_hard");

    if (bestEasySpan) bestEasySpan.textContent = bestEasy ? bestEasy : "-";
    if (bestHardSpan) bestHardSpan.textContent = bestHard ? bestHard : "-";
  }

  function updateBestScoreIfNeeded() {
    if (!gameDifficultySelect) return;

    const difficulty = gameDifficultySelect.value === "hard" ? "hard" : "easy";
    const key = difficulty === "hard" ? "memoryBest_hard" : "memoryBest_easy";

    const currentBestStr = localStorage.getItem(key);
    const currentBest = currentBestStr ? parseInt(currentBestStr, 10) : null;

    // mažesnis ėjimų skaičius = geresnis rezultatas
    if (currentBest === null || moves < currentBest) {
      localStorage.setItem(key, moves.toString());

      if (difficulty === "hard" && bestHardSpan) {
        bestHardSpan.textContent = moves.toString();
      } else if (difficulty === "easy" && bestEasySpan) {
        bestEasySpan.textContent = moves.toString();
      }
    }
  }

  // Lentos išdėstymas pagal sudėtingumą
  function applyBoardLayout() {
    if (!gameBoard || !gameDifficultySelect) return;

    if (gameDifficultySelect.value === "hard") {
      // 6x4 lenta
      gameBoard.style.gridTemplateColumns = "repeat(6, minmax(60px, 1fr))";
    } else {
      // 4x3 lenta
      gameBoard.style.gridTemplateColumns = "repeat(4, minmax(80px, 1fr))";
    }
  }

  // Pasirenkam kiek unikalių ikonų pagal sudėtingumą ir sugeneruojam poras
  function getCardsForDifficulty() {
    if (!gameDifficultySelect) return [];

    let uniqueCount;
    switch (gameDifficultySelect.value) {
      case "hard":   // 6x4 = 24 kortelės → 12 porų
        uniqueCount = 12;
        break;
      case "easy":   // 4x3 = 12 kortelių → 6 porų
      default:
        uniqueCount = 6;
        break;
    }

    uniqueCount = Math.min(uniqueCount, cardIcons.length);
    const base = cardIcons.slice(0, uniqueCount);

    const pairArray = [...base, ...base]; // poros

    // Permaišom
    for (let i = pairArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pairArray[i], pairArray[j]] = [pairArray[j], pairArray[i]];
    }

    totalPairs = uniqueCount;
    return pairArray;
  }

  // Kortelės paspaudimas (apvertimas)
  function handleCardClick(e) {
    const card = e.currentTarget;

    if (!gameRunning) return;  
    if (lockBoard) return;                     
    if (card === firstCard) return;           
    if (card.classList.contains("flipped")) return;

    // apverčiam kortelę ir parodom turinį
    card.classList.add("flipped");
    card.textContent = card.dataset.icon;

    if (!firstCard) {
      firstCard = card;
      return;
    }

    // antroji kortelė
    secondCard = card;
    moves++;
    if (gameMovesSpan) gameMovesSpan.textContent = moves.toString();

    checkForMatch();
  }

  function checkForMatch() {
    const isMatch = firstCard.dataset.icon === secondCard.dataset.icon;

    if (isMatch) {
      // Paliekam atvertas – jų spausti daugiau negalima
      firstCard.style.pointerEvents = "none";
      secondCard.style.pointerEvents = "none";
      matches++;
      if (gameMatchesSpan) gameMatchesSpan.textContent = matches.toString();

      resetSelection();

      // Laimėjimo pranešimas + highscore + stop timer
      if (matches === totalPairs) {
        if (gameMessageDiv) gameMessageDiv.textContent = "Laimėjote!";
        stopTimer();
        updateBestScoreIfNeeded();
      }
    } else {
      // Užrakinam lentą ir po trumpo laiko užverčiam abi
      lockBoard = true;
      setTimeout(() => {
        firstCard.classList.remove("flipped");
        firstCard.textContent = "";
        secondCard.classList.remove("flipped");
        secondCard.textContent = "";
        resetSelection();
      }, 800);
    }
  }

  // Dinaminis lentos generavimas
  function renderBoard() {
    if (!gameBoard) return;

    gameBoard.innerHTML = "";
    currentCards = getCardsForDifficulty();
    resetSelection();

    currentCards.forEach((icon, index) => {
      const card = document.createElement("div");
      card.className = "game-card";
      card.dataset.index = index;
      card.dataset.icon = icon;
      card.textContent = ""; // iš pradžių – paslėptas turinys

      card.addEventListener("click", handleCardClick);

      gameBoard.appendChild(card);
    });
  }

  function startGame() {
    resetGameState();
    applyBoardLayout();
    gameBoard.style.display = "grid";
    renderBoard();
    // laikmatis turi startuoti, kai paspaudžiamas „Start“ (ir „Atnaujinti“ – naujas žaidimas)
    startTimer();
    gameRunning = true;
  }

  if (gameStartBtn) {
    gameStartBtn.addEventListener("click", startGame);
  }

  if (gameResetBtn) {
    gameResetBtn.addEventListener("click", startGame);
  }

  if (gameDifficultySelect) {
    gameDifficultySelect.addEventListener("change", () => {
      // pakeitus sudėtingumą – nauja lenta ir reset, laikmatis neprivalo tęstis
      resetGameState();
      applyBoardLayout();
      gameBoard.style.display = "none"; 
      gameRunning = false;
    });
  }

  // Įkėlus puslapį – nuskaityti best score iš localStorage ir atvaizduoti
  loadBestScores();
  // Pradinė lenta (be auto starto) – kad kažką matytų, bet laikmatis neskaičiuoja, kol nepaspaustas Start
  if (gameBoard && gameDifficultySelect) {
    resetGameState();
    applyBoardLayout();
    gameBoard.style.display = "none";
    gameRunning = false;
  }
}
)