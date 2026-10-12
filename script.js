// ============================================
// OẲN TÙ TÌ CAPA
// ============================================


// ===============================
// SHORTCUT
// ===============================

const $ = (id) => document.getElementById(id);


// ===============================
// GAME DATA
// ===============================

const icons = {

    rock: "✊",

    paper: "✋",

    scissors: "✌️"

};


const names = {

    rock: "Búa",

    paper: "Bao",

    scissors: "Kéo"

};


// Nước nào thắng nước nào

const beats = {

    rock: "scissors",

    paper: "rock",

    scissors: "paper"

};


// ===============================
// DEFAULT PLAYER DATA
// ===============================

const defaultData = {

    xp: 0,

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


// ===============================
// LOAD DATA
// ===============================

let data = loadData();


// ===============================
// CURRENT MATCH
// ===============================

let playerScore = 0;

let cpuScore = 0;

let round = 1;

let locked = false;


// ===============================
// LOCAL STORAGE
// ===============================

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

    catch {

        return {
            ...defaultData
        };

    }

}


// ===============================
// SAVE
// ===============================

function save() {

    try {

        localStorage.setItem(

            "oanTuTiCAPA",

            JSON.stringify(data)

        );

    }

    catch {

        console.log(
            "Không thể lưu dữ liệu."
        );

    }

}


// ===============================
// XP
// ===============================

function xpNeeded() {

    return 100 +
        (data.level - 1) * 50;

}


// ===============================
// RANK
// ===============================

function getRank() {

    const level =
        data.level;


    if (level >= 30) {

        return "Legend";

    }


    if (level >= 20) {

        return "Master";

    }


    if (level >= 14) {

        return "Diamond Elite";

    }


    if (level >= 9) {

        return "Platinum Ace";

    }


    if (level >= 5) {

        return "Gold Fighter";

    }


    if (level >= 3) {

        return "Silver Warrior";

    }


    return "Bronze Rookie";

}


// ===============================
// UPDATE PROFILE
// ===============================

function renderProfile() {

    $("level").textContent =
        data.level;


    $("rankName").textContent =
        getRank();


    $("totalXp").textContent =
        data.xp;


    const need =
        xpNeeded();


    $("xpText").textContent =

        `${data.xp} / ${need} XP`;


    const percent =

        Math.min(
            100,
            data.xp / need * 100
        );


    $("xpBar").style.width =
        percent + "%";


    $("wins").textContent =
        data.wins;


    $("losses").textContent =
        data.losses;


    $("draws").textContent =
        data.draws;


    $("streak").textContent =
        data.streak;


    renderAchievements();

    renderHistory();

}


// ===============================
// ADD XP
// ===============================

function addXP(amount) {

    data.xp += amount;


    while (
        data.xp >= xpNeeded()
    ) {

        data.xp -= xpNeeded();

        data.level++;


        showToast(

            `⬆️ LEVEL UP! Level ${data.level}`

        );

    }


    save();

    renderProfile();

}


// ===============================
// ACHIEVEMENTS
// ===============================

function achievementList() {

    return [

        [

            "first",

            "First Win",

            "Thắng trận đầu tiên",

            data.wins >= 1

        ],


        [

            "five",

            "Fighter",

            "Thắng 5 trận",

            data.wins >= 5

        ],


        [

            "streak3",

            "Hot Streak",

            "3 chiến thắng liên tiếp",

            data.bestStreak >= 3

        ],


        [

            "streak5",

            "Unstoppable",

            "5 chiến thắng liên tiếp",

            data.bestStreak >= 5

        ],


        [

            "level10",

            "Elite",

            "Đạt Level 10",

            data.level >= 10

        ],


        [

            "capa",

            "CAPA Challenger",

            "Thắng bằng CAPA AI",

            data.achievements.capa

        ],


        [

            "survival",

            "Survivor",

            "Hoàn thành Survival",

            data.achievements.survival

        ]

    ];

}


// ===============================
// RENDER ACHIEVEMENTS
// ===============================

function renderAchievements() {

    const container =
        $("achievements");


    container.innerHTML =

        achievementList()

        .map(

            achievement => {

                const unlocked =
                    achievement[3];


                return `

                    <div class="
                        achievement
                        ${unlocked
                            ? "unlocked"
                            : ""}
                    ">

                        <b>

                            ${unlocked
                                ? "🏆"
                                : "🔒"}

                            ${achievement[1]}

                        </b>

                        <small>

                            ${achievement[2]}

                        </small>

                    </div>

                `;

            }

        )

        .join("");

}


// ===============================
// HISTORY
// ===============================

