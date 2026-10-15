// --- BỘ PHÁT HẠT MA TRẬN NỀN ---
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
        this.size = Math.random() * 1.5 + 0.5;
        this.speedY = Math.random() * -0.4 - 0.1;
        this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
        this.y += this.speedY;
        if (this.y < 0) { this.y = canvas.height; this.x = Math.random() * canvas.width; }
    }
    draw() {
        ctx.fillStyle = `rgba(0, 243, 255, ${this.alpha})`;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
}
for (let i = 0; i < 40; i++) particles.push(new Particle());
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
}
animateParticles();

// --- AUDIO SYNTHESIZER ENGINE (Tạo sóng âm thanh Real-time) ---
const SoundFX = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    play(mode) {
        this.init(); if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        const t = this.ctx.currentTime;
        if (mode === 'click') {
            osc.type = 'square'; osc.frequency.setValueAtTime(600, t);
            gain.gain.setValueAtTime(0.04, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
            osc.start(t); osc.stop(t + 0.04);
        } else if (mode === 'win') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(587.33, t); // D5
            osc.frequency.setValueAtTime(880, t + 0.06); // A5
            gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
            osc.start(t); osc.stop(t + 0.2);
        } else if (mode === 'lose') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(180, t);
            osc.frequency.linearRampToValueAtTime(90, t + 0.2);
            gain.gain.setValueAtTime(0.12, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t); osc.stop(t + 0.22);
        } else if (mode === 'draw') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(320, t);
            gain.gain.setValueAtTime(0.06, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
            osc.start(t); osc.stop(t + 0.12);
        }
    }
};

// --- LOGIC HỆ THỐNG VÀ ĐỒNG BỘ LOCALSTORAGE ---
let playerScore = parseInt(localStorage.getItem('hud_playerScore')) || 0;
let computerScore = parseInt(localStorage.getItem('hud_computerScore')) || 0;
let roundCount = parseInt(localStorage.getItem('hud_roundCount')) || 1;
let matchHistory = JSON.parse(localStorage.getItem('hud_matchHistory')) || [];

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
roundCounterEl.textContent = `PHASE ${roundCount.toString().padStart(2, '0')}`;
renderHistory();

document.querySelectorAll('.cyber-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if(playerScore === 5 || computerScore === 5) return;
        SoundFX.play('click');
        playRound(btn.getAttribute('data-choice'));
    });
});

// LẮNG NGHE BÀN PHÍM CƠ
window.addEventListener('keydown', (e) => {
    if (modal.classList.contains('show')) {
        if (e.key === 'Enter') { SoundFX.play('click'); modal.classList.remove('show'); resetGame(); }
        return;
    }
    if (playerScore === 5 || computerScore === 5) return;
    
    if (e.key === '1') { SoundFX.play('click'); playRound('rock'); keyEffect('rock'); }
    else if (e.key === '2') { SoundFX.play('click'); playRound('paper'); keyEffect('paper'); }
    else if (e.key === '3') { SoundFX.play('click'); playRound('scissors'); keyEffect('scissors'); }
    else if (e.key === 'r' || e.key === 'R') { SoundFX.play('click'); resetGame(); }
});

function keyEffect(id) {
    const btn = document.getElementById(id);
    btn.style.background = 'rgba(0, 243, 255, 0.25)';
    setTimeout(() => btn.style.background = '#0b0716', 120);
}

function playRound(playerChoice) {
    const computerChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
    playerIconEl.textContent = emojiMap[playerChoice];
    computerIconEl.textContent = emojiMap[computerChoice];
    
    const zone = document.querySelector('.arena-zone');
    zone.classList.remove('flash-hit'); void zone.offsetWidth; zone.classList.add('flash-hit');

    let res = '';
    if (playerChoice === computerChoice) {
        res = 'draw'; gameStatusEl.textContent = `> SIGNAL_MATCH_DRAW // BOTH DEPLOYED ${viMap[playerChoice]}`; gameStatusEl.style.color = "#94a3b8"; SoundFX.play('draw');
    } else if (
        (playerChoice === 'rock' && computerChoice === 'scissors') ||
        (playerChoice === 'paper' && computerChoice === 'rock') ||
        (playerChoice === 'scissors' && computerChoice === 'paper')
    ) {
        res = 'win'; playerScore++; playerScoreEl.textContent = playerScore;
        gameStatusEl.textContent = `> CRITICAL_STRIKE // PILOT OVERRIDES WITH ${viMap[playerChoice]}`;
        gameStatusEl.style.color = "#10b981"; SoundFX.play('win');
    } else {
        res = 'lose'; computerScore++; computerScoreEl.textContent = computerScore;
        gameStatusEl.textContent = `> WARNING: SHIELD_BREACH // MAINFRAME DEPLOYED ${viMap[computerChoice]}`;
        gameStatusEl.style.color = "#ef4444"; SoundFX.play('lose');
    }

    roundCount++; roundCounterEl.textContent = `PHASE ${roundCount.toString().padStart(2, '0')}`;
    addHistoryLog(res, playerChoice, computerChoice); saveState(); checkTournamentEnd();
}

function addHistoryLog(result, p, c) {
    let text = result === 'win' ? 'SUCCESS' : result === 'lose' ? 'FAILED' : 'STABLE';
    let className = `log-${result}`;
    matchHistory.unshift({ text: `> [P_${roundCount-1}] P_SIG:${viMap[p]} ⚔️ C_SIG:${viMap[c]} // STATUS:${text}`, className });
    if (matchHistory.length > 4) matchHistory.pop();
    renderHistory();
}

function renderHistory() {
    if (matchHistory.length === 0) { historyLogEl.innerHTML = '<li class="empty-log">> COLD_BOOT: System initialized. No logs recorded.</li>'; return; }
    historyLogEl.innerHTML = matchHistory.map(item => `<li class="${item.className}">${item.text}</li>`).join('');
}

function saveState() {
    localStorage.setItem('hud_playerScore', playerScore); localStorage.setItem('hud_computerScore', computerScore);
    localStorage.setItem('hud_roundCount', roundCount); localStorage.setItem('hud_matchHistory', JSON.stringify(matchHistory));
}

function checkTournamentEnd() {
    if (playerScore === 5 || computerScore === 5) {
        const isWin = playerScore === 5;
        document.getElementById('modal-title').textContent = isWin ? "ACCESS GRANTED" : "SYSTEM LOCKED";
        document.getElementById('modal-title').style.color = isWin ? "#10b981" : "#ef4444";
        document.getElementById('victory-modal').style.borderColor = isWin ? "#10b981" : "#ef4444";
        document.getElementById('modal-summary').textContent = `Mainframe interaction concluded with final status: ${playerScore} - ${computerScore}`;
        modal.classList.add('show');
    }
}

function resetGame() {
    playerScore = 0; computerScore = 0; roundCount = 1; matchHistory = [];
    playerScoreEl.textContent = '0'; computerScoreEl.textContent = '0'; roundCounterEl.textContent = 'PHASE 01';
    playerIconEl.textContent = '❓'; computerIconEl.textContent = '❓';
    gameStatusEl.textContent = '> AWAITING OPERATOR INPUT... CHOOSE WEAPON KEYS [1, 2, 3]'; gameStatusEl.style.color = "#00f3ff";
    renderHistory(); saveState();
}

document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('modal-close-btn').addEventListener('click', () => { modal.classList.remove('show'); resetGame(); });
