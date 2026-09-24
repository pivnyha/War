// ===== ИГРА =====
let game = null;
let me = null;
let canvas, ctx;
let selectedWeaponIndex = 0;

const WEAPONS = {
    pistol:  { name: 'Пистолет',    dice: '2d8' },
    smg:     { name: 'ПП',          dice: '3d8' },
    shotgun: { name: 'Дробовик',    dice: '4d6' },
    bolt:    { name: 'Болтовая',    dice: 'd20' },
    semi:    { name: 'Полуавтомат', dice: '3d10' },
    auto:    { name: 'Автомат',     dice: '2d15' },
    mg:      { name: 'Пулемет',     dice: '6d6' },
    melee:   { name: 'Холодное',    dice: 'd15' }
};

document.addEventListener('DOMContentLoaded', () => {
    game = JSON.parse(localStorage.getItem('pvp_current_game') || 'null');
    me = Storage.getUser();

    if (!game) {
        alert('Игра не найдена!');
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('gameCode').textContent = game.code;

    // Firebase
    if (typeof initFirebase === 'function') {
        initFirebase();
        if (game.code && game.code !== 'TEST-0001') {
            listenGame(game.code, (data) => {
                game = { ...game, ...data };
                renderLobby();
            });
        }
    }

    renderLobby();

    if (game.status === 'battle') {
        startBattle();
    }
});

// ===== ЛОББИ =====
function renderLobby() {
    const list = document.getElementById('playersList');
    if (!list) return;
    list.innerHTML = '';

    (game.players || []).forEach(p => {
        const card = document.createElement('div');
        card.className = 'player-card' + (p.ready ? ' ready' : '');
        card.innerHTML = `
            <div class="avatar">${p.avatar ? `<img src="${p.avatar}">` : p.username[0].toUpperCase()}</div>
            <div class="name">${p.username}</div>
            <div class="status">${p.ready ? '✓ ГОТОВ' : 'ОЖИДАНИЕ'}</div>
        `;
        list.appendChild(card);
    });

    const myPlayer = game.players?.find(p => p.id === me?.id);
    const btn = document.getElementById('readyBtn');
    if (myPlayer?.ready) {
        btn.textContent = '❌ ОТМЕНИТЬ';
        btn.classList.remove('primary');
    } else {
        btn.textContent = '✅ ГОТОВО';
        btn.classList.add('primary');
    }
}

function toggleReady() {
    if (!me) return;
    const player = game.players.find(p => p.id === me.id);
    if (!player) return;

    player.ready = !player.ready;

    Storage.saveGame(game);
    localStorage.setItem('pvp_current_game', JSON.stringify(game));

    if (typeof syncGame === 'function' && game.code !== 'TEST-0001') {
        syncGame(game);
    }

    renderLobby();

    if (game.players.length > 0 && game.players.every(p => p.ready)) {
        setTimeout(startBattle, 1000);
    }
}

// ===== БОЙ =====
function startBattle() {
    game.status = 'battle';
    Storage.saveGame(game);
    localStorage.setItem('pvp_current_game', JSON.stringify(game));

    document.getElementById('game-lobby').classList.add('hidden');
    document.getElementById('game-battle').classList.remove('hidden');
    document.getElementById('gameStatus').textContent = 'БОЙ';

    canvas = document.getElementById('battleCanvas');
    ctx = canvas.getContext('2d');

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Инициатива (если ещё не бросали)
    if (!game.turnOrder) {
        rollInitiative();
    }

    drawBattle();
    renderWeaponSlots();
    renderActionButtons();
}

function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    if (game?.status === 'battle') drawBattle();
}

function rollInitiative() {
    game.players.forEach(p => {
        p.initiative = Math.floor(Math.random() * 20) + 1;
    });

    game.turnOrder = [...game.players].sort((a, b) => b.initiative - a.initiative);
    game.currentTurn = 0;
}

// ===== ОТРИСОВКА БОЯ =====
function drawBattle() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Фон
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Сетка
    const cell = 50;
    ctx.strokeStyle = 'rgba(107, 140, 66, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += cell) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += cell) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Персонажи
    const teamColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
    const startX = 100;
    const startY = 120;
    const gap = 90;

    (game.players || []).forEach((p, i) => {
        const x = startX + (i % 5) * gap;
        const y = startY + Math.floor(i / 5) * gap;

        // Тень
        ctx.beginPath();
        ctx.arc(x, y + 22, 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fill();

        // Тело
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        // Обводка команды
        ctx.strokeStyle = teamColors[p.team || 0];
        ctx.lineWidth = 4;
        ctx.stroke();

        // Аватар или буква
        ctx.fillStyle = '#111';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.username[0].toUpperCase(), x, y);

        // Ник
        ctx.fillStyle = '#888';
        ctx.font = '11px Arial';
        ctx.fillText(p.username, x, y + 36);
    });

    // Инфо хода
    renderTurnInfo();
}

function renderTurnInfo() {
    const existing = document.querySelector('.turn-info');
    if (existing) existing.remove();

    if (!game.turnOrder || !game.turnOrder.length) return;

    const current = game.turnOrder[game.currentTurn];
    if (!current) return;

    const div = document.createElement('div');
    div.className = 'turn-info';
    div.textContent = `ХОД: ${current.username}`;
    document.querySelector('.battle-layout').appendChild(div);
}

