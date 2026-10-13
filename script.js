/* =====================================================
   CAPA ARENA
   OẲN TÙ TÌ GAME ENGINE
===================================================== */


/* =====================================================
   GAME DATA
===================================================== */

const icons = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
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


/* =====================================================
   GAME STATE
===================================================== */

let data = loadData();

let playerScore = 0;

let cpuScore = 0;

let round = 1;

let matchFinished = false;

let playerHealth = 100;

let cpuHealth = 100;


/* =====================================================
   DOM
===================================================== */

const startScreen =
    document.getElementById("startScreen");

const gameScreen =
    document.getElementById("gameScreen");

const playButton =
    document.getElementById("playButton");

const modeSelect =
    document.getElementById("mode");

const difficultySelect =
    document.getElementById("difficulty");

const resetButton =
    document.getElementById("resetButton");

const rankName =
    document.getElementById("rankName");

const level =
    document.getElementById("level");

const xpBar =
    document.getElementById("xpBar");

const xpText =
    document.getElementById("xpText");

const startRank =
    document.getElementById("startRank");

const startLevel =
    document.getElementById("startLevel");

const playerScoreEl =
    document.getElementById("playerScore");

const cpuScoreEl =
    document.getElementById("cpuScore");

const roundText =
    document.getElementById("roundText");

const statusEl =
    document.getElementById("status");

const progressBar =
    document.getElementById("progressBar");

const playerMoveEl =
    document.getElementById("playerMove");

const cpuMoveEl =
    document.getElementById("cpuMove");

const messageEl =
    document.getElementById("message");

const playerHealthEl =
    document.getElementById("playerHealth");

const cpuHealthEl =
    document.getElementById("cpuHealth");

const playerStatus =
    document.getElementById("playerStatus");

const cpuStatus =
    document.getElementById("cpuStatus");

const winsEl =
    document.getElementById("wins");

const lossesEl =
    document.getElementById("losses");

const drawsEl =
    document.getElementById("draws");

const streakEl =
    document.getElementById("streak");

const hudMode =
    document.getElementById("hudMode");

const hudStreak =
    document.getElementById("hudStreak");

const hudWins =
    document.getElementById("hudWins");

const hudBest =
    document.getElementById("hudBest");

const achievementsEl =
    document.getElementById("achievements");

const historyEl =
    document.getElementById("history");

const toast =
    document.getElementById("toast");


/* =====================================================
   STORAGE
===================================================== */

function loadData() {

    try {

        const saved =
            localStorage.getItem(
                "oanTuTiCAPA"
            );

        if (!saved) {

            return {
                ...defaultData
            };
        }


        return {
            ...defaultData,
            ...JSON.parse(saved)
        };

    }

    catch (error) {

        console.log(
            "Không thể đọc dữ liệu:",
            error
        );

        return {
            ...defaultData
        };
    }
}


function saveData() {

    localStorage.setItem(
        "oanTuTiCAPA",
        JSON.stringify(data)
    );
}


/* =====================================================
   XP / LEVEL / RANK
===================================================== */

function xpNeeded() {

    return data.level * 100;
}


function getRank() {

    if (data.level >= 30) {
        return "LEGEND";
    }

    if (data.level >= 25) {
        return "MASTER";
    }

    if (data.level >= 20) {
        return "DIAMOND";
    }

    if (data.level >= 15) {
        return "PLATINUM";
    }

    if (data.level >= 10) {
        return "GOLD";
    }

    if (data.level >= 5) {
        return "SILVER";
    }

    return "BRONZE";
}


function renderProfile() {

    const needed =
        xpNeeded();


    const percent =
        Math.min(
            100,
            (data.xp / needed) * 100
        );


    const rank =
        getRank();


    rankName.textContent =
        rank;


    level.textContent =
        `LEVEL ${data.level}`;


    xpText.textContent =
        `${data.xp} / ${needed} XP`;


    xpBar.style.width =
        `${percent}%`;


    startRank.textContent =
        rank;


    startLevel.textContent =
        `LEVEL ${data.level}`;
}


function addXP(amount) {

    data.xp += amount;

    data.totalXp += amount;


    let levelUp = false;


    while (
        data.xp >= xpNeeded()
    ) {

        data.xp -= xpNeeded();

        data.level++;

        levelUp = true;

        showToast(
            `⚡ LEVEL UP! LEVEL ${data.level}`
        );
    }


    saveData();

    renderProfile();


    if (levelUp) {

        startRank.textContent =
            getRank();

        startLevel.textContent =
            `LEVEL ${data.level}`;
    }
}


/* =====================================================
   ACHIEVEMENTS
===================================================== */

