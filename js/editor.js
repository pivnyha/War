// ===== РЕДАКТОР КАРТ =====
let mapData = {
    width: 20,
    height: 15,
    bg: 'white',
    cells: [],      // массив объектов: {type, x, y, prop}
    props: []       // размещённые пропы
};

let canvas, ctx;
let cellSize = 40;
let currentTool = 'place';
let currentProp = null;
let selectedElement = null;

// ===== ЭЛЕМЕНТЫ =====
const ELEMENTS = {
    floor: [
        { id: 'floor_1', name: 'Пол', icon: '⬜' },
        { id: 'floor_2', name: 'Пол тёмный', icon: '⬛' },
        { id: 'floor_3', name: 'Плитка', icon: '🔲' }
    ],
    wall: [
        { id: 'wall_1', name: 'Стена', icon: '🧱' },
        { id: 'wall_2', name: 'Стена камень', icon: '🪨' },
        { id: 'wall_3', name: 'Забор', icon: '🚧' }
    ],
    bg: [
        { id: 'bg_1', name: 'Дерево', icon: '🌳' },
        { id: 'bg_2', name: 'Куст', icon: '🌿' },
        { id: 'bg_3', name: 'Бочка', icon: '🛢️' }
    ],
    cover: [
        { id: 'cover_1', name: 'Ящик', icon: '📦' },
        { id: 'cover_2', name: 'Мешки', icon: '🟫' },
        { id: 'cover_3', name: 'Бетон', icon: '🧊' }
    ],
    npc: [
        { id: 'npc_1', name: 'НПС', icon: '👤' },
        { id: 'npc_2', name: 'Враг', icon: '👹' }
    ],
    character: [
        { id: 'char_1', name: 'Персонаж', icon: '🧍' }
    ]
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    // Выбор фона
    document.querySelectorAll('.bg-option').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('active'));
            el.classList.add('active');
            mapData.bg = el.dataset.bg;
        });
    });
    
    // Инструменты
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });
    
    // Категории элементов
    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderElements(btn.dataset.cat);
        });
    });
});

// ===== СТАРТ РЕДАКТОРА =====
function startEditor() {
    mapData.width = parseInt(document.getElementById('mapWidth').value);
    mapData.height = parseInt(document.getElementById('mapHeight').value);
    
    document.getElementById('step-setup').classList.add('hidden');
    document.getElementById('step-editor').classList.remove('hidden');
    
    // Создаём canvas
    canvas = document.getElementById('mapCanvas');
    ctx = canvas.getContext('2d');
    
    canvas.width = mapData.width * cellSize;
    canvas.height = mapData.height * cellSize;
    
    // Инициализируем пустую карту
    mapData.cells = [];
    for (let y = 0; y < mapData.height; y++) {
        for (let x = 0; x < mapData.width; x++) {
            mapData.cells.push({ x, y, type: null, prop: null });
        }
    }
    
    // Обработчики
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('contextmenu', handleRightClick);
    
    drawMap();
}

// ===== ОТРИСОВКА =====
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Фон
    const bgColors = {
        white: '#e8e8e8',
        sand: '#d4c4a0',
        forest: '#3a4a2a',
        concrete: '#8a8a8a',
        asphalt: '#2a2a2a'
    };
    ctx.fillStyle = bgColors[mapData.bg] || '#e8e8e8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Сетка
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= mapData.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, 0);
        ctx.lineTo(x * cellSize, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y <= mapData.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * cellSize);
        ctx.lineTo(canvas.width, y * cellSize);
        ctx.stroke();
    }
    
    // Пропы
    mapData.cells.forEach(cell => {
        if (cell.prop) {
            const px = cell.x * cellSize;
            const py = cell.y * cellSize;
            
            // Фон пропа
            ctx.fillStyle = 'rgba(107,140,66,0.3)';
            ctx.fillRect(px + 2, py + 2, cellSize - 4, cellSize - 4);
            
            // Иконка
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(cell.prop.icon, px + cellSize/2, py + cellSize/2);
        }
    });
}

