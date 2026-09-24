// ===== РЕДАКТОР КАРТ =====
let mapData = {
    width: 20,
    height: 15,
    bg: 'white',
    cells: []
};

let canvas, ctx;
let cellSize = 40;
let currentTool = 'place';
let selectedElement = null;
let currentColor = '#ffffff';
let currentSize = 1;
let customProps = [];

// ===== БАЗОВЫЕ ПРОПЫ (белые фигуры) =====
const BASE_PROPS = [
    { id: 'square', name: 'Квадрат', type: 'square' },
    { id: 'circle', name: 'Круг', type: 'circle' },
    { id: 'triangle', name: 'Треугольник', type: 'triangle' },
    { id: 'diamond', name: 'Ромб', type: 'diamond' },
    { id: 'cross', name: 'Крест', type: 'cross' },
    { id: 'wall', name: 'Стена', type: 'wall' },
    { id: 'cover', name: 'Укрытие', type: 'cover' },
    { id: 'npc', name: 'НПС', type: 'npc' },
    { id: 'character', name: 'Персонаж', type: 'character' }
];

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bg-option').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.bg-option').forEach(o => o.classList.remove('active'));
            el.classList.add('active');
            mapData.bg = el.dataset.bg;
        });
    });

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    // Синхронизация цвета и размера с сайдбаром
    const colorInput = document.getElementById('propColor');
    const sizeSelect = document.getElementById('propSize');

    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            currentColor = e.target.value;
            updateCurrentPropBox();
        });
    }
    if (sizeSelect) {
        sizeSelect.addEventListener('change', (e) => {
            currentSize = parseInt(e.target.value);
            updateCurrentPropBox();
        });
    }
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

// ===== ОБНОВЛЕНИЕ ПЛАШКИ ТЕКУЩЕГО ПРОПА =====
function updateCurrentPropBox() {
    const box = document.getElementById('currentPropName');
    if (!box) return;
    if (selectedElement) {
        box.textContent = selectedElement.name + ` (${currentSize}x${currentSize})`;
        box.style.color = currentColor;
    } else {
        box.textContent = 'Не выбран';
        box.style.color = 'var(--text2)';
    }
}

// ===== ОТРИСОВКА КАРТЫ =====
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
            drawProp(ctx, cell.prop, cell.x * cellSize, cell.y * cellSize, cellSize);
        }
    });
}