function renderHistory() {

    const history =
        $("history");


    if (
        data.history.length === 0
    ) {

        history.textContent =
            "Chưa có trận đấu.";

        return;

    }


    history.innerHTML =

        data.history

        .slice(0, 12)

        .map(

            item => `

                <div
                    class="history-row"
                >

                    <span>

                        ${item.mode}

                        •

                        ${item.difficulty}

                    </span>

                    <b>

                        ${item.result}

                    </b>

                </div>

            `

        )

        .join("");

}


// ===============================
// TOAST
// ===============================

function showToast(message) {

    const toast =
        $("toast");


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(

        () => {

            toast.classList.remove(
                "show"
            );

        },

        1800

    );

}


// ===============================
// RANDOM MOVE
// ===============================

function randomMove() {

    const moves = [

        "rock",

        "paper",

        "scissors"

    ];


    return moves[

        Math.floor(
            Math.random() *
            moves.length
        )

    ];

}


// ===============================
// WEIGHTED MOVE
// ===============================

function weightedChoice(
    moves
) {

    const counts = {

        rock: 1,

        paper: 1,

        scissors: 1

    };


    moves.forEach(

        move => {

            counts[move]++;

        }

    );


    const total =

        counts.rock +
        counts.paper +
        counts.scissors;


    let random =
        Math.random() * total;


    for (
        const move
        of [
            "rock",
            "paper",
            "scissors"
        ]
    ) {

        random -=
            counts[move];


        if (random <= 0) {

            return move;

        }

    }


    return "rock";

}


// ===============================
// PREDICT PLAYER
// ===============================

function predictPlayer() {

    const moves =
        data.moves.slice(-8);


    if (
        moves.length === 0
    ) {

        return randomMove();

    }


    let prediction =
        weightedChoice(moves);


    const last =
        moves[moves.length - 1];


    // Phân tích pattern

    if (
        moves.length >= 3
    ) {

        const transitions = {

            rock: {
                rock: 0,
                paper: 0,
                scissors: 0
            },

            paper: {
                rock: 0,
                paper: 0,
                scissors: 0
            },

            scissors: {
                rock: 0,
                paper: 0,
                scissors: 0
            }

        };


        for (
            let i = 0;

            i < moves.length - 1;

            i++
        ) {

            transitions[
                moves[i]
            ][
                moves[i + 1]
            ]++;

        }


        const current =
            transitions[last];


        const best =
            Object.keys(current)

            .sort(
                (a, b) =>
                    current[b] -
                    current[a]
            )[0];


        if (
            current[best] > 0 &&
            Math.random() < 0.65
        ) {

            prediction =
                best;

        }

    }


    return prediction;

}


// ===============================
// CPU AI
// ===============================

function cpuMove(level) {

    // EASY

    if (
        level === "easy"
    ) {

        return randomMove();

    }


    // NORMAL

    if (
        level === "normal"
    ) {

        return Math.random() < 0.65

            ? randomMove()

            : beats[
                predictPlayer()
            ];

    }


    // HARD

    if (
        level === "hard"
    ) {

        return Math.random() < 0.78

            ? beats[
                predictPlayer()
            ]

            : randomMove();

    }


    // CAPA

    return Math.random() < 0.90

        ? beats[
            predictPlayer()
        ]

        : randomMove();

}


// ===============================
// RESULT
// ===============================

function getResult(
    player,
    cpu
) {

    if (
        player === cpu
    ) {

        return "draw";

    }


    if (
        beats[player] === cpu
    ) {

        return "win";

    }


    return "lose";

}


// ===============================
// UPDATE BOARD
// ===============================

function updateBoard() {

    $("playerScore")
        .textContent =
        playerScore;


    $("cpuScore")
        .textContent =
        cpuScore;


    const mode =
        $("mode").value;


    let target;


    if (
        mode === "bo3"
    ) {

        target = 2;

    }

    else if (
        mode === "bo5"
    ) {

        target = 3;

    }

    else {

        target = 5;

    }


    let progress;


    if (
        mode === "survival"
    ) {

        progress =
            ((round - 1) /
            target) *
            100;

    }

    else {

        progress =

            Math.max(
                playerScore,
                cpuScore
            )
            / target
            * 100;

    }


    $("progressBar")
        .style.width =
        Math.min(
            100,
            progress
        ) + "%";


    if (
        mode === "survival"
    ) {

        $("roundText")
            .textContent =
            `Survival • Round ${round}`;

    }

    else {

        $("roundText")
            .textContent =
            `Round ${round}`;

    }

}


// ===============================
// PLAYER CHOICE
// ===============================

