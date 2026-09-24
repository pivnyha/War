// ===== SVG СИЛУЭТЫ ОРУЖИЯ (в стиле Tarkov) =====
const WEAPON_SVGS = {
    empty: `
        <line class="empty-marker" x1="10" y1="20" x2="90" y2="20" />
        <line class="empty-marker" x1="10" y1="25" x2="90" y2="25" />
        <line class="empty-marker" x1="10" y1="30" x2="90" y2="30" />
    `,

    pistol: `
        <rect class="gun-body" x="20" y="10" width="60" height="12" />
        <rect class="gun-body" x="20" y="22" width="14" height="18" />
        <rect class="gun-detail" x="22" y="22" width="6" height="14" />
        <rect class="gun-body" x="30" y="22" width="6" height="14" />
    `,

    smg: `
        <rect class="gun-body" x="15" y="8" width="70" height="14" />
        <rect class="gun-body" x="20" y="22" width="12" height="18" />
        <rect class="gun-body" x="40" y="22" width="10" height="18" />
        <rect class="gun-body" x="70" y="22" width="14" height="14" />
    `,

    shotgun: `
        <rect class="gun-body" x="10" y="10" width="80" height="12" />
        <rect class="gun-detail" x="15" y="12" width="60" height="3" />
        <rect class="gun-body" x="25" y="22" width="14" height="16" />
        <rect class="gun-body" x="60" y="22" width="18" height="14" />
    `,

    bolt: `
        <rect class="gun-body" x="10" y="12" width="85" height="10" />
        <rect class="gun-body" x="10" y="22" width="60" height="6" />
        <rect class="gun-body" x="30" y="28" width="12" height="12" />
        <rect class="gun-detail" x="60" y="10" width="4" height="8" />
    `,

    semi: `
        <rect class="gun-body" x="8" y="10" width="84" height="12" />
        <rect class="gun-body" x="20" y="22" width="12" height="16" />
        <rect class="gun-body" x="45" y="22" width="10" height="18" />
        <rect class="gun-body" x="70" y="22" width="16" height="14" />
    `,

    auto: `
        <rect class="gun-body" x="5" y="10" width="90" height="12" />
        <rect class="gun-detail" x="30" y="8" width="10" height="4" />
        <rect class="gun-body" x="15" y="22" width="12" height="16" />
        <rect class="gun-body" x="40" y="22" width="10" height="18" />
        <rect class="gun-body" x="65" y="22" width="14" height="14" />
        <rect class="gun-body" x="85" y="22" width="10" height="14" />
    `,

    mg: `
        <rect class="gun-body" x="5" y="8" width="90" height="16" />
        <rect class="gun-body" x="15" y="24" width="14" height="18" />
        <rect class="gun-body" x="40" y="24" width="14" height="18" />
        <rect class="gun-body" x="65" y="24" width="20" height="14" />
        <rect class="gun-detail" x="25" y="6" width="16" height="4" />
    `,

    melee: `
        <rect class="gun-body" x="35" y="6" width="6" height="30" />
        <rect class="gun-body" x="45" y="14" width="30" height="6" />
        <rect class="gun-detail" x="20" y="14" width="20" height="6" />
    `
};

// Получить SVG для оружия
function getWeaponSVG(weaponId) {
    if (!weaponId || !WEAPON_SVGS[weaponId]) {
        return WEAPON_SVGS.empty;
    }
    return WEAPON_SVGS[weaponId];
}
