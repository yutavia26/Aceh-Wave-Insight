// 1. Perbaiki Meta Viewport langsung saat script dibaca (Anti-zoom & pas layar)
let viewport = document.querySelector("meta[name=viewport]");
if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = "viewport";
    document.head.appendChild(viewport);
}
viewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

// 2. Inject CSS paling galak (Paling atas di Head) biar layout gak hancur duluan
const mobileStyle = document.createElement('style');
mobileStyle.innerHTML = `
@media (max-width: 768px) {
    /* 1. Paksa Grid hancur dan ganti jadi 1 kolom penuh peta */
    .dashboard {
        grid-template-columns: 1fr !important;
        display: block !important;
        position: relative !important;
        height: 100vh !important;
        width: 100vw !important;
    }

    /* 2. Sembunyikan panel data kiri keluar layar (Ubah jadi drawer otomatis) */
    .side-panel-left {
        position: fixed !important;
        top: 0 !important;
        left: -100% !important; /* Benar-benar keluar layar */
        width: 290px !important;
        height: 100vh !important;
        z-index: 9999 !important; /* Naikkan z-index biar di atas peta Leaflet */
        box-shadow: 5px 0 15px rgba(0,0,0,0.6) !important;
        box-sizing: border-box !important;
        transition: all 0.3s ease-in-out !important;
        display: flex !important;
    }

    /* Saat panel kiri dibuka di HP */
    .side-panel-left.active {
        left: 0 !important;
    }

    /* 3. Amankan wrapper peta agar memenuhi sisa layar HP */
    .map-wrapper, #map {
        width: 100% !important;
        height: 100vh !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        z-index: 1 !important;
    }

    /* 4. Tampilkan tombol pemicu data di stack kanan */
    .control-stack-right {
        z-index: 2500 !important;
    }
    .control-stack-right .toggle-left-btn {
        display: block !important;
    }

    /* 5. Turunkan dan rapikan container rute Leaflet bawaan agar tidak numpuk */
    .leaflet-routing-container {
        width: 240px !important;
        max-height: 200px !important;
        top: 235px !important; /* Digeser ke bawah tombol */
        right: 15px !important;
    }

    /* 6. Perkecil info rute buatanmu di kiri bawah */
    .route-info {
        bottom: 15px !important;
        left: 15px !important;
        right: auto !important;
        min-width: 160px !important;
        font-size: 11px !important;
        padding: 8px !important;
        z-index: 2400 !important;
    }

    /* 7. Perkecil legenda Leaflet biar ga makan tempat */
    .legend {
        max-width: 140px !important;
        font-size: 10px !important;
        padding: 6px !important;
        line-height: 16px !important;
    }
    .legend h4 { font-size: 11px !important; }
}
`;
document.head.appendChild(mobileStyle);

// 3. Modifikasi struktur HTML (DOM) setelah dokumen siap
document.addEventListener("DOMContentLoaded", () => {
    const sidePanelLeft = document.querySelector('.side-panel-left');
    const controlStack = document.querySelector('.control-stack-right');

    // Cek apakah header mobile sudah ada, biar ga duplikat kalau script kepanggil ulang
    if (sidePanelLeft && !document.querySelector('.mobile-only-header')) {
        const headerMobile = document.createElement('div');
        headerMobile.className = "mobile-only-header";
        headerMobile.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 8px;";
        headerMobile.innerHTML = `
            <h3 style="margin:0; font-size:16px; color:#ff6f00; font-weight:bold;">📊 Menu & Data</h3>
            <button onclick="toggleDataPanel()" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer; padding: 0 5px;">✖</button>
        `;
        sidePanelLeft.insertBefore(headerMobile, sidePanelLeft.firstChild);
    }

    if (controlStack && !document.querySelector('.toggle-left-btn')) {
        const btnData = document.createElement('button');
        btnData.className = "toggle-left-btn";
        btnData.innerHTML = "📊 Data";
        btnData.style.cssText = "display: none; background: #222; border: 1px solid #444; color: white; padding: 10px 12px; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); text-align: center;";
        btnData.onclick = toggleDataPanel;
        controlStack.insertBefore(btnData, controlStack.firstChild);
    }

    // Buat listener otomatis: Kalau item posko diklik di HP, panel langsung nutup otomatis
    document.body.addEventListener('click', (e) => {
        if (e.target.closest('.posko-item') || e.target.closest('.leaflet-marker-icon')) {
            if (window.innerWidth <= 768 && sidePanelLeft) {
                sidePanelLeft.classList.remove('active');
            }
        }
    });
});

// 4. Fungsi global buka/tutup panel data kiri
window.toggleDataPanel = function() {
    const panel = document.querySelector('.side-panel-left');
    if (panel) {
        panel.classList.toggle('active');
    }
};