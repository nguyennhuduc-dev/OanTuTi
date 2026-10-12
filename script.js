"use strict";

// ========================================
// 1. CẤU HÌNH VÀ DỮ LIỆU
// ========================================

const $ = (selector) => document.querySelector(selector);

const choices = {
  rock: { label: "Búa", emoji: "✊" },
  paper: { label: "Bao", emoji: "✋" },
  scissors: { label: "Kéo", emoji: "✌️" }
};

// Búa thắng Kéo, Bao thắng Búa, Kéo thắng Bao
const beats = {
  rock: "scissors",
  paper: "rock",
  scissors: "paper"
};

const STORAGE_KEY = "neonArenaStatsV21";

let playerScore = 0;
let cpuScore = 0;
let round = 1;
let finished = false;
let soundEnabled = false;
let audioContext = null;
let moveHistory = [];
let stats = loadStats();

// ========================================
// 2. THỐNG KÊ VÀ LOCAL STORAGE
// ========================================

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
      const data = JSON.parse(saved);

      return {
        ...defaultStats(),
        ...data,
        history: Array.isArray(data.history)
          ? data.history
          : []
      };
    }
  } catch (error) {
    console.error("Lỗi tải thống kê:", error);
  }

  return defaultStats();
}

function saveStats() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(stats)
    );
  } catch (error) {
    console.error("Lỗi lưu thống kê:", error);
  }
}

// ========================================
// 3. KIỂM TRA CÁC PHẦN TỬ HTML
// ========================================

function checkHTML() {
  const requiredIds = [
    "playerScore",
    "cpuScore",
    "roundNumber",
    "progressText",
    "progressBar",
    "playerHand",
    "cpuHand",
    "resultBox",
    "resultSymbol",
    "resultTitle",
    "resultDetail",
    "modeSelect",
    "difficultySelect",
    "statusLabel",
    "wins",
    "losses",
    "winRate",
    "bestStreak",
    "historyList"
  ];

  const missing = requiredIds.filter(
    (id) => !document.getElementById(id)
  );

  if (missing.length > 0) {
    console.error(
      "Không tìm thấy các ID trong HTML:",
      missing.join(", ")
    );

    return false;
  }

  return true;
}

// ========================================
// 4. CẬP NHẬT ĐIỂM
// ========================================

function getTargetScore() {
  return Number($("#modeSelect").value) === 5 ? 3 : 2;
}

function updateBoard() {
  // Cập nhật điểm ngay sau mỗi ván
  $("#playerScore").textContent = String(playerScore);
  $("#cpuScore").textContent = String(cpuScore);
  $("#roundNumber").textContent = String(round);

  const target = getTargetScore();
  const progress = Math.max(playerScore, cpuScore);

  $("#progressText").textContent =
    `${progress} / ${target} điểm`;

  $("#progressBar").style.width =
    `${Math.min(100, (progress / target) * 100)}%`;
}

// ========================================
// 5. HIỂN THỊ KẾT QUẢ
// ========================================

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
  [$("#playerHand"), $("#cpuHand")].forEach((element) => {
    element.classList.remove("animate");

    // Kích hoạt lại animation
    void element.offsetWidth;

    element.classList.add("animate");
  });
}

// ========================================
// 6. MÁY TÍNH CHỌN NƯỚC ĐI
// ========================================

function randomChoice() {
  const keys = Object.keys(choices);

  return keys[Math.floor(Math.random() * keys.length)];
}

function pickCpuChoice() {
  const difficulty = $("#difficultySelect").value;

  // Dễ: hoàn toàn ngẫu nhiên
  if (difficulty === "easy" || moveHistory.length === 0) {
    return randomChoice();
  }

  // Thường: đôi lúc chọn ngẫu nhiên
  if (difficulty === "normal" && Math.random() < 0.55) {
    return randomChoice();
  }

  // Khó: phân tích lựa chọn người chơi đã dùng
  const counts = {
    rock: 0,
    paper: 0,
    scissors: 0
  };

  moveHistory.forEach((move) => {
    counts[move]++;
  });

  const mostUsed = Object.keys(counts).reduce((a, b) =>
    counts[a] >= counts[b] ? a : b
  );

  // Chọn lựa chọn thắng nước đi người chơi hay dùng nhất
  const counter = Object.keys(beats).find(
    (key) => beats[key] === mostUsed
  );

  if (
    difficulty === "hard" ||
    Math.random() < 0.65
  ) {
    return counter || randomChoice();
  }

  return randomChoice();
}