// ===== ОБРАБОТКА КЛИКОВ =====
function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    if (x < 0 || x >= mapData.width || y < 0 || y >= mapData.height) return;
    
    const cell = mapData.cells.find(c => c.x === x && c.y === y);
    if (!cell) return;
    
    if (currentTool === 'place' && selectedElement) {
        cell.prop = selectedElement;
    } else if (currentTool === 'erase') {
        cell.prop = null;
    }
    
    drawMap();
}

function handleRightClick(e) {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    
    const cell = mapData.cells.find(c => c.x === x && c.y === y);
    if (!cell || !cell.prop) return;
    
    const action = prompt(
        'Действие:\n1 - Копировать\n2 - Удалить\n3 - Сохранить\n4 - Редактировать\n\nВведите номер:'
    );
    
    if (action === '1') {
        selectedElement = cell.prop;
        alert('Скопировано!');
    } else if (action === '2') {
        cell.prop = null;
        drawMap();
    } else if (action === '3') {
        Storage.saveMap({ id: Storage.generateId(), ...mapData });
        alert('Карта сохранена!');
    } else if (action === '4') {
        const newIcon = prompt('Новая иконка:', cell.prop.icon);
        if (newIcon) {
            cell.prop = { ...cell.prop, icon: newIcon };
            drawMap();
        }
    }
}

// ===== ЭЛЕМЕНТЫ =====
function showElements() {
    document.getElementById('elementsModal').classList.remove('hidden');
    renderElements('floor');
}

function closeElements() {
    document.getElementById('elementsModal').classList.add('hidden');
}

function renderElements(category) {
    const grid = document.getElementById('elementsGrid');
    grid.innerHTML = '';
    
    (ELEMENTS[category] || []).forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.textContent = el.icon;
        div.title = el.name;
        div.onclick = () => {
            document.querySelectorAll('.element-item').forEach(i => i.classList.remove('selected'));
            div.classList.add('selected');
            selectedElement = el;
            closeElements();
        };
        grid.appendChild(div);
    });
}

function importProp() {
    const icon = prompt('Введите эмодзи для пропа:', '📦');
    if (!icon) return;
    
    const size = prompt('Размер (1x1, 2x2, 3x3):', '1x1');
    if (!size) return;
    
    const name = prompt('Название:', 'Новый проп');
    
    const newProp = { id: 'custom_' + Date.now(), name, icon, size };
    
    // Добавляем во все категории (или в свою)
    ELEMENTS.cover.push(newProp);
    renderElements('cover');
    
    alert('Проп добавлен в категорию "Укрытия"!');
}

// ===== СОХРАНЕНИЕ =====
function saveMap() {
    const name = prompt('Название карты:', 'Карта ' + new Date().toLocaleDateString());
    if (!name) return;
    
    const map = {
        id: Storage.generateId(),
        name,
        ...mapData,
        created: Date.now()
    };
    
    Storage.saveMap(map);
    alert('Карта сохранена!');
}

function openMap() {
    const maps = Storage.getMaps();
    if (maps.length === 0) return alert('Нет сохранённых карт!');
    
    const names = maps.map((m, i) => `${i+1}. ${m.name}`).join('\n');
    const choice = prompt('Выберите карту:\n' + names);
    if (!choice) return;
    
    const idx = parseInt(choice) - 1;
    if (idx < 0 || idx >= maps.length) return;
    
    const map = maps[idx];
    mapData = { ...mapData, ...map };
    
    // Обновляем UI
    document.getElementById('mapWidth').value = mapData.width;
    document.getElementById('mapHeight').value = mapData.height;
    document.getElementById('step-setup').classList.remove('hidden');
    document.getElementById('step-editor').classList.add('hidden');
    
    alert('Карта загружена! Нажмите "ГОТОВО" для редактирования.');
}
