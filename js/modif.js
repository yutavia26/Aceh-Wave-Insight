// 1. Amankan Viewport HP biar gak bisa di-zoom acak-acakan
let viewport = document.querySelector("meta[name=viewport]");
if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = "viewport";
    document.head.appendChild(viewport);
}
viewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

// 2. CSS Nuklir: Hancurkan total layout grid bawaan dan set ulang khusus HP
const styleNuklir = document.createElement('style');
styleNuklir.innerHTML = `
@media (max-width: 768px) {
    /* Reset total body & dashboard */
    body, html, .dashboard {
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        display: block !important; /* Matikan grid bawaan */
        position: relative !important;
    }

    /* PAKSA PETA MEMENUHI 100% LAYAR HP (Latar Paling Belakang) */
    .map-wrapper {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 1 !important;
        margin: 0 !important;
        padding: 0 !important;
    }
    
    #map {
        width: 100% !important;
        height: 100% !important;
        position: absolute !important;
    }

    /* UBAH PANEL KIRI JADI DRAWER (TERSEMBUNYI TOTAL) */
    .side-panel-left {
        position: fixed !important;
        top: 0 !important;
        left: -100% !important; /* Sembunyi total di luar kiri */
        width: 85vw !important;  /* Selebar layar HP tapi sisain dikit */
        max-width: 320px !important;
        height: 100vh !important;
        z-index: 9999 !important; /* Di atas peta & kontrol apapun */
        background: #1e1e1e !important;
        box-shadow: 5px 0 25px rgba(0,0,0,0.8) !important;
        transition: left 0.3s ease-in-out !important;
        display: flex !important;
        flex-direction: column !important;
        box-sizing: border-box !important;
    }

    /* Ketika panel kiri aktif */
    .side-panel-left.active {
        left: 0 !important;
    }

    /* TATA ULANG TOMBOL KONTROL DI KANAN AGAR TIDAK MAKAN TEMPAT */
    .control-stack-right {
        position: absolute !important;
        top: 10px !important;
        right: 10px !important;
        z-index: 5000 !important; /* Di bawah panel kiri aktif, tapi di atas peta */
        display: flex !important;
        flex-direction: column !important;
        gap: 6px !important;
        width: auto !important;
    }

    .control-stack-right button {
        width: 42px !important;  /* Ubah jadi tombol ikon/bulat kecil di HP */
        height: 42px !important;
        padding: 0 !important;
        border-radius: 50% !important; /* Buat jadi bulat biar estetik */
        font-size: 16px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        box-shadow: 0 3px 10px rgba(0,0,0,0.4) !important;
    }

    /* Paksa tombol Data muncul di HP */
    .control-stack-right .toggle-left-btn {
        display: flex !important;
    }

    /* JINAKKAN PANEL RUTE LEAFLET BIAR GA SOK MEMENUHI LAYAR */
    .leaflet-routing-container {
        position: fixed !important;
        bottom: 10px !important;   /* Pindahin ke bawah */
        top: auto !important;
        left: 50% !important;
        transform: translateX(-50%) !important; /* Tengahkan di layar HP */
        width: 90vw !important;
        max-width: 340px !important;
        max-height: 160px !important; /* Batasi tingginya biar ga maruk space */
        z-index: 4000 !important;
        background: white !important;
        border-radius: 12px !important;
        box-shadow: 0 -4px 20px rgba(0,0,0,0.4) !important;
        overflow-y: auto !important;
    }

    /* Singkirkan info rute custom kalau malah numpuk */
    .route-info {
        position: fixed !important;
        bottom: 180px !important; /* Taruh persis di atas container rute Leaflet */
        left: 50% !important;
        transform: translateX(-50%) !important;
        width: auto !important;
        max-width: 80% !important;
        z-index: 4100 !important;
        background: rgba(0,0,0,0.85) !important;
        backdrop-filter: blur(5px);
    }

    /* LEGENDA LEAFLET: Kecilkan maksimal di pojok kiri bawah */
    .legend {
        position: fixed !important;
        bottom: 10px !important;
        left: 10px !important;
        max-width: 120px !important;
        font-size: 9px !important;
        padding: 6px !important;
        z-index: 3000 !important;
        opacity: 0.9 !important;
        display: none !important; /* Sembunyikan default di HP biar bersih, atau aktifkan jika butuh */
    }
    
    /* Sembunyikan kontrol zoom bawaan leaflet (+ -) biar ga padat */
    .leaflet-control-zoom {
        display: none !important;
    }
}
`;
document.head.appendChild(styleNuklir);

// 3. Modifikasi Struktur DOM setelah elemen siap
document.addEventListener("DOMContentLoaded", () => {
    const sidePanelLeft = document.querySelector('.side-panel-left');
    const controlStack = document.querySelector('.control-stack-right');

    // Buat Header Close di Panel Kiri jika belum ada
    if (sidePanelLeft && !document.querySelector('.mobile-only-header')) {
        const headerMobile = document.createElement('div');
        headerMobile.className = "mobile-only-header";
        headerMobile.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px;";
        headerMobile.innerHTML = `
            <h3 style="margin:0; font-size:16px; color:#ff6f00; font-weight:bold;">📊 Menu & Data</h3>
            <button onclick="toggleDataPanel()" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer; padding:0 5px;">✖</button>
        `;
        sidePanelLeft.insertBefore(headerMobile, sidePanelLeft.firstChild);
    }

    // Buat tombol pemicu data di stack kanan (Ubah teks jadi ikon saja biar muat di tombol bulat)
    if (controlStack && !document.querySelector('.toggle-left-btn')) {
        const btnData = document.createElement('button');
        btnData.className = "toggle-left-btn";
        btnData.innerHTML = "📊"; // Pakai emot aja biar gak kepanjangan di tombol bulat
        btnData.setAttribute("title", "Buka Data");
        btnData.style.cssText = "display: none; background: #222; border: 1px solid #444; color: white;";
        btnData.onclick = toggleDataPanel;
        
        // Ubah teks tombol lain di HP biar jadi simpel/ikon aja biar pas di lingkaran
        const menuBtn = controlStack.querySelector('.menu-btn'); if(menuBtn) menuBtn.innerHTML = "🗺️";
        const locBtn = controlStack.querySelector('.loc-btn'); if(locBtn) locBtn.innerHTML = "📍";
        const homeBtn = controlStack.querySelector('.home-btn'); if(homeBtn) homeBtn.innerHTML = "🔄";
        const cancelBtn = controlStack.querySelector('.cancel-btn'); if(cancelBtn) cancelBtn.innerHTML = "❌";

        controlStack.insertBefore(btnData, controlStack.firstChild);
    }

    // Auto-close panel kiri kalau user ngeklik posko atau marker peta
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.posko-item') || e.target.closest('.leaflet-marker-icon')) {
            if (window.innerWidth <= 768 && sidePanelLeft) {
                sidePanelLeft.classList.remove('active');
            }
        }
    });
});

// 4. Fungsi Global Toggle Panel Kiri
window.toggleDataPanel = function() {
    const panel = document.querySelector('.side-panel-left');
    if (panel) {
        panel.classList.toggle('active');
    }
};