// ========================================
// 7. ÂM THANH
// ========================================

function playSound(kind) {
  if (!soundEnabled) return;

  try {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return;

    audioContext = audioContext || new AudioContextClass();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.type = "sine";

    oscillator.frequency.value =
      kind === "win" ? 660 :
      kind === "lose" ? 220 : 420;

    gain.gain.setValueAtTime(
      0.07,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.18
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.18);
  } catch (error) {
    console.warn("Không thể phát âm thanh:", error);
  }
}

// ========================================
// 8. HIỆU ỨNG CHIẾN THẮNG
// ========================================

function celebrate() {
  const container = $("#celebration");
  const colors = [
    "#a78bfa",
    "#60a5fa",
    "#4adea2",
    "#facc75",
    "#fb7185"
  ];

  for (let i = 0; i < 65; i++) {
    const piece = document.createElement("span");

    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;

    piece.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    piece.style.animationDelay =
      `${Math.random() * 0.5}s`;

    piece.style.animationDuration =
      `${1.3 + Math.random()}s`;

    container.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 3000);
  }
}

// ========================================
// 9. CHƠI MỘT VÁN
// ========================================

function playRound(playerChoice) {
  // Không cho chơi nếu trận đã kết thúc
  if (finished) return;

  // Kiểm tra lựa chọn hợp lệ
  if (!Object.prototype.hasOwnProperty.call(choices, playerChoice)) {
    console.error("Lựa chọn không hợp lệ:", playerChoice);
    return;
  }

  const cpuChoice = pickCpuChoice();

  // Lưu lựa chọn của người chơi để máy phân tích
  moveHistory.push(playerChoice);

  // Hiển thị hai lựa chọn
  $("#playerHand").textContent = choices[playerChoice].emoji;
  $("#cpuHand").textContent = choices[cpuChoice].emoji;

  animateHands();

  let result;

  // So sánh lựa chọn và cộng điểm
  if (playerChoice === cpuChoice) {
    result = "draw";

    setResult(
      "draw",
      "＝",
      "HÒA VÁN!",
      `${choices[playerChoice].label} gặp ${choices[cpuChoice].label}. Không ai được điểm.`
    );
  } else if (beats[playerChoice] === cpuChoice) {
    result = "win";

    // QUAN TRỌNG: cộng điểm cho người chơi
    playerScore += 1;

    setResult(
      "win",
      "✦",
      "BẠN THẮNG VÁN NÀY!",
      `${choices[playerChoice].label} thắng ${choices[cpuChoice].label}.`
    );
  } else {
    result = "lose";

    // QUAN TRỌNG: cộng điểm cho máy tính
    cpuScore += 1;

    setResult(
      "lose",
      "↘",
      "MÁY TÍNH THẮNG VÁN NÀY",
      `${choices[cpuChoice].label} thắng ${choices[playerChoice].label}.`
    );
  }

  // Tăng số ván đã chơi
  round += 1;

  // QUAN TRỌNG: cập nhật giao diện sau khi tính điểm
  updateBoard();

  playSound(result);

  // Kiểm tra điều kiện kết thúc
  const target = getTargetScore();

  if (playerScore >= target) {
    finishMatch("win");
  } else if (cpuScore >= target) {
    finishMatch("lose");
  }
}

// ========================================
// 10. KẾT THÚC TRẬN ĐẤU
// ========================================

