// ===== РЕДАКТОР КАРТ (ПЕРЕРАБОТАННЫЙ) =====
let mapData = {
    width: 20,
    height: 15,
    bg: 'white',
    cells: [],
    props: []
};

let canvas, ctx;
let cellSize = 40;
let currentTool = 'place';
let currentProp = null;
let selectedElement = null;
let currentColor = '#ffffff';
let currentSize = 1; // 1 = 1x1, 2 = 2x2, 3 = 3x3

// ===== БАЗОВЫЕ ТЕКСТУРЫ (белые фигуры) =====
const BASE_PROPS = [
    { id: 'square', name: 'Квадрат', type: 'square' },
    { id: 'circle', name: 'Круг', type: 'circle' },
    { id: 'triangle', name: 'Треугольник', type: 'triangle' },
    { id: 'diamond', name: 'Ромб', type: 'diamond' },
    { id: 'cross', name: 'Крест', type: 'cross' },
    { id: 'wall', name: 'Стена', type: 'wall' },
    { id: 'cover', name: 'Укрытие', type: 'cover' },
    { id: 'npc', name: 'НПС', type: 'npc' }
];

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
});

// ===== СТАРТ РЕДАКТОРА =====
function startEditor() {
    mapData.width = parseInt(document.getElementById('mapWidth').value);
    mapData.height = parseInt(document.getElementById('mapHeight').value);

    document.getElementById('step-setup').classList.add('hidden');
    document.getElementById('step-editor').classList.remove('hidden');

    canvas = document.getElementById('mapCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = mapData.width * cellSize;
    canvas.height = mapData.height * cellSize;

    mapData.cells = [];
    for (let y = 0; y < mapData.height; y++) {
        for (let x = 0; x < mapData.width; x++) {
            mapData.cells.push({ x, y, prop: null });
        }
    }

    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('contextmenu', handleRightClick);

    drawMap();
}

// ===== ОТРИСОВКА =====
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
            drawProp(cell.prop, cell.x * cellSize, cell.y * cellSize);
        }
    });
}

