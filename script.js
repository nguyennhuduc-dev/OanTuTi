// --- BỘ QUẢN LÝ TIÊU CHUẨN ĐỒ HỌA HẠT NỀN (PARTICLES SYSTEMS) ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * -0.6 - 0.1;
        this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.3)' : 'rgba(217, 70, 239, 0.3)';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < 0) {
            this.y = canvas.height;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 40; i++) particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();


// --- HỆ THỐNG ÂM THANH KỸ THUẬT SỐ TỰ ĐỘNG CHẠY BẰNG WEB AUDIO API ---
const AudioEngine = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    play(type) {
        this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;
        if (type === 'click') {
            osc.frequency.setValueAtTime(400, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now); osc.stop(now + 0.05);
        } else if (type === 'win') {
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now); osc.stop(now + 0.25);
        } else if (type === 'lose') {
            osc.frequency.setValueAtTime(220, now); // A3
            osc.frequency.linearRampToValueAtTime(146.83, now + 0.2); // D3
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now); osc.stop(now + 0.25);
        } else if (type === 'draw') {
            osc.frequency.setValueAtTime(300, now);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now); osc.stop(now + 0.15);
        }
    }
};


// --- HỆ THỐNG QUẢN LÝ TRẠNG THÁI TRÒ CHƠI & DỮ LIỆU CỨNG ---
let playerScore = parseInt(localStorage.getItem('pro_playerScore')) || 0;
let computerScore = parseInt(localStorage.getItem('pro_computerScore')) || 0;
let roundCount = parseInt(localStorage.getItem('pro_roundCount')) || 1;
let matchHistory = JSON.parse(localStorage.getItem('pro_matchHistory')) || [];

const emojiMap = { rock: '✊', paper: '✋', scissors: '✌️' };
const viMap = { rock: 'BÚA', paper: 'BAO', scissors: 'KÉO' };

const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');
const roundCounterEl = document.getElementById('round-counter');
const playerIconEl = document.getElementById('player-choice-icon');
const computerIconEl = document.getElementById('computer-choice-icon');
const gameStatusEl = document.getElementById('game-status');
const historyLogEl = document.getElementById('history-log');
const modal = document.getElementById('victory-modal');

// Đồng bộ giao diện ban đầu từ Storage
playerScoreEl.textContent = playerScore;
computerScoreEl.textContent = computerScore;
roundCounterEl.textContent = `ROUND ${roundCount}`;
renderHistory();

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        AudioEngine.play('click');
        playRound(btn.getAttribute('data-choice'));
    });
});

function playRound(playerChoice) {
    const computerChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
    
    playerIconEl.textContent = emojiMap[playerChoice];
    computerIconEl.textContent = emojiMap[computerChoice];
    
    // Reset hiệu ứng đồ họa
    document.getElementById('p-display').classList.remove('winner-flash');
    document.getElementById('c-display').classList.remove('winner-flash');
    const container = document.querySelector('.game-container');
    container.classList.remove('screen-shake');
    void container.offsetWidth; // Trigger reflow kích hoạt lại animation
    container.classList.add('screen-shake');

    let res = '';
    if (playerChoice === computerChoice) {
        res = 'draw';
        gameStatusEl.textContent = "HỆ THỐNG HÒA • PHÁT ĐỀU LẠI";
        gameStatusEl.style.color = "#94a3b8";
        AudioEngine.play('draw');
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        res = 'win';
        playerScore++;
        playerScoreEl.textContent = playerScore;
        document.getElementById('p-display').classList.add('winner-flash');
        gameStatusEl.textContent = `BẠN CHIẾN THẮNG • ${viMap[playerChoice]} THẮNG ${viMap[computerChoice]}`;
        gameStatusEl.style.color = "#10b981";
        AudioEngine.play('win');
    } else {
        res = 'lose';
        computerScore++;
        computerScoreEl.textContent = computerScore;
        document.getElementById('c-display').classList.add('winner-flash');
        gameStatusEl.textContent = `MÁY CHIẾN THẮNG • ${viMap[computerChoice]} THẮNG ${viMap[playerChoice]}`;
        gameStatusEl.style.color = "#ef4444";
        AudioEngine.play('lose');
    }

    roundCount++;
    roundCounterEl.textContent = `ROUND ${roundCount}`;
    
    // Ghi nhật ký lịch sử thi đấu
    addHistoryLog(res, playerChoice, computerChoice);
    saveState();
    checkTournamentEnd();
}

function addHistoryLog(result, p, c) {
    let text = result === 'win' ? 'THẮNG' : result === 'lose' ? 'THUA' : 'HÒA';
    let className = `log-${result}`;
    matchHistory.unshift({ text: `Bạn: ${viMap[p]} vs Máy: ${viMap[c]} → ${text}`, className });
    if (matchHistory.length > 5) matchHistory.pop();
    renderHistory();
}

function renderHistory() {
    if (matchHistory.length === 0) {
        historyLogEl.innerHTML = '<li class="empty-log">Chưa có dữ liệu trận đấu</li>';
        return;
    }
    historyLogEl.innerHTML = matchHistory.map(item => `<li class="${item.className}">${item.text}</li>`).join('');
}

function saveState() {
    localStorage.setItem('pro_playerScore', playerScore);
    localStorage.setItem('pro_computerScore', computerScore);
    localStorage.setItem('pro_roundCount', roundCount);
    localStorage.setItem('pro_matchHistory', JSON.stringify(matchHistory));
}

function checkTournamentEnd() {
    if (playerScore === 5 || computerScore === 5) {
        const isWin = playerScore === 5;
        document.getElementById('modal-title').textContent = isWin ? "VICTORY!" : "DEFEAT";
        document.getElementById('modal-title').style.color = isWin ? "#10b981" : "#ef4444";
        document.getElementById('victory-modal').style.border = isWin ? "2px solid #10b981" : "2px solid #ef4444";
        document.getElementById('modal-summary').textContent = `Giải đấu kết thúc với tỷ số chung cuộc ${playerScore} - ${computerScore}`;
        modal.classList.add('show');
    }
}

function resetGame() {
    playerScore = 0; computerScore = 0; roundCount = 1; matchHistory = [];
    playerScoreEl.textContent = '0'; computerScoreEl.textContent = '0';
    roundCounterEl.textContent = 'ROUND 1';
    playerIconEl.textContent = '❓'; computerIconEl.textContent = '❓';
    gameStatusEl.textContent = 'HỆ THỐNG SẴN SÀNG • KHỞI TRANH!';
    gameStatusEl.style.color = "#e2e8f0";
    document.getElementById('p-display').classList.remove('winner-flash');
    document.getElementById('c-display').classList.remove('winner-flash');
    renderHistory();
    saveState();
}

document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('modal-close-btn').addEventListener('click', () => {
    modal.classList.remove('show');
    resetGame();
});