const achievementList = [

    {
        id: "firstWin",

        icon: "⚔️",

        title: "FIRST WIN",

        description:
            "Win your first battle"
    },


    {
        id: "fighter",

        icon: "🥊",

        title: "FIGHTER",

        description:
            "Win 5 battles"
    },


    {
        id: "hotStreak",

        icon: "🔥",

        title: "HOT STREAK",

        description:
            "Reach 5 streak"
    },


    {
        id: "unstoppable",

        icon: "💥",

        title: "UNSTOPPABLE",

        description:
            "Reach 10 streak"
    },


    {
        id: "elite",

        icon: "👑",

        title: "ELITE",

        description:
            "Reach level 10"
    },


    {
        id: "capa",

        icon: "🤖",

        title: "CAPA CHALLENGER",

        description:
            "Defeat CAPA AI"
    },


    {
        id: "survivor",

        icon: "☠️",

        title: "SURVIVOR",

        description:
            "Win Survival mode"
    }

];


function checkAchievements() {

    const conditions = {

        firstWin:
            data.wins >= 1,


        fighter:
            data.wins >= 5,


        hotStreak:
            data.bestStreak >= 5,


        unstoppable:
            data.bestStreak >= 10,


        elite:
            data.level >= 10,


        capa:
            data.wins >= 1,


        survivor:
            data.history.some(
                item =>
                    item.mode === "SURVIVAL" &&
                    item.matchResult === "WIN"
            )

    };


    achievementList.forEach(
        achievement => {

            if (
                conditions[
                    achievement.id
                ] &&
                !data.achievements[
                    achievement.id
                ]
            ) {

                data.achievements[
                    achievement.id
                ] = true;


                showToast(
                    `🏆 ${achievement.title} UNLOCKED!`
                );
            }

        }
    );


    saveData();

    renderAchievements();
}


function renderAchievements() {

    achievementsEl.innerHTML = "";


    achievementList.forEach(
        achievement => {

            const unlocked =
                Boolean(
                    data.achievements[
                        achievement.id
                    ]
                );


            const element =
                document.createElement(
                    "div"
                );


            element.className =
                "achievement" +
                (
                    unlocked
                        ? " unlocked"
                        : ""
                );


            element.innerHTML = `

                <div class="achievement-icon">
                    ${
                        unlocked
                            ? achievement.icon
                            : "🔒"
                    }
                </div>

                <strong>
                    ${achievement.title}
                </strong>

                <small>
                    ${
                        unlocked
                            ? "UNLOCKED"
                            : achievement.description
                    }
                </small>

            `;


            achievementsEl.appendChild(
                element
            );
        }
    );
}


/* =====================================================
   HISTORY
===================================================== */

function renderHistory() {

    if (!data.history.length) {

        historyEl.innerHTML = `

            <div class="empty-history">
                No battles yet.
            </div>

        `;

        return;
    }


    historyEl.innerHTML = "";


    data.history
        .slice(-10)
        .reverse()
        .forEach(item => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "history-row " +
                item.result.toLowerCase();


            row.innerHTML = `

                <span>
                    ${item.result}
                </span>

                <span>
                    ${icons[item.player]}
                    vs
                    ${icons[item.cpu]}
                </span>

            `;


            historyEl.appendChild(row);
        });
}


/* =====================================================
   TOAST
===================================================== */

let toastTimer;


function showToast(text) {

    toast.textContent =
        text;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );
}


/* =====================================================
   AI
===================================================== */

function randomMove() {

    const moves =
        Object.keys(icons);


    return moves[
        Math.floor(
            Math.random() *
            moves.length
        )
    ];
}


function predictPlayer() {

    if (!data.moves.length) {

        return randomMove();
    }


    const recent =
        data.moves.slice(-8);


    const count = {

        rock: 0,

        paper: 0,

        scissors: 0

    };


    recent.forEach(
        move => {

            count[move]++;
        }
    );


    let predicted =
        Object.keys(count)
            .sort(
                (a, b) =>
                    count[b] -
                    count[a]
            )[0];


    if (recent.length >= 3) {

        const last =
            recent[
                recent.length - 1
            ];


        const before =
            recent[
                recent.length - 2
            ];


        if (last === before) {

            predicted =
                last;
        }
    }


    return predicted;
}


function cpuMove() {

    const difficulty =
        difficultySelect.value;


    if (
        difficulty === "Easy"
    ) {

        return randomMove();
    }


    if (
        difficulty === "Normal"
    ) {

        if (
            Math.random() < .65
        ) {

            const predicted =
                predictPlayer();

            return beats[predicted];
        }


        return randomMove();
    }


    if (
        difficulty === "Hard"
    ) {

        if (
            Math.random() < .80
        ) {

            const predicted =
                predictPlayer();

            return beats[predicted];
        }


        return randomMove();
    }


    /* CAPA AI */

    if (
        Math.random() < .92
    ) {

        const predicted =
            predictPlayer();

        return beats[predicted];
    }


    return randomMove();
}


