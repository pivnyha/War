<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Редактор карт - PVP PROJECT</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/editor.css">
</head>
<body>
    <div class="container editor-container">
        <header class="editor-header">
            <div class="logo">
                <span class="logo-icon">🗺️</span>
                <span class="logo-text">РЕДАКТОР КАРТ</span>
            </div>
            <div class="editor-actions">
                <button class="btn" onclick="saveMap()">💾 СОХРАНИТЬ</button>
                <button class="btn" onclick="openMap()">📂 ОТКРЫТЬ</button>
                <button class="btn" onclick="showElements()">🧱 ЭЛЕМЕНТЫ</button>
                <button class="btn" onclick="window.location.href='index.html'">◀ МЕНЮ</button>
            </div>
        </header>

        <!-- Шаг 1: Настройка -->
        <div class="screen" id="step-setup">
            <h1>НАСТРОЙКА КАРТЫ</h1>
            <div class="setup-form">
                <div class="form-group">
                    <label>РАЗМЕР КАРТЫ (X × Y)</label>
                    <div class="size-inputs">
                        <input type="number" id="mapWidth" value="20" min="5" max="50">
                        <span>×</span>
                        <input type="number" id="mapHeight" value="15" min="5" max="50">
                    </div>
                </div>
                <div class="form-group">
                    <label>ФОН</label>
                    <div class="bg-options" id="bgOptions">
                        <div class="bg-option active" data-bg="white" style="background:#e8e8e8"></div>
                        <div class="bg-option" data-bg="sand" style="background:#d4c4a0"></div>
                        <div class="bg-option" data-bg="forest" style="background:#3a4a2a"></div>
                        <div class="bg-option" data-bg="concrete" style="background:#8a8a8a"></div>
                        <div class="bg-option" data-bg="asphalt" style="background:#2a2a2a"></div>
                    </div>
                </div>
                <button class="btn primary" onclick="startEditor()">✅ ГОТОВО</button>
            </div>
        </div>

        <!-- Шаг 2: Редактор -->
        <div class="screen hidden" id="step-editor">
            <div class="editor-layout">
                <div class="editor-sidebar">
                    <div class="sidebar-section">
                        <h3>ИНСТРУМЕНТЫ</h3>
                        <button class="tool-btn active" data-tool="place">🧱 Разместить</button>
                        <button class="tool-btn" data-tool="erase">🗑️ Удалить</button>
                    </div>
                    <div class="sidebar-section">
                        <h3>НАСТРОЙКИ ПРОПА</h3>
                        <label class="mini-label">ЦВЕТ</label>
                        <input type="color" id="propColor" value="#ffffff" class="color-input">
                        <label class="mini-label">РАЗМЕР</label>
                        <select id="propSize" class="size-select">
                            <option value="1">1x1</option>
                            <option value="2">2x2</option>
                            <option value="3">3x3</option>
                        </select>
                    </div>
                    <div class="sidebar-section">
                        <h3>ТЕКУЩИЙ ПРОП</h3>
                        <div class="current-prop" id="currentPropBox">
                            <span class="current-prop-name" id="currentPropName">Не выбран</span>
                        </div>
                    </div>
                </div>

                <div class="editor-canvas-wrapper">
                    <canvas id="mapCanvas"></canvas>
                </div>
            </div>
        </div>
    </div>

    <!-- Модальное окно элементов -->
    <div class="modal hidden" id="elementsModal">
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2>ЭЛЕМЕНТЫ</h2>
                <button onclick="closeElements()">✕</button>
            </div>
            <div class="modal-body">
                <div class="elements-toolbar">
                    <label class="mini-label">ЦВЕТ</label>
                    <input type="color" id="modalColor" value="#ffffff" class="color-input">
                    <label class="mini-label">РАЗМЕР</label>
                    <select id="modalSize" class="size-select">
                        <option value="1">1x1</option>
                        <option value="2">2x2</option>
                        <option value="3">3x3</option>
                    </select>
                    <button class="btn" onclick="importPropFile()">📥 ИМПОРТ ИЗ ФАЙЛА</button>
                </div>
                <div class="elements-grid" id="elementsGrid"></div>
            </div>
        </div>
    </div>

    <script src="js/storage.js"></script>
    <script src="js/editor.js"></script>
</body>
</html>
