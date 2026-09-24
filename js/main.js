// ===== ГЛАВНОЕ МЕНЮ =====
let currentRole = null;

// Выбор роли
function selectRole(role) {
    currentRole = role;
    document.getElementById('screen-role').classList.add('hidden');
    if (role === 'host') {
        document.getElementById('screen-host').classList.remove('hidden');
    } else {
        document.getElementById('screen-player').classList.remove('hidden');
    }
}

// Открыть редактор карт
function openMapEditor() {
    window.location.href = 'editor.html';
}

// Открыть сейвы
function openSaves() {
    const list = document.getElementById('savesList');
    const container = document.getElementById('savesContainer');
    const saves = Storage.getSaves();
    
    list.classList.remove('hidden');
    container.innerHTML = '';
    
    if (saves.length === 0) {
        container.innerHTML = '<p style="color:var(--text3)">Нет сохранённых боёв</p>';
        return;
    }
    
    saves.forEach(save => {
        const item = document.createElement('div');
        item.className = 'save-item';
        item.innerHTML = `
            <h3>${save.name || 'Без названия'}</h3>
            <p>Игроков: ${save.players?.length || 0}</p>
            <p>${new Date(save.created).toLocaleString('ru-RU')}</p>
        `;
        item.onclick = () => loadSave(save.id);
        container.appendChild(item);
    });
}

// Загрузить сохранение
function loadSave(id) {
    const save = Storage.getSaves().find(s => s.id === id);
    if (!save) return;
    localStorage.setItem('pvp_current_game', JSON.stringify(save));
    window.location.href = 'game.html';
}

// Создать новый бой
function createNewGame() {
    const code = Storage.generateCode();
    const game = {
        id: Storage.generateId(),
        name: 'Новый бой',
        code: code,
        created: Date.now(),
        players: [],
        map: null,
        characters: [],
        status: 'lobby'
    };
    Storage.saveGame(game);
    localStorage.setItem('pvp_current_game', JSON.stringify(game));
    
    alert(`Бой создан!\n\nКод для подключения: ${code}`);
    window.location.href = 'game.html';
}

// Вход через Discord (заготовка)
function loginDiscord() {
    // В реальном проекте здесь Discord OAuth2
    // Пока — заглушка
    const mockUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 6),
        username: prompt('Введите ваш ник (демо):', 'Игрок' + Math.floor(Math.random() * 1000)),
        avatar: null
    };
    if (mockUser.username) {
        Storage.setUser(mockUser);
        updateUserInfo();
        alert('Вы вошли как: ' + mockUser.username + '\n\n(В реальной версии — Discord OAuth2)');
    }
}

// Подключиться к игре
function joinGame() {
    const code = document.getElementById('joinCode').value.toUpperCase();
    if (!code) return alert('Введите код!');
    
    const saves = Storage.getSaves();
    const game = saves.find(s => s.code === code);
    
    if (!game) return alert('Бой с таким кодом не найден!');
    
    const user = Storage.getUser();
    if (!user) return alert('Сначала войдите через Discord!');
    
    // Добавляем игрока
    if (!game.players.find(p => p.id === user.id)) {
        game.players.push({
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            ready: false
        });
        Storage.saveGame(game);
    }
    
    localStorage.setItem('pvp_current_game', JSON.stringify(game));
    window.location.href = 'game.html';
}

// Обновить инфу о пользователе
function updateUserInfo() {
    const user = Storage.getUser();
    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');
    
    if (user) {
        name.textContent = user.username;
        if (user.avatar) {
            avatar.innerHTML = `<img src="${user.avatar}" alt="">`;
        } else {
            avatar.textContent = user.username[0].toUpperCase();
        }
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    updateUserInfo();
});
