// --- KHỞI TẠO ĐỒ HỌA HẠT CHẠY NGẦM ---
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
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * -0.5 - 0.1;
        this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.25)' : 'rgba(217, 70, 239, 0.25)';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y < 0) { this.y = canvas.height; this.x = Math.random() * canvas.width; }
    }
    draw() { ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}
for (let i = 0; i < 50; i++) particles.push(new Particle());
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// --- BỘ ÂM THANH KỸ THUẬT SỐ ---
const AudioEngine = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    play(type) {
        this.init(); if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        const now = this.ctx.currentTime;
        if (type === 'click') {
            osc.frequency.setValueAtTime(450, now); gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04); osc.start(now); osc.stop(now + 0.04);
        } else if (type === 'win') {
            osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.07);
            gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            osc.start(now); osc.stop(now + 0.22);
        } else if (type === 'lose') {
            osc.frequency.setValueAtTime(220, now); osc.frequency.linearRampToValueAtTime(140, now + 0.18);
            gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            osc.start(now); osc.stop(now + 0.22);
        } else if (type === 'draw') {
            osc.frequency.setValueAtTime(280, now); gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12); osc.start(now); osc.stop(now + 0.12);
        }
    }
};

// --- LOGIC ĐIỀU KHIỂN & ĐỒNG BỘ TRẠNG THÁI ---
let playerScore = parseInt(localStorage.getItem('pc_playerScore')) || 0;
let computerScore = parseInt(localStorage.getItem('pc_computerScore')) || 0;
let roundCount = parseInt(localStorage.getItem('pc_roundCount')) || 1;
let matchHistory = JSON.parse(localStorage.getItem('pc_matchHistory')) || [];

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

playerScoreEl.textContent = playerScore;
computerScoreEl.textContent = computerScore;
roundCounterEl.textContent = `ROUND ${roundCount}`;
renderHistory();

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if(playerScore === 5 || computerScore === 5) return;
        AudioEngine.play('click');
        playRound(btn.getAttribute('data-choice'));
    });
});

// TÍNH NĂNG ĐỘC QUYỀN TRÊN PC: HỆ THỐNG LẮNG NGHE PHÍM TẮT BÀN PHÍM (KEYBOARD SHORTCUTS)
window.addEventListener('keydown', (e) => {
    if (modal.classList.contains('show')) {
        if (e.key === 'Enter') { AudioEngine.play('click'); modal.classList.remove('show'); resetGame(); }
        return;
    }
    if (playerScore === 5 || computerScore === 5) return;
    
    if (e.key === '1') { AudioEngine.play('click'); playRound('rock'); triggerVisualFeedback('rock'); }
    else if (e.key === '2') { AudioEngine.play('click'); playRound('paper'); triggerVisualFeedback('paper'); }
    else if (e.key === '3') { AudioEngine.play('click'); playRound('scissors'); triggerVisualFeedback('scissors'); }
    else if (e.key === 'r' || e.key === 'R') { AudioEngine.play('click'); resetGame(); }
});

function triggerVisualFeedback(id) {
    const btn = document.getElementById(id);
    btn.style.transform = 'scale(0.92)';
    setTimeout(() => btn.style.transform = 'none', 100);
}

function playRound(playerChoice) {
    const computerChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
    playerIconEl.textContent = emojiMap[playerChoice];
    computerIconEl.textContent = emojiMap[computerChoice];
    
    document.getElementById('p-display').classList.remove('winner-flash');
    document.getElementById('c-display').classList.remove('winner-flash');
    const arena = document.querySelector('.arena-panel');
    arena.classList.remove('screen-shake');
    void arena.offsetWidth;
    arena.classList.add('screen-shake');

    let res = '';
    if (playerChoice === computerChoice) {
        res = 'draw'; gameStatusEl.textContent = "HỆ THỐNG HÒA • PHÁT ĐỀU LẠI VÒNG NÀY"; gameStatusEl.style.color = "#94a3b8"; AudioEngine.play('draw');
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        res = 'win'; playerScore++; playerScoreEl.textContent = playerScore;
        document.getElementById('p-display').classList.add('winner-flash');
        gameStatusEl.textContent = `BẠN GHI ĐIỂM! • ĐÒN ${viMap[playerChoice]} KHẮC CHẾ ${viMap[computerChoice]}`;
        gameStatusEl.style.color = "#10b981"; AudioEngine.play('win');
    } else {
        res = 'lose'; computerScore++; computerScoreEl.textContent = computerScore;
        document.getElementById('c-display').classList.add('winner-flash');
        gameStatusEl.textContent = `MÁY GHI ĐIỂM! • ĐÒN ${viMap[computerChoice]} PHẢN KHÁC ${viMap[playerChoice]}`;
        gameStatusEl.style.color = "#ef4444"; AudioEngine.play('lose');
    }

    roundCount++; roundCounterEl.textContent = `ROUND ${roundCount}`;
    addHistoryLog(res, playerChoice, computerChoice);
    saveState();
    checkTournamentEnd();
}

function addHistoryLog(result, p, c) {
    let text = result === 'win' ? 'CHIẾN THẮNG' : result === 'lose' ? 'BẠI TRẬN' : 'HÒA NHAU';
    let className = `log-${result}`;
    matchHistory.unshift({ text: `[R${roundCount-1}] Bạn: ${viMap[p]} ⚔️ Máy: ${viMap[c]} → ${text}`, className });
    if (matchHistory.length > 8) matchHistory.pop(); // Tăng sức chứa log lên 8 mục trên PC
    renderHistory();
}

function renderHistory() {
    if (matchHistory.length === 0) { historyLogEl.innerHTML = '<li class="empty-log">Hệ thống trống...</li>'; return; }
    historyLogEl.innerHTML = matchHistory.map(item => `<li class="${item.className}">${item.text}</li>`).join('');
}

function saveState() {
    localStorage.setItem('pc_playerScore', playerScore); localStorage.setItem('pc_computerScore', computerScore);
    localStorage.setItem('pc_roundCount', roundCount); localStorage.setItem('pc_matchHistory', JSON.stringify(matchHistory));
}

function checkTournamentEnd() {
    if (playerScore === 5 || computerScore === 5) {
        const isWin = playerScore === 5;
        document.getElementById('modal-title').textContent = isWin ? "VICTORY!" : "DEFEAT";
        document.getElementById('modal-title').style.color = isWin ? "#10b981" : "#ef4444";
        document.getElementById('modal-summary').textContent = `Chiến dịch hoàn thành với tỷ số chung cuộc ${playerScore} - ${computerScore}`;
        modal.classList.add('show');
    }
}

function resetGame() {
    playerScore = 0; computerScore = 0; roundCount = 1; matchHistory = [];
    playerScoreEl.textContent = '0'; computerScoreEl.textContent = '0'; roundCounterEl.textContent = 'ROUND 1';
    playerIconEl.textContent = '❓'; computerIconEl.textContent = '❓';
    gameStatusEl.textContent = 'VŨ ĐÀI SẴN SÀNG • NHẤN PHÍM RA ĐÒN!'; gameStatusEl.style.color = "#e2e8f0";
    document.getElementById('p-display').classList.remove('winner-flash'); document.getElementById('c-display').classList.remove('winner-flash');
    renderHistory(); saveState();
}

document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('modal-close-btn').addEventListener('click', () => { modal.classList.remove('remove'); resetGame(); });