/* =====================================================
   RESULT
===================================================== */

function getResult(
    player,
    cpu
) {

    if (
        player === cpu
    ) {

        return "DRAW";
    }


    if (
        beats[player] === cpu
    ) {

        return "WIN";
    }


    return "LOSE";
}


/* =====================================================
   UPDATE BOARD
===================================================== */

function updateBoard() {

    playerScoreEl.textContent =
        playerScore;


    cpuScoreEl.textContent =
        cpuScore;


    roundText.textContent =
        `ROUND ${round}`;


    hudMode.textContent =
        modeSelect.value;


    hudStreak.textContent =
        `${data.streak} 🔥`;


    hudWins.textContent =
        data.wins;


    hudBest.textContent =
        data.bestStreak;


    winsEl.textContent =
        data.wins;


    lossesEl.textContent =
        data.losses;


    drawsEl.textContent =
        data.draws;


    streakEl.textContent =
        data.streak;


    let maxScore;


    if (
        modeSelect.value === "BO3"
    ) {

        maxScore = 2;

    }

    else if (
        modeSelect.value === "BO5"
    ) {

        maxScore = 3;

    }

    else {

        maxScore = 5;
    }


    playerHealth =
        Math.max(
            0,
            100 -
            (
                cpuScore /
                maxScore
            ) * 100
        );


    cpuHealth =
        Math.max(
            0,
            100 -
            (
                playerScore /
                maxScore
            ) * 100
        );


    playerHealthEl.style.width =
        `${playerHealth}%`;


    cpuHealthEl.style.width =
        `${cpuHealth}%`;


    renderProfile();

    renderAchievements();

    renderHistory();
}


/* =====================================================
   CHOOSE
===================================================== */

function choose(player) {

    if (
        matchFinished
    ) {

        return;
    }


    const cpu =
        cpuMove();


    const result =
        getResult(
            player,
            cpu
        );


    data.moves.push(
        player
    );


    if (
        data.moves.length > 30
    ) {

        data.moves.shift();
    }


    playerMoveEl.textContent =
        icons[player];


    cpuMoveEl.textContent =
        icons[cpu];


    playerStatus.textContent =
        names[player];


    cpuStatus.textContent =
        names[cpu];


    statusEl.textContent =
        result;


    if (
        result === "WIN"
    ) {

        playerScore++;


        data.wins++;


        data.streak++;


        data.bestStreak =
            Math.max(
                data.bestStreak,
                data.streak
            );


        addXP(25);


        statusEl.style.color =
            "var(--green)";


        messageEl.textContent =
            "⚡ YOU WIN THE ROUND!";


        document
            .querySelector(
                ".player-fighter"
            )
            .classList.add(
                "win"
            );


        setTimeout(
            () => {

                document
                    .querySelector(
                        ".player-fighter"
                    )
                    .classList.remove(
                        "win"
                    );

            },
            600
        );

    }


    else if (
        result === "LOSE"
    ) {

        cpuScore++;


        data.losses++;


        data.streak = 0;


        statusEl.style.color =
            "var(--red)";


        messageEl.textContent =
            "💀 CAPA WINS THE ROUND";


        document
            .querySelector(
                ".cpu-fighter"
            )
            .classList.add(
                "lose"
            );


        setTimeout(
            () => {

                document
                    .querySelector(
                        ".cpu-fighter"
                    )
                    .classList.remove(
                        "lose"
                    );

            },
            600
        );

    }


    else {

        data.draws++;


        statusEl.style.color =
            "var(--yellow)";


        messageEl.textContent =
            "⚡ DRAW — AGAIN!";
    }


    data.history.push({

        player: player,

        cpu: cpu,

        result: result,

        mode: modeSelect.value,

        matchResult: null,

        date: Date.now()

    });


    if (
        data.history.length > 30
    ) {

        data.history.shift();
    }


    saveData();


    updateBoard();


    checkAchievements();


    setTimeout(
        checkMatch,
        550
    );
}


/* =====================================================
   MATCH
===================================================== */

function getRequiredWins() {

    if (
        modeSelect.value === "BO5"
    ) {

        return 3;
    }


    if (
        modeSelect.value === "SURVIVAL"
    ) {

        return 5;
    }


    return 2;
}


function checkMatch() {

    const required =
        getRequiredWins();


    if (
        modeSelect.value ===
        "SURVIVAL"
    ) {

        if (
            playerScore >= required
        ) {

            finishMatch(
                "WIN"
            );

            return;
        }


        if (
            cpuScore >= 1
        ) {

            finishMatch(
                "LOSE"
            );

            return;
        }
    }


    else {

        if (
            playerScore >= required
        ) {

            finishMatch(
                "WIN"
            );

            return;
        }


        if (
            cpuScore >= required
        ) {

            finishMatch(
                "LOSE"
            );

            return;
        }
    }


    nextRound();
}


