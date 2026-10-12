
"use strict";

const options = {
    rock: { name: "Búa", emoji: "✊" },
    scissors: { name: "Kéo", emoji: "✌️" },
    paper: { name: "Bao", emoji: "🖐️" }
};

const $ = id => document.getElementById(id);
const buttons = document.querySelectorAll(".choice");

let playerScore = 0;
let cpuScore = 0;
let round = 1;
let finished = false;

function loadStats() {
    const defaults = { wins: 0, losses: 0, best: 0 };

    try {
        const saved = JSON.parse(
            localStorage.getItem("neonArenaStats")
        );

        if (!saved || typeof saved !== "object") {
            return defaults;
        }

        return {
            wins: Number.isSafeInteger(saved.wins) && saved.wins >= 0
                ? saved.wins : 0,

            losses: Number.isSafeInteger(saved.losses) && saved.losses >= 0
                ? saved.losses : 0,

            best: Number.isSafeInteger(saved.best) && saved.best >= 0
                ? saved.best : 0
        };
    } catch {
        return defaults;
    }
}

let stats = loadStats();

function saveStats() {
    try {
        localStorage.setItem(
            "neonArenaStats",
            JSON.stringify(stats)
        );
    } catch (error) {
        console.warn("Không thể lưu thống kê:", error);
    }

    renderStats();
}

function renderStats() {
    $("wins").textContent = stats.wins;
    $("losses").textContent = stats.losses;
    $("best").textContent = stats.best;
}

function setResult(title, detail, type = "") {
    $("resultTitle").textContent = title;
    $("resultDetail").textContent = detail;
    $("result").className = "result " + type;
}

function animateHand(element) {
    element.classList.remove("pop");

    // Khởi động lại animation khi chơi liên tiếp.
    void element.offsetWidth;

    element.classList.add("pop");
}

function celebrate() {
    const layer = $("celebration");
    const colors = [
        "#a78bfa",
        "#60a5fa",
        "#4ade80",
        "#fbbf24",
        "#fb7185"
    ];

    for (let i = 0; i < 55; i++) {
        const piece = document.createElement("span");

        piece.className = "confetti";
        piece.style.left = Math.random() * 100 + "%";
        piece.style.background =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDelay =
            Math.random() * 0.7 + "s";

        piece.style.animationDuration =
            (1.2 + Math.random() * 1.3) + "s";

        layer.appendChild(piece);

        setTimeout(() => piece.remove(), 3000);
    }
}

function endMatch(winner) {
    finished = true;

    buttons.forEach(button => {
        button.disabled = true;
    });

    if (winner === "player") {
        stats.wins++;

        // Điểm cao nhất của một trận BO3.
        stats.best = Math.max(stats.best, playerScore);

        saveStats();

        setResult(
            "🏆 CHIẾN THẮNG!",
            "Bạn đã thắng trận BO3! Quá tuyệt vời!",
            "win"
        );

        celebrate();
    } else {
        stats.losses++;
        saveStats();

        setResult(
            "💥 BẠN ĐÃ THUA!",
            "Đừng bỏ cuộc, hãy thử lại một trận mới!",
            "lose"
        );
    }

    $("roundNumber").textContent = "KẾT THÚC";
}

function play(choice) {
    if (finished) return;
    if (!options[choice]) return;

    const keys = Object.keys(options);

    const cpuChoice =
        keys[Math.floor(Math.random() * keys.length)];

    $("playerHand").textContent = options[choice].emoji;
    $("cpuHand").textContent = options[cpuChoice].emoji;

    animateHand($("playerHand"));
    animateHand($("cpuHand"));

    if (choice === cpuChoice) {
        setResult(
            "🤝 HÒA NHAU!",
            "Cả hai cùng chọn " + options[choice].name + ".",
            "draw"
        );
    } else if (
        (choice === "rock" && cpuChoice === "scissors") ||
        (choice === "scissors" && cpuChoice === "paper") ||
        (choice === "paper" && cpuChoice === "rock")
    ) {
        playerScore++;

        setResult(
            "✨ BẠN THẮNG VÁN NÀY!",
            "Bạn chọn " + options[choice].name +
            ", máy chọn " + options[cpuChoice].name + ".",
            "win"
        );
    } else {
        cpuScore++;

        setResult(
            "💫 MÁY THẮNG VÁN NÀY!",
            "Bạn chọn " + options[choice].name +
            ", máy chọn " + options[cpuChoice].name + ".",
            "lose"
        );
    }

    $("playerScore").textContent = playerScore;
    $("cpuScore").textContent = cpuScore;

    if (playerScore >= 2) {
        endMatch("player");
    } else if (cpuScore >= 2) {
        endMatch("cpu");
    } else {
        round++;
        $("roundNumber").textContent = round;
    }
}

function newMatch() {
    playerScore = 0;
    cpuScore = 0;
    round = 1;
    finished = false;

    $("playerScore").textContent = "0";
    $("cpuScore").textContent = "0";
    $("playerHand").textContent = "✊";
    $("cpuHand").textContent = "🤖";
    $("roundNumber").textContent = "1";

    buttons.forEach(button => {
        button.disabled = false;
    });

    setResult(
        "Sẵn sàng chiến đấu? ⚡",
        "Hãy chọn Búa, Kéo hoặc Bao!"
    );
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        play(button.dataset.choice);
    });
});

$("resetBtn").addEventListener("click", newMatch);

$("clearBtn").addEventListener("click", () => {
    const confirmed = confirm(
        "Bạn có chắc muốn xóa toàn bộ thống kê và điểm cao đã lưu?"
    );

    if (!confirmed) return;

    stats = { wins: 0, losses: 0, best: 0 };

    try {
        localStorage.removeItem("neonArenaStats");
    } catch (error) {
        console.warn("Không thể xóa dữ liệu:", error);
    }

    renderStats();
    newMatch();
});

renderStats();
newMatch();