// ===== ОТРИСОВКА ПРОПА (УНИВЕРСАЛЬНАЯ) =====
function drawProp(targetCtx, prop, px, py, size) {
    const totalSize = size * (prop.size || 1);
    const pad = 4;

    targetCtx.save();

    // Для изображения
    if (prop.type === 'image' && prop.image) {
        const img = new Image();
        img.onload = () => {
            targetCtx.drawImage(img, px + pad, py + pad, totalSize - pad*2, totalSize - pad*2);
        };
        img.src = prop.image;
        targetCtx.restore();
        return;
    }

    targetCtx.fillStyle = prop.color || '#ffffff';
    targetCtx.strokeStyle = '#333';
    targetCtx.lineWidth = 2;

    const cx = px + totalSize / 2;
    const cy = py + totalSize / 2;

    switch(prop.type) {
        case 'square':
            targetCtx.fillRect(px + pad, py + pad, totalSize - pad*2, totalSize - pad*2);
            targetCtx.strokeRect(px + pad, py + pad, totalSize - pad*2, totalSize - pad*2);
            break;

        case 'circle':
            targetCtx.beginPath();
            targetCtx.arc(cx, cy, totalSize/2 - pad - 2, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.stroke();
            break;

        case 'triangle':
            targetCtx.beginPath();
            targetCtx.moveTo(cx, py + pad + 2);
            targetCtx.lineTo(px + totalSize - pad - 2, py + totalSize - pad - 2);
            targetCtx.lineTo(px + pad + 2, py + totalSize - pad - 2);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();
            break;

        case 'diamond':
            targetCtx.beginPath();
            targetCtx.moveTo(cx, py + pad + 2);
            targetCtx.lineTo(px + totalSize - pad - 2, cy);
            targetCtx.lineTo(cx, py + totalSize - pad - 2);
            targetCtx.lineTo(px + pad + 2, cy);
            targetCtx.closePath();
            targetCtx.fill();
            targetCtx.stroke();
            break;

        case 'cross':
            targetCtx.lineWidth = 4;
            targetCtx.beginPath();
            targetCtx.moveTo(cx, py + pad);
            targetCtx.lineTo(cx, py + totalSize - pad);
            targetCtx.moveTo(px + pad, cy);
            targetCtx.lineTo(px + totalSize - pad, cy);
            targetCtx.stroke();
            break;

        case 'wall':
            targetCtx.fillRect(px + 2, py + 2, totalSize - 4, totalSize - 4);
            targetCtx.fillStyle = 'rgba(0,0,0,0.4)';
            targetCtx.fillRect(px + 6, py + 6, totalSize - 12, totalSize - 12);
            break;

        case 'cover':
            targetCtx.fillRect(px + 6, py + 6, totalSize - 12, totalSize - 12);
            targetCtx.strokeStyle = '#333';
            targetCtx.lineWidth = 3;
            targetCtx.strokeRect(px + 6, py + 6, totalSize - 12, totalSize - 12);
            break;

        case 'npc':
            targetCtx.beginPath();
            targetCtx.arc(cx, cy, totalSize/3, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.stroke();
            targetCtx.fillStyle = '#d4a843';
            targetCtx.beginPath();
            targetCtx.arc(cx, cy, totalSize/6, 0, Math.PI * 2);
            targetCtx.fill();
            break;

        case 'character':
            targetCtx.beginPath();
            targetCtx.arc(cx, cy, totalSize/3, 0, Math.PI * 2);
            targetCtx.fill();
            targetCtx.strokeStyle = '#8cb85c';
            targetCtx.lineWidth = 4;
            targetCtx.stroke();
            break;
    }

    targetCtx.restore();
}

// ===== КЛИКИ ПО ХОЛСТУ =====
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
        'Действие:\n1 - Копировать\n2 - Удалить\n3 - Сохранить карту\n4 - Изменить цвет'
    );

    if (action === '1') {
        selectedElement = { ...cell.prop };
        currentColor = cell.prop.color;
        currentSize = cell.prop.size || 1;
        document.getElementById('propColor').value = currentColor;
        document.getElementById('propSize').value = currentSize;
        updateCurrentPropBox();
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

    const modalColor = document.getElementById('modalColor');
    const modalSize = document.getElementById('modalSize');
    modalColor.value = currentColor;
    modalSize.value = currentSize;

    modalColor.oninput = (e) => {
        currentColor = e.target.value;
        document.getElementById('propColor').value = currentColor;
    };
    modalSize.onchange = (e) => {
        currentSize = parseInt(e.target.value);
        document.getElementById('propSize').value = currentSize;
    };

    const allProps = [...BASE_PROPS, ...customProps];

    allProps.forEach(el => {
        const div = document.createElement('div');
        div.className = 'element-item';
        if (selectedElement && selectedElement.id === el.id) {
            div.classList.add('selected');
        }

        const preview = document.createElement('canvas');
        preview.width = 60;
        preview.height = 60;
        const pctx = preview.getContext('2d');

        drawProp(pctx, {
            type: el.type,
            image: el.image,
            color: currentColor,
            size: 1
        }, 0, 0, 60);

        div.appendChild(preview);
        div.title = el.name;

        div.onclick = () => {
            document.querySelectorAll('.element-item').forEach(i => i.classList.remove('selected'));
            div.classList.add('selected');
            selectedElement = { ...el };
            updateCurrentPropBox();
            closeElements();
        };

        grid.appendChild(div);
    });
}

// ===== ИМПОРТ ИЗ ФАЙЛА =====
function importPropFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const newProp = {
                id: 'custom_' + Date.now(),
                name: file.name.replace(/\.[^.]+$/, ''),
                type: 'image',
                image: event.target.result
            };
            customProps.push(newProp);
            renderElements();
            alert(`Проп "${newProp.name}" добавлен!`);
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// ===== СОХРАНЕНИЕ / ЗАГРУЗКА =====
function saveMap() {
    const name = prompt('Название карты:', 'Карта ' + new Date().toLocaleDateString());
    if (!name) return;

    const map = {
        id: Storage.generateId(),
        name,
        ...mapData,
        customProps,
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
    customProps = map.customProps || [];

    document.getElementById('mapWidth').value = mapData.width;
    document.getElementById('mapHeight').value = mapData.height;
    document.getElementById('step-setup').classList.remove('hidden');
    document.getElementById('step-editor').classList.add('hidden');

    alert('Карта загружена! Нажмите "ГОТОВО".');
}
