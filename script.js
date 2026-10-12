```javascript
/* =========================================
   OẲN TÙ TÌ CAPA PRO
   ========================================= */

const icons = {
    rock: "🪨",
    paper: "📄",
    scissors: "✂️"
};

const names = {
    rock: "ROCK",
    paper: "PAPER",
    scissors: "SCISSORS"
};

const beats = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper"
};


/* =========================================
   DATA
   ========================================= */

const defaultData = {
    xp: 0,
    totalXp: 0,
    level: 1,

    wins: 0,
    losses: 0,
    draws: 0,

    streak: 0,
    bestStreak: 0,

    history: [],
    moves: [],

    achievements: {}
};

let data = loadData();


function loadData() {

    const saved = localStorage.getItem("oanTuTiCAPA");

    if (!saved) {
        return { ...defaultData };
    }

    try {
        return {
            ...defaultData,
            ...JSON.parse(saved)
        };
    } catch {
        return { ...defaultData };
    }
}


function saveData() {
    localStorage.setItem(
        "oanTuTiCAPA",
        JSON.stringify(data)
    );
}


/* =========================================
   GAME STATE
   ========================================= */

let playerScore = 0;
let cpuScore = 0;

let round = 1;

let locked = false;
let matchFinished = false;


/* =========================================
   ELEMENTS
   ========================================= */

const playerScoreEl = document.getElementById("playerScore");
const cpuScoreEl = document.getElementById("cpuScore");

const roundText = document.getElementById("roundText");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");

const playerMoveEl = document.getElementById("playerMove");
const cpuMoveEl = document.getElementById("cpuMove");

const resultEl = document.getElementById("result");
const messageEl = document.getElementById("message");

const statusEl = document.getElementById("status");

const streakEl = document.getElementById("streak");
const winsEl = document.getElementById("wins");
const lossesEl = document.getElementById("losses");
const drawsEl = document.getElementById("draws");
const totalXpEl = document.getElementById("totalXp");

const levelEl = document.getElementById("level");
const rankNameEl = document.getElementById("rankName");

const xpBarEl = document.getElementById("xpBar");
const xpTextEl = document.getElementById("xpText");

const achievementsEl = document.getElementById("achievements");
const achievementCountEl =
    document.getElementById("achievementCount");

const historyEl = document.getElementById("history");

const toastEl = document.getElementById("toast");

const modeEl = document.getElementById("mode");
const difficultyEl = document.getElementById("difficulty");


/* =========================================
   XP / LEVEL / RANK
   ========================================= */

function xpNeeded(level) {

    return 100 + (level - 1) * 50;

}


function getRank(level) {

    if (level >= 50) return "LEGEND";
    if (level >= 35) return "MASTER";
    if (level >= 25) return "DIAMOND";
    if (level >= 15) return "PLATINUM";
    if (level >= 8) return "GOLD";
    if (level >= 4) return "SILVER";

    return "BRONZE";
}


function renderProfile() {

    const needed = xpNeeded(data.level);

    const percent =
        Math.min(100, (data.xp / needed) * 100);

    levelEl.textContent = data.level;

    rankNameEl.textContent =
        getRank(data.level);

    xpBarEl.style.width =
        percent + "%";

    xpTextEl.textContent =
        `${data.xp} / ${needed} XP`;

    totalXpEl.textContent =
        data.totalXp;
}


function addXP(amount) {

    data.xp += amount;
    data.totalXp += amount;

    let leveledUp = false;

    while (data.xp >= xpNeeded(data.level)) {

        data.xp -= xpNeeded(data.level);

        data.level++;

        leveledUp = true;
    }

    if (leveledUp) {

        showToast(
            `🎉 LEVEL UP! Bạn đạt Level ${data.level}`
        );
    }

    saveData();

    renderProfile();
}


/* =========================================
   ACHIEVEMENTS
   ========================================= */

const achievementList = [

    {
        id: "first",
        icon: "🥇",
        title: "FIRST WIN",
        description: "Thắng trận đầu tiên",
        check: () => data.wins >= 1
    },

    {
        id: "fighter",
        icon: "⚔️",
        title: "FIGHTER",
        description: "Thắng 5 trận",
        check: () => data.wins >= 5
    },

    {
        id: "hot",
        icon: "🔥",
        title: "HOT STREAK",
        description: "Đạt chuỗi thắng 5",
        check: () => data.bestStreak >= 5
    },

    {
        id: "unstoppable",
        icon: "💀",
        title: "UNSTOPPABLE",
        description: "Đạt chuỗi thắng 10",
        check: () => data.bestStreak >= 10
    },

    {
        id: "elite",
        icon: "💎",
        title: "ELITE",
        description: "Đạt Level 10",
        check: () => data.level >= 10
    },

    {
        id: "capa",
        icon: "🤖",
        title: "CAPA CHALLENGER",
        description: "Thắng CAPA AI",
        check: () =>
            data.history.some(
                item =>
                    item.result === "WIN" &&
                    item.difficulty === "capa"
            )
    },

    {
        id: "survivor",
        icon: "🛡️",
        title: "SURVIVOR",
        description: "Hoàn thành Survival",
        check: () =>
            data.history.some(
                item =>
                    item.mode === "survival" &&
                    item.result === "WIN"
            )
    }
];


function renderAchievements() {

    let unlocked = 0;

    achievementsEl.innerHTML = "";

    achievementList.forEach(a => {

        const isUnlocked = a.check();

        if (isUnlocked) {
            unlocked++;

            data.achievements[a.id] = true;
        }

        const div = document.createElement("div");

        div.className =
            "achievement " +
            (isUnlocked ? "unlocked" : "locked");

        div.innerHTML = `
            <div class="achievement-icon">
                ${isUnlocked ? a.icon : "🔒"}
            </div>

            <div class="achievement-info">
                <strong>${a.title}</strong>
                <span>${a.description}</span>
            </div>
        `;

        achievementsEl.appendChild(div);
    });

    achievementCountEl.textContent =
        `${unlocked} / ${achievementList.length}`;

    saveData();
}


/* =========================================
   HISTORY
   ========================================= */

function renderHistory() {

    if (data.history.length === 0) {

        historyEl.innerHTML = `
            <div class="empty">
                Chưa có trận đấu nào.
            </div>
        `;

        return;
    }

    historyEl.innerHTML =
        data.history
            .slice()
            .reverse()
            .slice(0, 12)
            .map(item => {

                let icon = "🤝";

                if (item.result === "WIN") {
                    icon = "🏆";
                }

                if (item.result === "LOSS") {
                    icon = "❌";
                }

                return `
                    <div class="history-item">

                        <span>
                            ${icon}
                            ${item.result}
                        </span>

                        <span>
                            ${item.mode.toUpperCase()}
                        </span>

                        <span>
                            ${item.player} -
                            ${item.cpu}
                        </span>

                        <span>
                            +${item.xp} XP
                        </span>

                    </div>
                `;
            })
            .join("");
}


/* =========================================
   TOAST
   ========================================= */

let toastTimer;

function showToast(text) {

    clearTimeout(toastTimer);

    toastEl.textContent = text;

    toastEl.classList.add("show");

    toastTimer = setTimeout(() => {

        toastEl.classList.remove("show");

    }, 2200);
}


/* =========================================
   AI
   ========================================= */

function randomMove() {

    const moves =
        ["rock", "paper", "scissors"];

    return moves[
        Math.floor(Math.random() * moves.length)
    ];
}


function weightedChoice() {

    const recent =
        data.moves.slice(-8);

    if (recent.length === 0) {
        return randomMove();
    }

    const count = {
        rock: 0,
        paper: 0,
        scissors: 0
    };

    recent.forEach(move => {
        count[move]++;
    });

    const total = recent.length;

    const random = Math.random() * total;

    let current = 0;

    for (const move in count) {

        current += count[move];

        if (random <= current) {
            return move;
        }
    }

    return randomMove();
}


function predictPlayer() {

    if (data.moves.length < 2) {
        return weightedChoice();
    }

    const last =
        data.moves[data.moves.length - 1];

    const transitions = {
        rock: [],
        paper: [],
        scissors: []
    };

    for (let i = 0; i < data.moves.length - 1; i++) {

        if (data.moves[i] === last) {

            transitions[last].push(
                data.moves[i + 1]
            );
        }
    }

    if (transitions[last].length === 0) {
        return weightedChoice();
    }

    const list =
        transitions[last];

    return list[
        Math.floor(Math.random() * list.length)
    ];
}


function cpuMove() {

    const difficulty =
        difficultyEl.value;

    if (difficulty === "easy") {
        return randomMove();
    }

    if (difficulty === "normal") {

        if (Math.random() < 0.65) {

            const prediction =
                predictPlayer();

            return beats[prediction];
        }

        return randomMove();
    }

    if (difficulty === "hard") {

        if (Math.random() < 0.78) {

            const prediction =
                predictPlayer();

            return beats[prediction];
        }

        return randomMove();
    }

    // CAPA AI

    if (Math.random() < 0.90) {

        const prediction =
            predictPlayer();

        return beats[prediction];
    }

    return randomMove();
}


/* =========================================
   RESULT
   ========================================= */

function getResult(player, cpu) {

    if (player === cpu) {
        return "draw";
    }

    if (beats[player] === cpu) {
        return "win";
    }

    return "lose";
}


/* =========================================
   UPDATE BOARD
   ========================================= */

function updateBoard() {

    playerScoreEl.textContent =
        playerScore;

    cpuScoreEl.textContent =
        cpuScore;

    roundText.textContent =
        `ROUND ${round}`;

    const mode =
        modeEl.value;

    let target = 2;

    if (mode === "bo5") {
        target = 3;
    }

    if (mode === "survival") {
        target = 5;
    }

    const progress =
        Math.min(
            100,
            ((playerScore + cpuScore) / target) * 100
        );

    progressBar.style.width =
        progress + "%";

    if (mode === "bo3") {

        progressText.textContent =
            "BO3 • FIRST TO 2";

    } else if (mode === "bo5") {

        progressText.textContent =
            "BO5 • FIRST TO 3";

    } else {

        progressText.textContent =
            "SURVIVAL • WIN 5";

    }

    streakEl.textContent =
        data.streak;

    winsEl.textContent =
        data.wins;

    lossesEl.textContent =
        data.losses;

    drawsEl.textContent =
        data.draws;

    renderProfile();
}


/* =========================================
   CHOOSE MOVE
   ========================================= */

function choose(playerChoice) {

    if (locked || matchFinished) {
        return;
    }

    locked = true;

    const cpuChoice =
        cpuMove();

    data.moves.push(playerChoice);

    if (data.moves.length > 30) {
        data.moves.shift();
    }

    playerMoveEl.textContent =
        icons[playerChoice];

    cpuMoveEl.textContent =
        icons[cpuChoice];

    playerMoveEl.classList.remove("animate");
    cpuMoveEl.classList.remove("animate");

    void playerMoveEl.offsetWidth;

    playerMoveEl.classList.add("animate");
    cpuMoveEl.classList.add("animate");

    const result =
        getResult(playerChoice, cpuChoice);

    if (result === "win") {

        playerScore++;

        data.streak++;

        data.bestStreak =
            Math.max(
                data.bestStreak,
                data.streak
            );

        resultEl.textContent =
            "🏆 YOU WIN";

        resultEl.className =
            "result win";

        messageEl.textContent =
            `${names[playerChoice]} thắng ${names[cpuChoice]} • +20 XP`;

        statusEl.textContent =
            "WIN";

        addXP(20);

    } else if (result === "lose") {

        cpuScore++;

        data.streak = 0;

        resultEl.textContent =
            "💀 YOU LOSE";

        resultEl.className =
            "result lose";

        messageEl.textContent =
            `${names[cpuChoice]} thắng ${names[playerChoice]}`;

        statusEl.textContent =
            "LOSS";

    } else {

        data.draws++;

        resultEl.textContent =
            "🤝 DRAW";

        resultEl.className =
            "result draw";

        messageEl.textContent =
            "Hai bên chọn cùng một nước";

        statusEl.textContent =
            "DRAW";
    }

    saveData();

    updateBoard();

    setTimeout(() => {

        if (checkMatchEnd()) {
            return;
        }

        round++;

        locked = false;

        playerMoveEl.textContent = "?";
        cpuMoveEl.textContent = "?";

        resultEl.textContent =
            "CHOOSE YOUR MOVE";

        resultEl.className =
            "result";

        messageEl.textContent =
            "CAPA đang chờ nước đi của bạn...";

        statusEl.textContent =
            "READY";

        updateBoard();

    }, 850);
}


/* =========================================
   CHECK MATCH
   ========================================= */

function checkMatchEnd() {

    const mode =
        modeEl.value;

    let target = 2;

    if (mode === "bo5") {
        target = 3;
    }

    if (mode === "survival") {

        if (playerScore >= 5) {
            finishMatch("win");
            return true;
        }

        if (cpuScore >= 1) {
            finishMatch("lose");
            return true;
        }

        return false;
    }

    if (
        playerScore >= target ||
        cpuScore >= target
    ) {

        if (playerScore > cpuScore) {
            finishMatch("win");
        } else {
            finishMatch("lose");
        }

        return true;
    }

    return false;
}


/* =========================================
   FINISH MATCH
   ========================================= */

function finishMatch(result) {

    matchFinished = true;

    let xp = 0;

    if (result === "win") {

        data.wins++;

        xp = 60;

        if (modeEl.value === "survival") {
            xp += 100;
        }

        resultEl.textContent =
            "🏆 MATCH VICTORY";

        resultEl.className =
            "result win";

        messageEl.textContent =
            `Bạn đã thắng trận! +${xp} XP`;

        statusEl.textContent =
            "VICTORY";

    } else {

        data.losses++;

        xp = 10;

        resultEl.textContent =
            "💀 MATCH DEFEAT";

        resultEl.className =
            "result lose";

        messageEl.textContent =
            `Trận đấu kết thúc. +${xp} XP`;

        statusEl.textContent =
            "DEFEAT";
    }

    const historyItem = {

        result:
            result === "win"
                ? "WIN"
                : "LOSS",

        mode:
            modeEl.value,

        difficulty:
            difficultyEl.value,

        player:
            playerScore,

        cpu:
            cpuScore,

        xp:
            xp,

        time:
            Date.now()
    };

    data.history.push(historyItem);

    if (data.history.length > 50) {
        data.history.shift();
    }

    addXP(xp);

    saveData();

    renderAchievements();
    renderHistory();
    updateBoard();

    setTimeout(() => {

        if (result === "win") {

            showToast(
                "🏆 Victory! Bạn đã chiến thắng!"
            );

        } else {

            showToast(
                "💀 Match Over!"
            );
        }

    }, 300);
}


/* =========================================
   RESET GAME
   ========================================= */

function resetGame() {

    playerScore = 0;
    cpuScore = 0;

    round = 1;

    locked = false;
    matchFinished = false;

    playerMoveEl.textContent = "?";
    cpuMoveEl.textContent = "?";

    resultEl.textContent =
        "CHOOSE YOUR MOVE";

    resultEl.className =
        "result";

    messageEl.textContent =
        "CAPA đang chờ nước đi của bạn...";

    statusEl.textContent =
        "READY";

    updateBoard();

}


/* =========================================
   BUTTONS
   ========================================= */

document.querySelectorAll(".choice")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                choose(
                    button.dataset.choice
                );

            }
        );

    });


document.getElementById("resetBtn")
    .addEventListener(
        "click",
        resetGame
    );


modeEl.addEventListener(
    "change",
    resetGame
);


difficultyEl.addEventListener(
    "change",
    resetGame
);


/* =========================================
   KEYBOARD
   ========================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.tagName === "INPUT" ||
            event.target.tagName === "SELECT"
        ) {
            return;
        }

        if (event.key === "1") {
            choose("rock");
        }

        if (event.key === "2") {
            choose("paper");
        }

        if (event.key === "3") {
            choose("scissors");
        }

    }
);


/* =========================================
   START
   ========================================= */

renderProfile();
renderAchievements();
renderHistory();
updateBoard();
```