// ===== ПАНЕЛЬ ОРУЖИЯ =====
function renderWeaponSlots() {
    const myPlayer = game.players.find(p => p.id === me?.id);
    const weapons = myPlayer?.weapons || [null, null];

    for (let i = 0; i < 2; i++) {
        const slot = document.getElementById('weaponSlot' + i);
        if (!slot) continue;

        const svg = slot.querySelector('.weapon-svg');
        const label = slot.querySelector('.weapon-label');

        const weaponId = weapons[i];
        svg.innerHTML = getWeaponSVG(weaponId);

        if (weaponId) {
            slot.classList.remove('empty');
            label.textContent = WEAPONS[weaponId]?.name || 'ОРУЖИЕ';
        } else {
            slot.classList.add('empty');
            label.textContent = 'ПУСТО';
        }

        if (i === selectedWeaponIndex) {
            slot.classList.add('active');
        } else {
            slot.classList.remove('active');
        }
    }
}

function selectWeapon(index) {
    const myPlayer = game.players.find(p => p.id === me?.id);
    if (!myPlayer?.weapons?.[index]) {
        showGameMsg('Слот пуст');
        return;
    }

    selectedWeaponIndex = index;
    renderWeaponSlots();
    showGameMsg('Выбрано: ' + WEAPONS[myPlayer.weapons[index]].name);
}

// ===== ПАНЕЛЬ ДЕЙСТВИЙ =====
function renderActionButtons() {
    const existing = document.querySelector('.action-sidebar');
    if (existing) existing.remove();

    const sidebar = document.createElement('div');
    sidebar.className = 'action-sidebar';
    sidebar.innerHTML = `
        <button class="action-btn" onclick="doAction('attack')">⚔ АТАКА</button>
        <button class="action-btn" onclick="doAction('cover')">🛡 УКРЫТИЕ</button>
        <button class="action-btn" onclick="doAction('move')">🏃 ПЕРЕБЕЖКА</button>
        <button class="action-btn" onclick="doAction('skill')">✨ НАВЫК</button>
        <button class="action-btn" onclick="endGame()">⏻ ЗАВЕРШИТЬ</button>
    `;
    document.querySelector('.battle-layout').appendChild(sidebar);
}

// ===== ДЕЙСТВИЯ =====
function rollDice(formula) {
    const match = formula.match(/^(\d*)d(\d+)$/);
    if (!match) return 0;
    const count = parseInt(match[1]) || 1;
    const sides = parseInt(match[2]);
    let total = 0;
    for (let i = 0; i < count; i++) {
        total += Math.floor(Math.random() * sides) + 1;
    }
    return total;
}

function doAction(action) {
    const current = game.turnOrder?.[game.currentTurn];
    if (!current || current.id !== me?.id) {
        return showGameMsg('Не ваш ход!');
    }

    if (action === 'attack') {
        const myPlayer = game.players.find(p => p.id === me.id);
        const weaponId = myPlayer?.weapons?.[selectedWeaponIndex];
        if (!weaponId) return showGameMsg('Выберите оружие!');

        const weapon = WEAPONS[weaponId];
        const result = rollDice(weapon.dice);

        showGameMsg(`⚔ ${weapon.name}: ${weapon.dice} → ${result}`);

        if (typeof sendAction === 'function' && game.code !== 'TEST-0001') {
            sendAction(game.code, { playerId: me.id, type: 'attack', weapon: weaponId, result });
        }

        nextTurn();
    } else if (action === 'cover') {
        showGameMsg('🛡 В укрытии');
        nextTurn();
    } else if (action === 'move') {
        showGameMsg('🏃 Перебежка (до 8 клеток)');
        nextTurn();
    } else if (action === 'skill') {
        showGameMsg('✨ Навык использован');
        nextTurn();
    }
}

function nextTurn() {
    if (!game.turnOrder) return;
    game.currentTurn = (game.currentTurn + 1) % game.turnOrder.length;
    renderTurnInfo();
    Storage.saveGame(game);
    localStorage.setItem('pvp_current_game', JSON.stringify(game));
}

// ===== ЗАВЕРШЕНИЕ =====
function endGame() {
    if (!confirm('Завершить партию?')) return;
    game.status = 'ended';
    Storage.saveGame(game);
    alert('Партия завершена!');
    window.location.href = 'index.html';
}

// ===== СООБЩЕНИЯ =====
function showGameMsg(text) {
    const existing = document.querySelector('.game-msg');
    if (existing) existing.remove();

    const div = document.createElement('div');
    div.className = 'game-msg';
    div.textContent = text;
    div.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 10, 0.95);
        border: 1px solid #6b8c42;
        color: #8cb85c;
        padding: 16px 28px;
        font-family: 'Share Tech Mono', monospace;
        font-size: 14px;
        letter-spacing: 2px;
        border-radius: 3px;
        z-index: 100;
        pointer-events: none;
        animation: fadeIn 0.2s ease;
    `;
    document.querySelector('.battle-layout').appendChild(div);

    setTimeout(() => div.remove(), 2000);
}
