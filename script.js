// Khởi tạo hệ thống điểm số
let playerScore = 0;
let computerScore = 0;

// Bộ từ điển ánh xạ chuỗi ký tự sang Emoji hình ảnh
const emojiMap = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️'
};

// Liên kết các thẻ HTML để cập nhật nội dung tự động
const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const playerIconEl = document.getElementById('player-choice-icon');
const computerIconEl = document.getElementById('computer-choice-icon');
const gameStatusEl = document.getElementById('game-status');
const buttons = document.querySelectorAll('.btn');
const resetBtn = document.getElementById('reset-btn');

// Cài đặt trình lắng nghe sự kiện khi nhấn các phím vũ khí
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const playerChoice = button.getAttribute('data-choice');
        playRound(playerChoice);
    });
});

// Hàm tạo ngẫu nhiên vũ khí của Máy
function getComputerChoice() {
    const choices = ['rock', 'paper', 'scissors'];
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

// Hàm cốt lõi phân định thắng thua của vòng đấu
function playRound(playerChoice) {
    const computerChoice = getComputerChoice();
    
    // Đưa biểu tượng tương ứng lên sàn đấu
    playerIconEl.textContent = emojiMap[playerChoice];
    computerIconEl.textContent = emojiMap[computerChoice];
    
    // Kích hoạt hiệu ứng sóng xung kích giật điện Prime cho toàn hộp game
    const gameContainer = document.querySelector('.game-container');
    gameContainer.classList.add('prime-shockwave');
    
    // Dọn dẹp Class hiệu ứng sau khi hoàn tất hoạt ảnh (0.4 giây)
    setTimeout(() => {
        gameContainer.classList.remove('prime-shockwave');
    }, 400);

    // Kịch bản TRẬN ĐẤU HÒA
    if (playerChoice === computerChoice) {
        gameStatusEl.textContent = "HỆ THỐNG HÒA • PHÁT ĐỀU LẠI";
        gameStatusEl.style.color = "#94a3b8";
        gameStatusEl.style.textShadow = "0 0 8px #94a3b8";
        return;
    }

    // Kịch bản NGƯỜI CHƠI CHIẾN THẮNG
    if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        playerScore++;
        playerScoreEl.textContent = playerScore;
        gameStatusEl.textContent = `BẠN CHIẾN THẮNG • GHI +1 ĐIỂM`;
        gameStatusEl.style.color = "#10b981"; // Đèn Neon xanh lá thắng
        gameStatusEl.style.textShadow = "0 0 12px #10b981, 0 0 25px #10b981";
    } 
    // Kịch bản MÁY CHIẾN THẮNG
    else {
        computerScore++;
        computerScoreEl.textContent = computerScore;
        gameStatusEl.textContent = `MÁY CHIẾN THẮNG • HỆ THỐNG MẤT ĐIỂM`;
        gameStatusEl.style.color = "#ef4444"; // Đèn Neon đỏ thua cuộc
        gameStatusEl.style.textShadow = "0 0 12px #ef4444, 0 0 25px #ef4444";
    }
}

// Sự kiện nút Reset để khôi phục cấu hình mặc định ban đầu
resetBtn.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    playerScoreEl.textContent = '0';
    computerScoreEl.textContent = '0';
    playerIconEl.textContent = '❓';
    computerIconEl.textContent = '❓';
    gameStatusEl.textContent = 'CHỌN VŨ KHÍ ĐỂ KÍCH HOẠT HỆ THỐNG!';
    gameStatusEl.style.color = "#00f3ff";
    gameStatusEl.style.textShadow = "0 0 8px rgba(0, 243, 255, 0.4)";
});