function finishMatch(result) {
  if (finished) return;

  // Đánh dấu trước để tránh kết thúc hai lần
  finished = true;

  const mode = `BO${$("#modeSelect").value}`;

  const date = new Date().toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

  if (result === "win") {
    stats.wins += 1;
    stats.currentStreak += 1;

    stats.bestStreak = Math.max(
      stats.bestStreak,
      stats.currentStreak
    );

    setResult(
      "win",
      "🏆",
      "CHIẾN THẮNG CHUNG CUỘC!",
      `Bạn thắng ${playerScore} - ${cpuScore}. Chúc mừng!`
    );

    $("#statusLabel").textContent = "CHIẾN THẮNG";

    celebrate();
  } else {
    stats.losses += 1;
    stats.currentStreak = 0;

    setResult(
      "lose",
      "🤖",
      "TRẬN ĐẤU KẾT THÚC",
      `Máy tính thắng ${cpuScore} - ${playerScore}. Thử lại nhé!`
    );

    $("#statusLabel").textContent = "ĐÃ KẾT THÚC";
  }

  stats.history.unshift({
    result,
    mode,
    date,
    playerScore,
    cpuScore
  });

  // Giới hạn lịch sử 20 trận
  stats.history = stats.history.slice(0, 20);

  saveStats();
  renderStats();

  // Khóa các nút chọn cho đến khi bắt đầu trận mới
  document.querySelectorAll(".choice").forEach((button) => {
    button.disabled = true;
  });

  playSound(result);
}

// ========================================
// 11. HIỂN THỊ THỐNG KÊ
// ========================================

function renderStats() {
  $("#wins").textContent = String(stats.wins);
  $("#losses").textContent = String(stats.losses);
  $("#bestStreak").textContent = String(stats.bestStreak);

  const total = stats.wins + stats.losses;

  const rate = total === 0
    ? 0
    : Math.round((stats.wins / total) * 100);

  $("#winRate").textContent = `${rate}%`;

  renderHistory();
}

function renderHistory() {
  const list = $("#historyList");
  list.replaceChildren();

  if (stats.history.length === 0) {
    const empty = document.createElement("div");

    empty.className = "empty-history";
    empty.textContent = "🎮 Lịch sử sẽ xuất hiện tại đây.";

    list.appendChild(empty);
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
    score.textContent = `${item.playerScore} - ${item.cpuScore}`;

    row.append(symbol, main, score);
    list.appendChild(row);
  });
}

// ========================================
// 12. BẮT ĐẦU TRẬN MỚI
// ========================================

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
    "Chọn một biểu tượng để bắt đầu."
  );
}

// ========================================
// 13. GẮN SỰ KIỆN
// ========================================

// Chọn Búa, Bao hoặc Kéo
document.querySelectorAll(".choice").forEach((button) => {
  button.addEventListener("click", () => {
    playRound(button.dataset.choice);
  });
});

// Trận mới
$("#resetBtn").addEventListener("click", resetMatch);

// Đổi BO3 / BO5
$("#modeSelect").addEventListener("change", resetMatch);

// Đổi độ khó
$("#difficultySelect").addEventListener("change", () => {
  moveHistory = [];

  setResult(
    "",
    "🧠",
    "ĐÃ ĐỔI ĐỘ KHÓ",
    "Thiết lập mới sẽ được áp dụng từ ván tiếp theo."
  );
});

// Xóa thống kê
$("#clearBtn").addEventListener("click", () => {
  const confirmed = window.confirm(
    "Bạn có chắc muốn xóa toàn bộ thống kê?"
  );

  if (!confirmed) return;

  stats = defaultStats();

  saveStats();
  renderStats();
});

// Xóa lịch sử
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

// Bật / tắt âm thanh
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

// Phím tắt 1, 2, 3
document.addEventListener("keydown", (event) => {
  if (
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return;
  }

  if (
    ["INPUT", "SELECT", "TEXTAREA"].includes(
      document.activeElement?.tagName
    )
  ) {
    return;
  }

  const keyToChoice = {
    "1": "rock",
    "2": "paper",
    "3": "scissors"
  };

  const selected = keyToChoice[event.key];

  if (!selected) return;

  const button = document.querySelector(
    `[data-choice="${selected}"]`
  );

  if (button && !button.disabled) {
    playRound(selected);
  }
});

// ========================================
// 14. KHỞI TẠO
// ========================================

function initGame() {
  if (!checkHTML()) {
    $("#statusLabel").textContent = "LỖI HTML";
    return;
  }

  updateBoard();
  renderStats();

  console.log("Neon Arena 2.1 đã khởi tạo thành công!");
}

initGame();