// ===== ОТРИСОВКА ПРОПА (фигуры) =====
function drawProp(prop, px, py) {
    const size = cellSize * (prop.size || 1);
    ctx.fillStyle = prop.color || '#ffffff';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    ctx.beginPath();

    switch(prop.type) {
        case 'square':
            ctx.fillRect(px + 4, py + 4, size - 8, size - 8);
            ctx.strokeRect(px + 4, py + 4, size - 8, size - 8);
            break;
        case 'circle':
            ctx.arc(px + size/2, py + size/2, size/2 - 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'triangle':
            ctx.moveTo(px + size/2, py + 6);
            ctx.lineTo(px + size - 8, py + size - 8);
            ctx.lineTo(px + 8, py + size - 8);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'diamond':
            ctx.moveTo(px + size/2, py + 6);
            ctx.lineTo(px + size - 8, py + size/2);
            ctx.lineTo(px + size/2, py + size - 8);
            ctx.lineTo(px + 8, py + size/2);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'cross':
            ctx.moveTo(px + size/2, py + 8);
            ctx.lineTo(px + size/2, py + size - 8);
            ctx.moveTo(px + 8, py + size/2);
            ctx.lineTo(px + size - 8, py + size/2);
            ctx.stroke();
            break;
        case 'wall':
            ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
            ctx.fillStyle = '#666';
            ctx.fillRect(px + 6, py + 6, size - 12, size - 12);
            break;
        case 'cover':
            ctx.fillRect(px + 6, py + 6, size - 12, size - 12);
            ctx.fillStyle = '#8cb85c';
            ctx.fillRect(px + 10, py + 10, size - 20, size - 20);
            break;
        case 'npc':
            ctx.arc(px + size/2, py + size/2, size/3, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#d4a843';
            ctx.beginPath();
            ctx.arc(px + size/2, py + size/2, size/6, 0, Math.PI * 2);
            ctx.fill();
            break;
    }
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
        cell.prop = {
            ...selectedElement,
            color: currentColor,
            size: currentSize
        };
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
        'Действие:\n1 - Копировать\n2 - Удалить\n3 - Сохранить карту\n4 - Редактировать цвет'
    );

    if (action === '1') {
        selectedElement = { ...cell.prop };
        currentColor = cell.prop.color;
        currentSize = cell.prop.size;
        alert('Скопировано!');
    } else if (action === '2') {
        cell.prop = null;
        drawMap();
    } else if (action === '3') {
        saveMap();
    } else if (action === '4') {
        const newColor = prompt('Новый цвет (HEX):', cell.prop.color);
        if (newColor) {
            cell.prop.color = newColor;
            drawMap();
        }
    }
}

// ===== МЕНЮ ЭЛЕМЕНТОВ =====
function showElements() {
    document.getElementById('elementsModal').classList.remove('hidden');
    renderElements();
}

function closeElements() {
    document.getElementById('elementsModal').classList.add('hidden');
}

function renderElements() {
    const grid = document.getElementById('elementsGrid');
    grid.innerHTML = '';

    // Добавляем панель настроек
    const settingsDiv = document.createElement('div');
    settingsDiv.style.cssText = 'grid-column: 1 / -1; display: flex; gap: 10px; align-items: center; margin-bottom: 15px; flex-wrap: wrap;';
    settingsDiv.innerHTML = `
        <label style="font-family: var(--mono); font-size: 11px; color: var(--text2);">ЦВЕТ:</label>
        <input type="color" id="propColor" value="${currentColor}" style="width: 50px; height: 30px; cursor: pointer; background: none; border: 1px solid var(--border);">
        <label style="font-family: var(--mono); font-size: 11px; color: var(--text2);">РАЗМЕР:</label>
        <select id="propSize" style="padding: 5px; background: var(--panel); border: 1px solid var(--border); color: var(--text); font-family: var(--mono);">
            <option value="1" ${currentSize === 1 ? 'selected' : ''}>1x1</option>
            <option value="2" ${currentSize === 2 ? 'selected' : ''}>2x2</option>
            <option value="3" ${currentSize === 3 ? 'selected' : ''}>3x3</option>
        </select>
        <button class="btn" onclick="importPropFile()" style="padding: 8px 16px; font-size: 11px;">📥 ИМПОРТ ИЗ ФАЙЛА</button>
    `;
    grid.appendChild(settingsDiv);

    // Обработчики
    setTimeout(() => {
        document.getElementById('propColor').addEventListener('input', (e) => {
            currentColor = e.target.value;
        });
        document.getElementById('propSize').addEventListener('change', (e) => {
            currentSize = parseInt(e.target.value);
        });
    }, 0);

    // Пропы
    BASE_PROPS.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        div.style.cssText = 'aspect-ratio: 1; background: var(--card); border: 1px solid var(--border); border-radius: 3px; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 10px;';
        div.title = el.name;

        // Рисуем превью
        const preview = document.createElement('canvas');
        preview.width = 60;
        preview.height = 60;
        const pctx = preview.getContext('2d');
        drawProp({ type: el.type, color: currentColor, size: 1 }, 0, 0, pctx, 60);
        div.appendChild(preview);

        div.onclick = () => {
            document.querySelectorAll('.element-item').forEach(i => i.style.borderColor = 'var(--border)');
            div.style.borderColor = 'var(--green)';
            selectedElement = { ...el, color: currentColor, size: currentSize };
            closeElements();
        };
        grid.appendChild(div);
    });
}

// ===== ИМПОРТ ИЗ ФАЙЛА =====
function importPropFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/png,image/jpeg,image/gif,image/svg+xml';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                // Создаём проп из изображения
                const newProp = {
                    id: 'custom_' + Date.now(),
                    name: file.name,
                    type: 'image',
                    image: event.target.result,
                    color: '#ffffff',
                    size: currentSize
                };

                // Добавляем в список
                BASE_PROPS.push(newProp);

                // Перерисовываем
                renderElements();

                alert(`Проп "${file.name}" добавлен!`);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
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

    document.getElementById('mapWidth').value = mapData.width;
    document.getElementById('mapHeight').value = mapData.height;
    document.getElementById('step-setup').classList.remove('hidden');
    document.getElementById('step-editor').classList.add('hidden');

    alert('Карта загружена! Нажмите "ГОТОВО".');
}
