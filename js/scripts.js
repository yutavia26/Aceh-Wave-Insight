/*!
* Start Bootstrap - Grayscale v7.0.6 (https://startbootstrap.com/theme/grayscale)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-grayscale/blob/master/LICENSE)
*/
//
// Scripts
// 

// 1. FUNGSI SAKTI PENYELAMAT LAYAR HP (Dijalankan langsung agar CSS inline masuk sebelum render)
function paksaResponsiveMobile() {
    if (window.innerWidth > 768) return; // Hanya jalan di layar HP (< 768px)

    const dashboard = document.querySelector('.dashboard');
    const sidePanelLeft = document.querySelector('.side-panel-left');
    const mapWrapper = document.querySelector('.map-wrapper');
    const mapEl = document.getElementById('map');
    const controlStack = document.querySelector('.control-stack-right');

    // Paksa reset layout grid bawaan menjadi tumpukan absolute
    if (dashboard) {
        dashboard.style.cssText = "display: block !important; position: relative !important; width: 100vw !important; height: 100vh !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; grid-template-columns: none !important;";
    }

    // Paksa wrapper peta memenuhi layar penuh di latar belakang
    if (mapWrapper) {
        mapWrapper.style.cssText = "position: absolute !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 1 !important; margin: 0 !important; padding: 0 !important;";
    }

    if (mapEl) {
        mapEl.style.cssText = "width: 100% !important; height: 100% !important; position: absolute !important; top: 0 !important; left: 0 !important;";
    }

    // Sembunyikan panel kiri bawaan keluar layar (Sistem Drawer / Slide-out)
    if (sidePanelLeft) {
        if (!sidePanelLeft.classList.contains('active')) {
            sidePanelLeft.style.cssText = "position: fixed !important; top: 0 !important; left: -100% !important; width: 290px !important; height: 100vh !important; z-index: 9999 !important; background: #1e1e1e !important; box-shadow: 5px 0 25px rgba(0,0,0,0.8) !important; transition: left 0.3s ease-in-out !important; display: flex !important; flex-direction: column !important; box-sizing: border-box !important;";
        } else {
            sidePanelLeft.style.cssText = "position: fixed !important; top: 0 !important; left: 0px !important; width: 290px !important; height: 100vh !important; z-index: 9999 !important; background: #1e1e1e !important; box-shadow: 5px 0 25px rgba(0,0,0,0.8) !important; transition: left 0.3s ease-in-out !important; display: flex !important; flex-direction: column !important; box-sizing: border-box !important;";
        }
    }

    // Kecilkan tombol kontrol kanan menjadi lingkaran minimalis agar peta lega
    if (controlStack) {
        controlStack.style.cssText = "position: absolute !important; top: 10px !important; right: 10px !important; z-index: 5000 !important; display: flex !important; flex-direction: column !important; gap: 6px !important; width: auto !important;";
        
        const buttons = controlStack.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.style.cssText = "width: 44px !important; height: 44px !important; padding: 0 !important; border-radius: 50% !important; font-size: 16px !important; display: flex !important; align-items: center !important; justify-content: center !important; box-shadow: 0 3px 10px rgba(0,0,0,0.4) !important; background: #ff6f00; color: white; border: none; font-weight: bold;";
        });

        const cancelBtn = controlStack.querySelector('.cancel-btn');
        if (cancelBtn) cancelBtn.style.backgroundColor = "#c62828";
    }

    // Jinakkan kotak rute Leaflet bawaan agar melayang rapi di bawah tengah layar HP
    const routeContainer = document.querySelector('.leaflet-routing-container');
    if (routeContainer) {
        routeContainer.style.cssText = "position: fixed !important; bottom: 10px !important; top: auto !important; left: 50% !important; transform: translateX(-50%) !important; width: 90vw !important; max-width: 340px !important; max-height: 140px !important; z-index: 4000 !important; background: white !important; border-radius: 12px !important; box-shadow: 0 -4px 20px rgba(0,0,0,0.4) !important; overflow-y: auto !important; color: black !important; padding: 10px !important;";
    }

    // Sembunyikan tombol zoom bawaan (+ -) leaflet agar tidak menumpuk
    const zoomControl = document.querySelector('.leaflet-control-zoom');
    if (zoomControl) zoomControl.style.setProperty('display', 'none', 'important');
}

// Jalankan fungsi reset layout langsung saat file dibaca browser
paksaResponsiveMobile();
window.addEventListener('resize', paksaResponsiveMobile);

// Fungsi global untuk tombol buka/tutup menu data kiri
window.toggleDataPanel = function() {
    const panel = document.querySelector('.side-panel-left');
    if (panel) {
        panel.classList.toggle('active');
        paksaResponsiveMobile();
    }
};


// 2. LOGIC BAWAAN BOOTSTRAP & MANIPULASI ELEMENT MAPS
window.addEventListener('DOMContentLoaded', event => {

    // --- Script Asli Navigasi Template Bootstrap Grayscale ---
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) return;
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }
    };
    navbarShrink();
    document.addEventListener('scroll', navbarShrink);

    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(document.querySelectorAll('#navbarResponsive .nav-link'));
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
    // --- Akhir Script Asli Template Bootstrap ---


    // --- MODIFIKASI STRUKTUR TOMBOL UNTUK HP ---
    const sidePanelLeft = document.querySelector('.side-panel-left');
    const controlStack = document.querySelector('.control-stack-right');

    // Sisipkan Meta Viewport tambahan jika belum ada demi keamanan responsivitas layar HP
    let viewport = document.querySelector("meta[name=viewport]");
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = "viewport";
        document.head.appendChild(viewport);
    }
    viewport.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";

    // Sisipkan tombol close (✖) di bagian atas panel kiri HP
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

    // Buat tombol "📊 Data" bulat untuk kontrol kanan khusus mode HP
    if (controlStack && !document.querySelector('.toggle-left-btn')) {
        const btnData = document.createElement('button');
        btnData.className = "toggle-left-btn";
        btnData.innerHTML = "📊";
        btnData.onclick = toggleDataPanel;
        controlStack.insertBefore(btnData, controlStack.firstChild);

        // Singkat tulisan teks tombol bawaanmu menjadi emoji ikonik agar pas di tombol bulat HP
        const menuBtn = controlStack.querySelector('.menu-btn'); if(menuBtn) menuBtn.innerHTML = "🗺️";
        const locBtn = controlStack.querySelector('.loc-btn'); if(locBtn) locBtn.innerHTML = "📍";
        const homeBtn = controlStack.querySelector('.home-btn'); if(homeBtn) homeBtn.innerHTML = "🔄";
        const cancelBtn = controlStack.querySelector('.cancel-btn'); if(cancelBtn) cancelBtn.innerHTML = "❌";
    }

    // Eksekusi paksa penataan responsive
    paksaResponsiveMobile();

    // Gunakan observer untuk mengawasi rute Leaflet jika telat dirender agar tetap rapi ke posisi bawah HP
    const observer = new MutationObserver(() => { paksaResponsiveMobile(); });
    observer.observe(document.body, { childList: true, subtree: true });
});

// Auto-close menu kiri kalau user ngeklik list posko evakuasi atau marker di peta
document.body.addEventListener('click', (e) => {
    if (e.target.closest('.posko-item') || e.target.closest('.leaflet-marker-icon')) {
        const panel = document.querySelector('.side-panel-left');
        if (window.innerWidth <= 768 && panel) {
            panel.classList.remove('active');
            paksaResponsiveMobile();
        }
    }
});
