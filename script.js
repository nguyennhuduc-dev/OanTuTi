"use strict";

const $ = (selector) => document.querySelector(selector);

const choices = {
  rock: {
    label: "Búa",
    emoji: "✊"
  },
  paper: {
    label: "Bao",
    emoji: "✋"
  },
  scissors: {
    label: "Kéo",
    emoji: "✌️"
  }
};

const beats = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper"
};

const STORAGE_KEY = "neonArenaStatsV2";

let playerScore = 0;
let cpuScore = 0;
let round = 1;
let finished = false;
let soundEnabled = false;
let audioContext = null;
let moveHistory = [];

function defaultStats() {
  return {
    wins: 0,
    losses: 0,
    bestStreak: 0,
    currentStreak: 0,
    history: []
  };
}


function loadStats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return {
        ...defaultStats(),
        ...JSON.parse(saved)
      };
    }
  } catch (error) {
    console.warn("Không thể đọc dữ liệu:", error);
  }

  return defaultStats();
}

let stats = loadStats();

function saveStats() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(stats)
    );
  } catch (error) {
    console.warn("Không thể lưu thống kê:", error);
  }
}


function renderStats() {
  $("#wins").textContent = stats.wins;
  $("#losses").textContent = stats.losses;
  $("#bestStreak").textContent = stats.bestStreak;

  const total = stats.wins + stats.losses;

  const rate = total === 0
    ? 0
    : Math.round(stats.wins / total * 100);

  $("#winRate").textContent = `${rate}%`;

  renderHistory();
}

function renderHistory() {
  const list = $("#historyList");
  list.replaceChildren();

  if (stats.history.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-history";
    empty.textContent =
      "🎮 Lịch sử trận đấu sẽ xuất hiện tại đây.";

    list.append(empty);
    return;
  }

  stats.history.slice(0, 8).forEach((item) => {
    const row = document.createElement("div");

    row.className = `history-item ${item.result}`;

    const symbol = document.createElement("span");
    symbol.className = "history-symbol";

    symbol.textContent =
      item.result === "win" ? "↗" :
      item.result === "lose" ? "↘" : "＝";

    const main = document.createElement("div");
    main.className = "history-main";

    const title = document.createElement("strong");

    title.textContent =
      item.result === "win" ? "Chiến thắng" :
      item.result === "lose" ? "Thất bại" : "Hòa trận";

    const detail = document.createElement("small");

    detail.textContent = `${item.mode} · ${item.date}`;

    main.append(title, detail);

    const score = document.createElement("span");
    score.className = "history-score";
    score.textContent =
      `${item.playerScore} - ${item.cpuScore}`;

    row.append(symbol, main, score);
    list.append(row);
  });
}


function updateBoard() {
  $("#playerScore").textContent = playerScore;
  $("#cpuScore").textContent = cpuScore;
  $("#roundNumber").textContent = round;

  const target = Number($("#modeSelect").value) === 5
    ? 3
    : 2;

  const progress = Math.max(playerScore, cpuScore);

  $("#progressText").textContent =
    `${progress} / ${target} điểm`;

  $("#progressBar").style.width =
    `${Math.min(100, progress / target * 100)}%`;
}


function setResult(kind, symbol, title, detail) {
  const box = $("#resultBox");

  box.className = kind
    ? `result-box ${kind}`
    : "result-box";

  $("#resultSymbol").textContent = symbol;
  $("#resultTitle").textContent = title;
  $("#resultDetail").textContent = detail;
}

function animateHands() {
  const hands = [
    $("#playerHand"),
    $("#cpuHand")
  ];

  hands.forEach((hand) => {
    hand.classList.remove("animate");

    // Kích hoạt lại hiệu ứng CSS
    void hand.offsetWidth;

    hand.classList.add("animate");
  });
}


function randomChoice() {
  const keys = Object.keys(choices);

  return keys[
    Math.floor(Math.random() * keys.length)
  ];
}

function pickCpuChoice() {
  const difficulty = $("#difficultySelect").value;

  if (difficulty === "easy") {
    return randomChoice();
  }

  if (
    moveHistory.length === 0 ||
    Math.random() < (difficulty === "normal" ? 0.55 : 0.2)
  ) {
    return randomChoice();
  }

  const counts = {
    rock: 0,
    paper: 0,
    scissors: 0
  };

  moveHistory.forEach((move) => {
    counts[move]++;
  });

  const mostUsed = Object.keys(counts).sort(
    (a, b) => counts[b] - counts[a]
  )[0];

  if (difficulty === "hard" || Math.random() < 0.65) {
    return Object.keys(beats).find(
      (key) => beats[key] === mostUsed
    );
  }

  return randomChoice();
}


function playSound(kind) {
  if (!soundEnabled) return;

  try {
    audioContext = audioContext ||
      new (window.AudioContext ||
           window.webkitAudioContext)();

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.type = "sine";

    oscillator.frequency.value =
      kind === "win" ? 660 :
      kind === "lose" ? 220 : 420;

    gain.gain.setValueAtTime(
      0.08,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.16
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.16);
  } catch (error) {
    console.warn("Trình duyệt không hỗ trợ âm thanh.");
  }
}


function celebrate() {
  const container = $("#celebration");

  const colors = [
    "#a78bfa",
    "#60a5fa",
    "#4adea2",
    "#facc75",
    "#fb7185"
  ];

  for (let i = 0; i < 70; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti";

    piece.style.left = `${Math.random() * 100}%`;

    piece.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    piece.style.animationDelay =
      `${Math.random() * 0.65}s`;

    piece.style.animationDuration =
      `${1.2 + Math.random() * 1.2}s`;

    container.append(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 3000);
  }
}


