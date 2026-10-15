// --- BỘ ĐIỀU HƯỚNG MA TRẬN HẠT NỀN LƠ LỬNG ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resizeCanvas); resizeCanvas();

class Particle {
    constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 1.5 + 0.5; this.speedY = Math.random() * -0.3 - 0.1; }
    update() { this.y += this.speedY; if (this.y < 0) { this.y = canvas.height; this.x = Math.random() * canvas.width; } }
    draw() { ctx.fillStyle = 'rgba(0, 243, 255, 0.2)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }
}
for (let i = 0; i < 40; i++) particles.push(new Particle());
function animateParticles() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animateParticles); }
animateParticles();

// --- BỘ PHÁT TẦN SỐ ÂM THANH GAME CHUYÊN NGHIỆP ---
const GameAudio = {
    ctx: null,
    init() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); },
    play(soundType) {
        this.init(); if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        const t = this.ctx.currentTime;
        if (soundType === 'click') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(500, t);
            gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
            osc.start(t); osc.stop(t + 0.05);
        } else if (soundType === 'hit-win') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(440, t); osc.frequency.setValueAtTime(880, t + 0.08);
            gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.start(t); osc.stop(t + 0.25);
        } else if (soundType === 'hit-lose') {
            osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, t); osc.frequency.linearRampToValueAtTime(80, t + 0.2);
            gain.gain.setValueAtTime(0.12, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
            osc.start(t); osc.stop(t + 0.22);
        }
    }
};

// --- QUẢN LÝ LOGIC TRẬN ĐẤU & LOBBY SYSTEM ---
let selectedFaction = 'cyber';
let playerHP = 100;
let computerHP = 100;
let phaseCount = 1;

const lobbyScreen = document.getElementById('lobby-screen');
const arenaScreen = document.getElementById('arena-screen');
const modal = document.getElementById('victory-modal');