/* =====================================================
   NEXT ROUND
===================================================== */

function nextRound() {

    round++;


    let totalRounds;


    if (
        modeSelect.value ===
        "BO3"
    ) {

        totalRounds = 3;

    }

    else if (
        modeSelect.value ===
        "BO5"
    ) {

        totalRounds = 5;

    }

    else {

        totalRounds = 5;
    }


    progressBar.style.width =
        `${Math.min(
            100,
            (
                (round - 1) /
                totalRounds
            ) * 100
        )}%`;


    roundText.textContent =
        `ROUND ${round}`;


    statusEl.textContent =
        "CHOOSE YOUR MOVE";


    statusEl.style.color =
        "var(--cyan)";


    messageEl.textContent =
        "CAPA is analyzing your pattern...";


    playerMoveEl.textContent =
        "?";


    cpuMoveEl.textContent =
        "?";
}


/* =====================================================
   FINISH MATCH
===================================================== */

function finishMatch(result) {

    matchFinished = true;


    progressBar.style.width =
        "100%";


    const lastBattle =
        data.history[
            data.history.length - 1
        ];


    if (lastBattle) {

        lastBattle.matchResult =
            result;
    }


    saveData();


    if (
        result === "WIN"
    ) {

        statusEl.textContent =
            "VICTORY";


        statusEl.style.color =
            "var(--green)";


        messageEl.textContent =
            "🏆 CAPA DEFEATED — YOU ARE THE CHAMPION!";


        addXP(100);

    }

    else {

        statusEl.textContent =
            "DEFEAT";


        statusEl.style.color =
            "var(--red)";


        messageEl.textContent =
            "💀 CAPA HAS WON THIS MATCH.";
    }


    playerStatus.textContent =
        result === "WIN"
            ? "VICTOR"
            : "DEFEATED";


    cpuStatus.textContent =
        result === "WIN"
            ? "DEFEATED"
            : "VICTOR";


    checkAchievements();


    renderHistory();


    setTimeout(
        () => {

            showToast(
                result === "WIN"
                    ? "🏆 MATCH VICTORY!"
                    : "💀 MATCH DEFEAT"
            );

        },
        300
    );
}


/* =====================================================
   RESET
===================================================== */

function resetGame() {

    playerScore = 0;

    cpuScore = 0;

    round = 1;

    matchFinished = false;

    playerHealth = 100;

    cpuHealth = 100;


    playerMoveEl.textContent =
        "?";


    cpuMoveEl.textContent =
        "?";


    statusEl.textContent =
        "CHOOSE YOUR MOVE";


    statusEl.style.color =
        "var(--cyan)";


    messageEl.textContent =
        "CAPA is waiting for your move...";


    playerStatus.textContent =
        "READY";


    cpuStatus.textContent =
        "ANALYZING";


    progressBar.style.width =
        "0%";


    playerHealthEl.style.width =
        "100%";


    cpuHealthEl.style.width =
        "100%";


    updateBoard();
}


/* =====================================================
   PLAY NOW
   FIXED VERSION
===================================================== */

playButton.addEventListener(
    "click",
    function () {

        /*
            QUAN TRỌNG:

            Hiện game trước.
            Sau đó mới ẩn Start Screen.

            Không dùng setTimeout.
        */

        gameScreen.classList.remove(
            "hidden"
        );


        startScreen.classList.add(
            "hide"
        );


        updateBoard();


        window.scrollTo(
            {
                top: 0,
                behavior: "smooth"
            }
        );

    }
);


/* =====================================================
   CHOICE BUTTONS
===================================================== */

document
    .querySelectorAll(".choice")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                function () {

                    choose(
                        this.dataset.choice
                    );

                }
            );
        }
    );


/* =====================================================
   RESET
===================================================== */

resetButton.addEventListener(
    "click",
    resetGame
);


/* =====================================================
   MODE CHANGE
===================================================== */

modeSelect.addEventListener(
    "change",
    resetGame
);


/* =====================================================
   DIFFICULTY CHANGE
===================================================== */

difficultySelect.addEventListener(
    "change",
    resetGame
);


/* =====================================================
   KEYBOARD
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "1"
        ) {

            choose("rock");
        }


        if (
            event.key === "2"
        ) {

            choose("paper");
        }


        if (
            event.key === "3"
        ) {

            choose("scissors");
        }

    }
);


/* =====================================================
   INITIALIZE
===================================================== */

renderProfile();

renderAchievements();

renderHistory();

updateBoard();