function playRound(playerChoice) {
  if (finished) return;

  const cpuChoice = pickCpuChoice();

  moveHistory.push(playerChoice);

  $("#playerHand").textContent =
    choices[playerChoice].emoji;

  $("#cpuHand").textContent =
    choices[cpuChoice].emoji;

  animateHands();

  let result;

  if (playerChoice === cpuChoice) {
    result = "draw";

    setResult(
      "draw",
      "＝",
      "HÒA VÁN!",
      `${choices[playerChoice].label} gặp ${choices[cpuChoice].label}. Thử lại nhé!`
    );
  } else if (beats[playerChoice] === cpuChoice) {
    result = "win";
    playerScore++;

    setResult(
      "win",
      "✦",
      "BẠN THẮNG VÁN NÀY!",
      `${choices[playerChoice].label} thắng ${choices[cpuChoice].label}. Tiếp tục giữ phong độ!`
    );
  } else {
    result = "lose";
    cpuScore++;

    setResult(
      "lose",
      "↘",
      "MÁY TÍNH THẮNG VÁN NÀY",
      `${choices[cpuChoice].label} thắng ${choices[playerChoice].label}. Bạn vẫn có thể lật kèo!`
    );
  }

  round++;

  updateBoard();
  playSound(result);

  const target = Number($("#modeSelect").value) === 5
    ? 3
    : 2;

  if (playerScore >= target || cpuScore >= target) {
    finishMatch(
      playerScore >= target ? "win" : "lose"
    );
  }
}


function finishMatch(result) {
  finished = true;

  const mode = `BO${$("#modeSelect").value}`;

  const date = new Date().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  if (result === "win") {
    stats.wins++;
    stats.currentStreak++;

    stats.bestStreak = Math.max(
      stats.bestStreak,
      stats.currentStreak
    );

    setResult(
      "win",
      "🏆",
      "CHIẾN THẮNG CHUNG CUỘC!",
      `Bạn thắng ${playerScore} - ${cpuScore}. Đấu trường thuộc về bạn!`
    );

    $("#statusLabel").textContent = "ĐÃ CHIẾN THẮNG";

    celebrate();
  } else {
    stats.losses++;
    stats.currentStreak = 0;

    setResult(
      "lose",
      "🤖",
      "TRẬN ĐẤU KẾT THÚC",
      `Máy tính thắng ${cpuScore} - ${playerScore}. Bắt đầu trận mới để phục thù!`
    );

    $("#statusLabel").textContent = "TRẬN ĐÃ KẾT THÚC";
  }

  stats.history.unshift({
    result,
    mode,
    date,
    playerScore,
    cpuScore
  });

  stats.history = stats.history.slice(0, 20);

  saveStats();
  renderStats();

  document.querySelectorAll(".choice").forEach((button) => {
    button.disabled = true;
  });

  playSound(result);
}


function resetMatch() {
  playerScore = 0;
  cpuScore = 0;
  round = 1;
  finished = false;

  moveHistory = [];

  $("#playerHand").textContent = "✊";
  $("#cpuHand").textContent = "🤖";
  $("#statusLabel").textContent = "SẴN SÀNG";

  document.querySelectorAll(".choice").forEach((button) => {
    button.disabled = false;
  });

  $("#celebration").replaceChildren();

  updateBoard();

  setResult(
    "",
    "⚡",
    "Sẵn sàng chiến đấu?",
    "Chọn một biểu tượng để bắt đầu ván đầu tiên."
  );
}


document.querySelectorAll(".choice").forEach((button) => {
  button.addEventListener("click", () => {
    playRound(button.dataset.choice);
  });
});

$("#resetBtn").addEventListener("click", resetMatch);

$("#clearBtn").addEventListener("click", () => {
  const confirmed = window.confirm(
    "Bạn có chắc muốn xóa toàn bộ thống kê thắng, thua và chuỗi thắng?"
  );

  if (!confirmed) return;

  stats = defaultStats();

  saveStats();
  renderStats();
});

$("#clearHistoryBtn").addEventListener("click", () => {
  if (stats.history.length === 0) return;

  const confirmed = window.confirm(
    "Bạn có chắc muốn xóa lịch sử trận đấu?"
  );

  if (!confirmed) return;

  stats.history = [];

  saveStats();
  renderHistory();
});

$("#modeSelect").addEventListener("change", resetMatch);

$("#difficultySelect").addEventListener("change", () => {
  moveHistory = [];

  setResult(
    "",
    "🧠",
    "Đã đổi độ khó",
    "Máy tính sẽ áp dụng thiết lập mới từ ván tiếp theo."
  );
});

$("#soundBtn").addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  $("#soundBtn").textContent =
    soundEnabled ? "🔊" : "🔇";

  $("#soundBtn").setAttribute(
    "aria-label",
    soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"
  );

  if (soundEnabled) {
    playSound("draw");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) {
    return;
  }

  if (
    ["INPUT", "SELECT", "TEXTAREA"].includes(
      document.activeElement?.tagName
    )
  ) {
    return;
  }

  const map = {
    "1": "rock",
    "2": "paper",
    "3": "scissors"
  };

  if (map[event.key]) {
    const button = document.querySelector(
      `[data-choice="${map[event.key]}"]`
    );

    if (button && !button.disabled) {
      playRound(map[event.key]);
    }
  }
});


updateBoard();
renderStats();
