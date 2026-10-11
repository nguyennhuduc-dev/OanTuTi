let playerScore = 0;
let computerScore = 0;

const choices = ["kéo", "búa", "bao"];

function play(playerChoice) {

    // Nếu một bên đã thắng BO3
    if (playerScore >= 2 || computerScore >= 2) {
        return;
    }

    // Máy chọn ngẫu nhiên
    const computerChoice =
        choices[Math.floor(Math.random() * choices.length)];

    // Hiển thị lựa chọn của máy
    document.getElementById("computerChoice").textContent =
        "🤖 Máy chọn: " + computerChoice.toUpperCase();

    // Kiểm tra kết quả
    if (playerChoice === computerChoice) {

        document.getElementById("resultText").textContent =
            "🤝 Hòa lượt này!";

    }

    else if (
        (playerChoice === "búa" && computerChoice === "kéo") ||
        (playerChoice === "kéo" && computerChoice === "bao") ||
        (playerChoice === "bao" && computerChoice === "búa")
    ) {

        playerScore++;

        document.getElementById("resultText").textContent =
            "🏆 Bạn thắng lượt này!";

    }

    else {

        computerScore++;

        document.getElementById("resultText").textContent =
            "🤖 Máy thắng lượt này!";

    }

    // Cập nhật điểm
    document.getElementById("playerScore").textContent =
        playerScore;

    document.getElementById("computerScore").textContent =
        computerScore;

    // Kiểm tra BO3
    if (playerScore === 2) {

        document.getElementById("resultText").textContent =
            "🏆 BẠN THẮNG CHUNG CUỘC!";

    }

    else if (computerScore === 2) {

        document.getElementById("resultText").textContent =
            "🤖 MÁY THẮNG CHUNG CUỘC!";

    }

}

function resetGame() {

    playerScore = 0;
    computerScore = 0;

    document.getElementById("playerScore").textContent = "0";

    document.getElementById("computerScore").textContent = "0";

    document.getElementById("computerChoice").textContent =
        "🤖 Máy chưa chọn";

    document.getElementById("resultText").textContent =
        "Hãy chọn một lựa chọn!";
}