// Logic xử lý khi click chọn các Thẻ Hệ Phái tại Sảnh Lobby
document.querySelectorAll('.faction-card').forEach(card => {
    card.addEventListener('click', () => {
        GameAudio.play('click');
        document.querySelectorAll('.faction-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedFaction = card.getAttribute('data-faction');
    });
});

// Nút bấm Kích hoạt tìm trận -> Chuyển cảnh từ Lobby vào Sàn Đấu
document.getElementById('find-match-btn').addEventListener('click', startMatch);

function startMatch() {
    GameAudio.play('hit-win');
    const nameInput = document.getElementById('pilot-name').value || 'PILOT_01';
    
    document.getElementById('display-name').textContent = nameInput.toUpperCase();
    document.getElementById('display-faction').textContent = selectedFaction.toUpperCase();
    
    // Cài đặt lại trạng thái lượng máu trận đấu mới
    playerHP = 100; computerHP = 100; phaseCount = 1;
    document.getElementById('player-hp').style.width = '100%';
    document.getElementById('computer-hp').style.width = '100%';
    document.getElementById('phase-counter').textContent = 'PHASE 01';
    document.getElementById('player-choice-icon').textContent = '❓';
    document.getElementById('computer-choice-icon').textContent = '❓';
    document.getElementById('game-status').textContent = '> SYSTEM_READY: Mainframe connection established. Fight!';

    // Chuyển màn hình
    lobbyScreen.classList.add('hide');
    arenaScreen.classList.remove('hide');
}

// Logic chiến đấu Oẳn Tù Tì
const emojiMap = { rock: '✊', paper: '✋', scissors: '✌️' };
const viMap = { rock: 'BÚA', paper: 'BAO', scissors: 'KÉO' };

document.querySelectorAll('.action-node').forEach(node => {
    node.addEventListener('click', () => {
        if (playerHP <= 0 || computerHP <= 0) return;
        GameAudio.play('click');
        executeRound(node.getAttribute('data-choice'));
    });
});

// Bổ sung Phím tắt bàn phím cho PC
window.addEventListener('keydown', (e) => {
    if (!lobbyScreen.classList.contains('hide') && e.key === 'Enter') { startMatch(); return; }
    if (modal.classList.contains('show') && e.key === 'Enter') { GameAudio.play('click'); modal.classList.remove('show'); quitToLobby(); return; }
    if (arenaScreen.classList.contains('hide')) return;

    if (e.key === '1') { GameAudio.play('click'); executeRound('rock'); }
    else if (e.key === '2') { GameAudio.play('click'); executeRound('paper'); }
    else if (e.key === '3') { GameAudio.play('click'); executeRound('scissors'); }
    else if (e.key === 'Escape') { quitToLobby(); }
});

function executeRound(userChoice) {
    const cpuChoice = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];
    document.getElementById('player-choice-icon').textContent = emojiMap[userChoice];
    document.getElementById('computer-choice-icon').textContent = emojiMap[cpuChoice];

    // Tạo hiệu ứng rung lắc HUD khi trúng đòn
    arenaScreen.classList.remove('arena-shake'); void arenaScreen.offsetWidth; arenaScreen.classList.add('arena-shake');

    const statusEl = document.getElementById('game-status');

    if (userChoice === cpuChoice) {
        statusEl.textContent = `> TRẬN ĐẤU HÒA // HAI BÊN ĐỒNG XUNG LỰC ${viMap[userChoice]}`;
        statusEl.style.color = "#94a3b8";
    } else if (
        (userChoice === 'rock' && cpuChoice === 'scissors') ||
        (userChoice === 'paper' && cpuChoice === 'rock') ||
        (userChoice === 'scissors' && cpuChoice === 'paper')
    ) {
        // Máy bị trừ máu (Mỗi đòn thắng gây 20 sát thương tương đương tối đa 5 trận thắng)
        computerHP = Math.max(0, computerHP - 20);
        document.getElementById('computer-hp').style.width = `${computerHP}%`;
        statusEl.textContent = `> ĐÒN ĐÁNH TRÚNG ĐÍCH // ${viMap[userChoice]} HẠ GỤC ${viMap[cpuChoice]}`;
        statusEl.style.color = "#10b981";
        GameAudio.play('hit-win');
    } else {
        // Người chơi bị trừ máu
        playerHP = Math.max(0, playerHP - 20);
        document.getElementById('player-hp').style.width = `${playerHP}%`;
        statusEl.textContent = `> CẢNH BÁO BỊ KHẮC CHẾ // ${viMap[cpuChoice]} PHÁ HỦY ${viMap[userChoice]}`;
        statusEl.style.color = "#ef4444";
        GameAudio.play('hit-lose');
    }

    phaseCount++;
    document.getElementById('phase-counter').textContent = `PHASE ${phaseCount.toString().padStart(2, '0')}`;
    
    checkMatchEnd();
}

function checkMatchEnd() {
    if (playerHP <= 0 || computerHP <= 0) {
        setTimeout(() => {
            const userWon = computerHP <= 0;
            document.getElementById('modal-title').textContent = userWon ? "MISSION SUCCESS" : "MISSION FAILED";
            document.getElementById('modal-title').style.color = userWon ? "#10b981" : "#ef4444";
            document.getElementById('victory-modal').style.borderColor = userWon ? "#10b981" : "#ef4444";
            document.getElementById('modal-summary').textContent = userWon 
                ? "> Hệ thống lõi Mainframe đã bị Pilot ghi đè kiểm soát hoàn toàn." 
                : "> Kết nối thất bại. Lõi năng lượng của Pilot đã bị phá hủy hoàn toàn.";
            modal.classList.add('show');
        }, 500);
    }
}

function quitToLobby() {
    arenaScreen.classList.add('hide');
    lobbyScreen.classList.remove('hide');
}

document.getElementById('abort-btn').addEventListener('click', quitToLobby);
document.getElementById('modal-close-btn').addEventListener('click', () => {
    modal.classList.remove('show');
    quitToLobby();
});
