// ===== ХРАНИЛИЩЕ =====
const Storage = {
    // Сохранения боёв
    getSaves() {
        try {
            return JSON.parse(localStorage.getItem('pvp_saves') || '[]');
        } catch (e) { return []; }
    },
    
    saveGame(save) {
        const saves = this.getSaves();
        const idx = saves.findIndex(s => s.id === save.id);
        if (idx >= 0) saves[idx] = save;
        else saves.push(save);
        localStorage.setItem('pvp_saves', JSON.stringify(saves));
    },
    
    deleteSave(id) {
        const saves = this.getSaves().filter(s => s.id !== id);
        localStorage.setItem('pvp_saves', JSON.stringify(saves));
    },
    
    // Карты
    getMaps() {
        try {
            return JSON.parse(localStorage.getItem('pvp_maps') || '[]');
        } catch (e) { return []; }
    },
    
    saveMap(map) {
        const maps = this.getMaps();
        const idx = maps.findIndex(m => m.id === map.id);
        if (idx >= 0) maps[idx] = map;
        else maps.push(map);
        localStorage.setItem('pvp_maps', JSON.stringify(maps));
    },
    
    // Пользователь
    getUser() {
        try {
            return JSON.parse(localStorage.getItem('pvp_user') || 'null');
        } catch (e) { return null; }
    },
    
    setUser(user) {
        localStorage.setItem('pvp_user', JSON.stringify(user));
    },
    
    // Утилиты
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },
    
    generateCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            if (i === 4) code += '-';
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }
};