function choose(player) {

    if (locked) {

        return;

    }


    locked = true;


    const difficulty =
        $("difficulty").value;


    const cpu =
        cpuMove(
            difficulty
        );


    const result =
        getResult(
            player,
            cpu
        );


    // SAVE PLAYER MOVE

    data.moves.push(
        player
    );


    if (
        data.moves.length > 30
    ) {

        data.moves.shift();

    }


    // DISPLAY

    $("playerMove")
        .textContent =
        icons[player];


    $("cpuMove")
        .textContent =
        icons[cpu];


    $("result")
        .textContent =

        result === "win"

            ? "YOU WIN"

            : result === "lose"

            ? "CAPA WINS"

            : "DRAW";


    $("result").className =
        "result " + result;


    // WIN

    if (
        result === "win"
    ) {

        playerScore++;

        data.streak++;


        data.bestStreak =

            Math.max(

                data.bestStreak,

                data.streak

            );


        addXP(20);


        $("message")
            .textContent =

            `Bạn thắng!
             ${names[player]}
             thắng
             ${names[cpu]}.`;

    }


    // LOSE

    else if (
        result === "lose"
    ) {

        cpuScore++;

        data.streak = 0;


        addXP(5);


        $("message")
            .textContent =

            `CAPA thắng bằng
             ${names[cpu]}.`;

    }


    // DRAW

    else {

        data.draws++;


        $("message")
            .textContent =

            "Hai bên chọn giống nhau.";

    }


    updateBoard();

    setTimeout(

        () => {

            nextRound(
                result
            );

        },

        650

    );

}


// ===============================
// NEXT ROUND
// ===============================

function nextRound(
    result
) {

    const mode =
        $("mode").value;


    let target;


    if (
        mode === "bo3"
    ) {

        target = 2;

    }

    else if (
        mode === "bo5"
    ) {

        target = 3;

    }

    else {

        target = 5;

    }


    // SURVIVAL

    if (
        mode === "survival"
    ) {

        if (
            result === "lose"
        ) {

            finishMatch(
                "lose"
            );

            return;

        }


        round++;


        if (
            round > 5
        ) {

            data.achievements
                .survival = true;


            finishMatch(
                "win"
            );

            return;

        }

    }


    // BO3 / BO5

    else {

        if (
            playerScore >= target ||
            cpuScore >= target
        ) {

            finishMatch(

                playerScore >
                cpuScore

                    ? "win"

                    : "lose"

            );

            return;

        }


        round++;

    }


    locked = false;

    updateBoard();

    save();

    renderProfile();

}


// ===============================
// FINISH MATCH
// ===============================

function finishMatch(
    result
) {

    locked = true;


    if (
        result === "win"
    ) {

        data.wins++;


        if (
            $("difficulty").value
            === "capa"
        ) {

            data.achievements
                .capa = true;

        }


        addXP(60);

    }

    else {

        data.losses++;

        addXP(10);

    }


    // HISTORY

    data.history.unshift({

        mode:
            $("mode")
            .value
            .toUpperCase(),

        difficulty:
            $("difficulty")
            .value
            .toUpperCase(),

        result:
            result === "win"

                ? "🏆 WIN"

                : "💀 LOSS"

    });


    // Chỉ giữ 20 trận

    data.history =
        data.history.slice(
            0,
            20
        );


    save();

    renderProfile();


    if (
        result === "win"
    ) {

        $("status")
            .textContent =
            "🏆 BẠN THẮNG TRẬN!";


        $("message")
            .textContent =
            "Tuyệt vời! Bạn đã đánh bại CAPA.";

    }

    else {

        $("status")
            .textContent =
            "💀 CAPA THẮNG TRẬN!";


        $("message")
            .textContent =
            "CAPA đã đọc được chiến thuật của bạn.";

    }

}


// ===============================
// RESET GAME
// ===============================

function resetGame() {

    playerScore = 0;

    cpuScore = 0;

    round = 1;

    locked = false;


    $("playerMove")
        .textContent = "?";


    $("cpuMove")
        .textContent = "?";


    $("result")
        .textContent = "READY";


    $("result")
        .className = "result";


    $("status")
        .textContent =
        "Chọn một nước đi";


    $("message")
        .textContent =
        "Chọn Búa, Bao hoặc Kéo để bắt đầu.";


    updateBoard();

}


// ===============================
// BUTTON EVENTS
// ===============================

document
    .querySelectorAll(
        ".choice"
    )
    .forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    choose(
                        button
                            .dataset
                            .choice
                    );

                }

            );

        }

    );


// ===============================
// RESET BUTTON
// ===============================

$("resetBtn")
    .addEventListener(

        "click",

        resetGame

    );


// ===============================
// KEYBOARD
// ===============================

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


// ===============================
// MODE CHANGE
// ===============================

$("mode")
    .addEventListener(

        "change",

        resetGame

    );


// ===============================
// DIFFICULTY CHANGE
// ===============================

$("difficulty")
    .addEventListener(

        "change",

        resetGame

    );


// ===============================
// START
// ===============================

renderProfile();

updateBoard();
