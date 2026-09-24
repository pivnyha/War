// ===== ИГРА =====
let game = null;
let me = null;
let canvas, ctx;

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    game = JSON.parse(localStorage.getItem('pvp_current_game') || 'null');
    me = Storage.getUser();
    
    if (!game) {
        alert('Игра не найдена!');
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('gameCode').textContent = game.code;
    
    renderLobby();
    
    // Проверяем — началась ли игра
    if (game.status === 'battle') {
        startBattle();
    }
});

// ===== ЛОББИ =====
function renderLobby() {
    const list = document.getElementById('playersList');
    list.innerHTML = '';
    
    game.players.forEach(p => {
        const card = document.createElement('div');
        card.className = 'player-card' + (p.ready ? ' ready' : '');
        card.innerHTML = `
            <div class="avatar">${p.avatar ? `<img src="${p.avatar}">` : p.username[0].toUpperCase()}</div>
            <div class="name">${p.username}</div>
            <div class="status">${p.ready ? '✓ ГОТОВ' : 'ОЖИДАНИЕ'}</div>
        `;
        list.appendChild(card);
    });
    
    // Проверяем готовность
    const myPlayer = game.players.find(p => p.id === me?.id);
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
    
    // Сохраняем
    Storage.saveGame(game);
    localStorage.setItem('pvp_current_game', JSON.stringify(game));
    
    renderLobby();
    
    // Если все готовы — начинаем бой (только хост)
    if (game.players.length > 0 && game.players.every(p => p.ready)) {
        // Автоматически запускаем через 1 сек
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
    
    // Устанавливаем размеры
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Инициатива
    rollInitiative();
    
    drawBattle();
    renderWeapons();
}

function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
    if (game.status === 'battle') drawBattle();
}

function rollInitiative() {
    game.players.forEach(p => {
        p.initiative = Math.floor(Math.random() * 20) + 1;
    });
    
    game.turnOrder = [...game.players].sort((a, b) => b.initiative - a.initiative);
    game.currentTurn = 0;
    
    updateTurnInfo();
}

function updateTurnInfo() {
    const current = game.turnOrder[game.currentTurn];
    const el = document.getElementById('turnInfo');
    if (current) {
        el.textContent = `Ход: ${current.username} (${current.initiative})`;
    }
}

function drawBattle() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Сетка
    const cellSize = 40;
    ctx.strokeStyle = 'rgba(107,140,66,0.1)';
    for (let x = 0; x < canvas.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Персонажи
    const teamColors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
    game.players.forEach((p, i) => {
        const x = 100 + (i % 5) * 80;
        const y = 100 + Math.floor(i / 5) * 80;
        
        // Круг персонажа
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        
        // Обводка команды
        ctx.strokeStyle = teamColors[p.team || 0];
        ctx.lineWidth = 4;
        ctx.stroke();
        
        // Аватарка или буква
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.username[0].toUpperCase(), x, y);
        
        // Ник
        ctx.fillStyle = '#d4d4d4';
        ctx.font = '11px Arial';
        ctx.fillText(p.username, x, y + 32);
    });
}

function renderWeapons() {
    const container = document.getElementById('weaponsSlots');
    container.innerHTML = '';
    
    const myPlayer = game.players.find(p => p.id === me?.id);
    const weapons = myPlayer?.weapons || [];
    
    for (let i = 0; i < 2; i++) {
        const slot = document.createElement('div');
        slot.className = 'weapon-slot' + (weapons[i] ? '' : ' empty');
        slot.textContent = weapons[i] ? weapons[i].icon : 'ПУСТО';
        slot.onclick = () => selectWeapon(i);
        container.appendChild(slot);
    }
}

function selectWeapon(index) {
    const myPlayer = game.players.find(p => p.id === me?.id);
    if (!myPlayer?.weapons?.[index]) return;
    myPlayer.selectedWeapon = index;
    alert(`Выбрано: ${myPlayer.weapons[index].name}`);
}

// ===== ДЕЙСТВИЯ =====
const WEAPONS = {
    pistol: { name: 'Пистолет', icon: '🔫', dice: '2d8' },
    smg: { name: 'ПП', icon: '🔫', dice: '3d8' },
    shotgun: { name: 'Дробовик', icon: '🔫', dice: '4d6' },
    bolt: { name: 'Болтовая винтовка', icon: '🎯', dice: 'd20' },
    semi: { name: 'Полуавтоматическая', icon: '🔫', dice: '3d10' },
    auto: { name: 'Автомат', icon: '🔫', dice: '2d15' },
    mg: { name: 'Пулемет', icon: '🔫', dice: '6d6' },
    melee: { name: 'Холодное', icon: '⚔️', dice: 'd15' }
};

function rollDice(formula) {
    // Парсим формулу: 2d8, d20, 6d6
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
    const current = game.turnOrder[game.currentTurn];
    if (!current || current.id !== me?.id) {
        return alert('Сейчас не ваш ход!');
    }
    
    if (action === 'attack') {
        const myPlayer = game.players.find(p => p.id === me.id);
        const weapon = myPlayer.weapons?.[myPlayer.selectedWeapon || 0];
        if (!weapon) return alert('Выберите оружие!');
        
        const result = rollDice(weapon.dice);
        alert(`⚔️ АТАКА!\n\nОружие: ${weapon.name}\nБросок: ${weapon.dice}\nРезультат: ${result}`);
        
        nextTurn();
    } else if (action === 'cover') {
        alert('🛡️ Вы в укрытии!');
        nextTurn();
    } else if (action === 'move') {
        alert('🏃 Перебежка (до 8 клеток)');
        nextTurn();
    } else if (action === 'skill') {
        alert('✨ Использование навыка');
        nextTurn();
    }
}

function nextTurn() {
    game.currentTurn = (game.currentTurn + 1) % game.turnOrder.length;
    updateTurnInfo();
    Storage.saveGame(game);
    localStorage.setItem('pvp_current_game', JSON.stringify(game));
}

// ===== ВРЕМЕННОЕ ЗАВЕРШЕНИЕ =====
function endGame() {
    if (!confirm('Временно завершить партию?')) return;
    game.status = 'ended';
    Storage.saveGame(game);
    alert('Партия завершена!');
    window.location.href = 'index.html';
}
