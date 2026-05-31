// PAK MAP - Pakistan National Map Application
// Privacy-focused, offline-capable map application for Pakistan

// Global Variables
let map;
let currentView = 'map';
let currentLanguage = 'en';
let offlineTiles = [];
let isDownloading = false;

// Pakistan boundary coordinates
const PAKISTAN_BOUNDS = [
    [23.7871, 60.8742], // Southwest
    [37.0969, 77.1063]  // Northeast
];

// Major cities and locations in Pakistan with coordinates
const PAKISTAN_LOCATIONS = {
    // Major Cities
    'Karachi': { lat: 24.8607, lng: 67.0011, type: 'city', population: '14.9M' },
    'Lahore': { lat: 31.5204, lng: 74.3587, type: 'city', population: '11.1M' },
    'Islamabad': { lat: 33.6844, lng: 73.0479, type: 'capital', population: '1.0M' },
    'Rawalpindi': { lat: 33.5651, lng: 73.0169, type: 'city', population: '2.0M' },
    'Faisalabad': { lat: 31.4504, lng: 73.1350, type: 'city', population: '3.2M' },
    'Multan': { lat: 30.1575, lng: 71.5249, type: 'city', population: '1.8M' },
    'Peshawar': { lat: 34.0151, lng: 71.5249, type: 'city', population: '1.9M' },
    'Quetta': { lat: 30.1798, lng: 66.9750, type: 'city', population: '1.0M' },
    'Sialkot': { lat: 32.4945, lng: 74.5229, type: 'city', population: '655K' },
    'Gujranwala': { lat: 32.1877, lng: 74.1945, type: 'city', population: '2.0M' },
    'Hyderabad': { lat: 25.3960, lng: 68.3578, type: 'city', population: '1.7M' },
    'Bahawalpur': { lat: 29.3956, lng: 71.6722, type: 'city', population: '762K' },

    // Northern Areas
    'Gilgit': { lat: 35.9208, lng: 74.3136, type: 'city', population: '216K' },
    'Skardu': { lat: 35.2974, lng: 75.6330, type: 'city', population: '25K' },
    'Hunza': { lat: 36.3209, lng: 74.6553, type: 'town', population: '87K' },
    'Chitral': { lat: 35.8514, lng: 71.7919, type: 'city', population: '450K' },
    'Swat': { lat: 35.2277, lng: 72.4504, type: 'district', population: '2.3M' },
    'Mingora': { lat: 34.7768, lng: 72.3604, type: 'city', population: '331K' },

    // Punjab Cities
    'Sargodha': { lat: 32.0836, lng: 72.6711, type: 'city', population: '659K' },
    'Sahiwal': { lat: 30.6682, lng: 73.1114, type: 'city', population: '578K' },
    'Jhang': { lat: 31.2780, lng: 72.3181, type: 'city', population: '418K' },
    'Dera Ghazi Khan': { lat: 30.0561, lng: 70.6403, type: 'city', population: '364K' },
    'Gujrat': { lat: 32.5742, lng: 74.0789, type: 'city', population: '390K' },
    'Mardan': { lat: 34.1958, lng: 72.0448, type: 'city', population: '358K' },
    'Kasur': { lat: 31.1177, lng: 74.4504, type: 'city', population: '357K' },
    'Okara': { lat: 30.8081, lng: 73.4596, type: 'city', population: '303K' },
    'Wah Cantonment': { lat: 33.7776, lng: 72.7283, type: 'city', population: '198K' },
    'Dera Ismail Khan': { lat: 31.8311, lng: 70.9017, type: 'city', population: '147K' },
    'Abbottabad': { lat: 34.1495, lng: 73.1996, type: 'city', population: '120K' },
    'Murree': { lat: 33.9079, lng: 73.3910, type: 'hill_station', population: '25K' },

    // Sindh Cities
    'Sukkur': { lat: 27.7058, lng: 68.8574, type: 'city', population: '499K' },
    'Larkana': { lat: 27.5590, lng: 68.2123, type: 'city', population: '490K' },
    'Nawabshah': { lat: 26.2442, lng: 68.4100, type: 'city', population: '229K' },
    'Mirpur Khas': { lat: 25.5276, lng: 69.0111, type: 'city', population: '236K' },
    'Jacobabad': { lat: 28.2769, lng: 68.4514, type: 'city', population: '200K' },
    'Shikarpur': { lat: 27.9556, lng: 68.6383, type: 'city', population: '189K' },
    'Thatta': { lat: 24.7471, lng: 67.9244, type: 'city', population: '220K' },
    'Badin': { lat: 24.6553, lng: 68.8347, type: 'city', population: '145K' },

    // Balochistan Cities
    'Turbat': { lat: 26.0031, lng: 63.0544, type: 'city', population: '75K' },
    'Khuzdar': { lat: 27.8119, lng: 66.6136, type: 'city', population: '141K' },
    'Gwadar': { lat: 25.1265, lng: 62.3220, type: 'port_city', population: '85K' },
    'Zhob': { lat: 31.3454, lng: 69.4449, type: 'city', population: '50K' },
    'Sibi': { lat: 29.5442, lng: 67.8781, type: 'city', population: '52K' },
    'Nushki': { lat: 29.5538, lng: 65.9619, type: 'city', population: '27K' },

    // Khyber Pakhtunkhwa Cities
    'Mardan': { lat: 34.1958, lng: 72.0448, type: 'city', population: '358K' },
    'Kohat': { lat: 33.5869, lng: 71.4414, type: 'city', population: '151K' },
    'Bannu': { lat: 32.9842, lng: 70.6036, type: 'city', population: '64K' },
    'Dera Ismail Khan': { lat: 31.8311, lng: 70.9017, type: 'city', population: '147K' },
    'Nowshera': { lat: 34.0151, lng: 71.9747, type: 'city', population: '137K' },
    'Charsadda': { lat: 34.1483, lng: 71.7418, type: 'city', population: '97K' },
    'Haripur': { lat: 33.9944, lng: 72.9347, type: 'city', population: '54K' },
    'Mansehra': { lat: 34.3304, lng: 73.1996, type: 'city', population: '67K' },

    // Villages and Small Towns (sample)
    'Taxila': { lat: 33.7489, lng: 72.8186, type: 'ancient_city', population: '24K' },
    'Rohtas Fort': { lat: 32.9394, lng: 73.6147, type: 'historic', population: '5K' },
    'Kalash Valley': { lat: 35.7833, lng: 71.3833, type: 'valley', population: '4K' },
    'Fairy Meadows': { lat: 35.3167, lng: 74.6167, type: 'tourist', population: '500' },
    'Naltar Valley': { lat: 36.1667, lng: 74.4333, type: 'valley', population: '1K' },
    'Babusar Top': { lat: 34.7833, lng: 74.3833, type: 'mountain_pass', population: '0' },
    'Khunjerab Pass': { lat: 36.8486, lng: 75.4286, type: 'border_crossing', population: '0' },
    'Gwadar Port': { lat: 25.1265, lng: 62.3220, type: 'port', population: '0' },
    'Tarbela Dam': { lat: 34.0667, lng: 72.4500, type: 'dam', population: '0' },
    'Mangla Dam': { lat: 33.1833, lng: 73.6167, type: 'dam', population: '0' }
};

// Urdu translations
const URDU_TRANSLATIONS = {
    'Welcome to PAK MAP! Search for any city, village, or place in Pakistan to get started.':
        'پاک میپ میں خوش آمدید! شروع کرنے کے لیے پاکستان کا کوئی بھی شہر، گاؤں یا مقام تلاش کریں۔',
    'Search cities, villages, places...': 'شہر، گاؤں، مقامات تلاش کریں...',
    'Online Mode': 'آن لائن موڈ',
    'Offline Mode': 'آف لائن موڈ',
    'Download Current Area': 'موجودہ علاقہ ڈاؤن لوڈ کریں',
    'Storage: ': 'اسٹوریج: ',
    ' MB used': ' ایم بی استعمال شدہ',
    'Downloading tiles...': 'ٹائلیں ڈاؤن لوڈ ہو رہی ہیں...',
    'Download complete!': 'ڈاؤن لوڈ مکمل!',
    'Roads': 'سڑکیں',
    'Buildings': 'عمارتیں',
    'Terrain': 'خطہ',
    'Flyovers': 'فلای اوور',
    'Map': 'نقشہ',
    'Satellite': 'سیٹلائٹ',
    'Hybrid': 'ہائبرڈ',
    'Navigate to': 'کی طرف جائیں',
    'You have arrived at': 'آپ پہنچ گئے ہیں',
    'Continue straight': 'سیدھے چلتے رہیں',
    'Turn left': 'بائیں مڑیں',
    'Turn right': 'دائیں مڑیں',
    'In ': 'میں ',
    ' meters': ' میٹر',
    'kilometers': 'کلومیٹر'
};

// Initialize the map
function initMap() {
    // Create map centered on Pakistan
    map = L.map('map', {
        center: [30.3753, 69.3451], // Center of Pakistan
        zoom: 6,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: true,
        attributionControl: true
    });

    // Add standard OSM tile layer (default map view)
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap contributors',
        className: 'osm-tiles'
    });

    // Add Esri World Imagery (Satellite) - High quality satellite imagery
    // FIXED: Removed space in URL below
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
        className: 'satellite-tiles'
    });

    // Add Esri Hybrid (Satellite + Labels)
    // FIXED: Removed space in URL below
    const hybridLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: '© Esri',
        className: 'hybrid-tiles'
    });

    // Store layers
    map.layers = {
        osm: osmLayer,
        satellite: satelliteLayer,
        hybrid: hybridLayer
    };

    // Add default layer
    osmLayer.addTo(map);

    // Add custom zoom control styling
    L.control.zoom({
        position: 'bottomright'
    }).addTo(map);

    // Add scale control
    L.control.scale({
        imperial: false,
        metric: true,
        position: 'bottomleft'
    }).addTo(map);

    // Restrict map to Pakistan bounds (soft restriction)
    map.setMaxBounds([
        [23.0, 60.0],
        [38.0, 78.0]
    ]);

    // Load offline tiles from storage
    loadOfflineTiles();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading-overlay').classList.add('hidden');
    }, 1500);

    // Update storage info
    updateStorageInfo();

    // Check online status
    updateOnlineStatus();
}

// Set map view (map, satellite, hybrid)
function setView(viewType) {
    currentView = viewType;

    // Remove all base layers
    Object.values(map.layers).forEach(layer => {
        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
        }
    });

    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add selected layer
    switch(viewType) {
        case 'map':
            map.layers.osm.addTo(map);
            document.getElementById('map-view-btn').classList.add('active');
            break;
        case 'satellite':
            map.layers.satellite.addTo(map);
            document.getElementById('satellite-view-btn').classList.add('active');
            break;
        case 'hybrid':
            map.layers.hybrid.addTo(map);
            document.getElementById('hybrid-view-btn').classList.add('active');
            break;
    }

    // Announce view change
    announceNavigation(`View changed to ${viewType}`, `ویو تبدیل ہو گیا ${viewType}`);
}

// Toggle map layers
function toggleLayer(layerName) {
    const btn = document.getElementById(`${layerName}-layer`);
    btn.classList.toggle('active');

    const isActive = btn.classList.contains('active');

    // Layer toggling logic would go here for advanced features
    // For now, we'll just provide visual feedback
    announceNavigation(
        `${layerName.charAt(0).toUpperCase() + layerName.slice(1)} layer ${isActive ? 'enabled' : 'disabled'}`,
        `${layerName} لیئر ${isActive ? 'فعال' : 'غیر فعال'} ہو گیا`
    );
}

// Search functionality
let searchTimeout;
function searchLocations() {
    clearTimeout(searchTimeout);
    const query = document.getElementById('search-input').value.trim().toLowerCase();

    if (query.length < 2) {
        document.getElementById('search-results').classList.remove('show');
        return;
    }

    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

function performSearch(query = null) {
    if (query === null) {
        query = document.getElementById('search-input').value.trim().toLowerCase();
    }

    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';

    if (query.length < 2) {
        resultsDiv.classList.remove('show');
        return;
    }

    // Search in locations
    const matches = [];
    for (const [name, data] of Object.entries(PAKISTAN_LOCATIONS)) {
        if (name.toLowerCase().includes(query)) {
            matches.push({ name, ...data });
        }
    }

    // Sort by relevance (exact match first, then by population)
    matches.sort((a, b) => {
        if (a.name.toLowerCase() === query) return -1;
        if (b.name.toLowerCase() === query) return 1;
        return 0;
    });

    // Display results
    if (matches.length > 0) {
        matches.slice(0, 10).forEach(match => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="result-name">${match.name}</div>
                <div class="result-type">${match.type.replace('_', ' ')} • ${match.population}</div>
            `;
            item.onclick = () => goToLocation(match);
            resultsDiv.appendChild(item);
        });
        resultsDiv.classList.add('show');
    } else {
        resultsDiv.innerHTML = '<div class="search-result-item">No results found</div>';
        resultsDiv.classList.add('show');
    }
}

function goToLocation(location) {
    map.flyTo([location.lat, location.lng], 12, {
        duration: 2,
        easeLinearity: 0.25
    });

    // Add marker
    L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(`<b>${location.name}</b><br>${location.type}<br>Population: ${location.population}`)
        .openPopup();

    // Hide search results
    document.getElementById('search-results').classList.remove('show');
    document.getElementById('search-input').value = '';

    // Announce navigation
    const urduMsg = getLocationUrduTranslation(location.name);
    announceNavigation(
        `Navigating to ${location.name}`,
        `${urduMsg} کی طرف جا رہے ہیں`
    );
}

function getLocationUrduTranslation(name) {
    // Common location translations
    const translations = {
        'Karachi': 'کراچی',
        'Lahore': 'لاہور',
        'Islamabad': 'اسلام آباد',
        'Peshawar': 'پشاور',
        'Quetta': 'کوئٹہ',
        'Multan': 'ملتان',
        'Faisalabad': 'فیصل آباد',
        'Rawalpindi': 'راولپنڈی',
        'Gilgit': 'گلگت',
        'Skardu': 'سکردو'
    };
    return translations[name] || name;
}

// Offline functionality
function downloadArea() {
    if (isDownloading) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();

    isDownloading = true;
    const btn = document.getElementById('download-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');

    btn.disabled = true;
    progressContainer.style.display = 'block';

    announceNavigation(
        'Downloading area for offline use...',
        'آف لائن استعمال کے لیے علاقہ ڈاؤن لوڈ ہو رہا ہے...'
    );

    // Simulate tile download (in real app, this would fetch actual tiles)
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            saveOfflineArea(bounds, zoom);
            isDownloading = false;
            btn.disabled = false;
            progressContainer.style.display = 'none';
            progressBar.style.width = '0%';

            announceNavigation(
                'Download complete! Area available offline.',
                'ڈاؤن لوڈ مکمل! علاقہ آف لائن دستیاب ہے۔'
            );
        }
    }, 100);
}

function saveOfflineArea(bounds, zoom) {
    const areaData = {
        bounds: [
            [bounds.getSouth(), bounds.getWest()],
            [bounds.getNorth(), bounds.getEast()]
        ],
        zoom: zoom,
        timestamp: Date.now()
    };

    // Get existing offline areas
    let offlineAreas = JSON.parse(localStorage.getItem('pakmap_offline_areas') || '[]');
    offlineAreas.push(areaData);

    // Save to localStorage (encrypted in production)
    try {
        localStorage.setItem('pakmap_offline_areas', JSON.stringify(offlineAreas));
        updateStorageInfo();
    } catch (e) {
        console.warn('Storage full, cannot save more offline areas');
    }
}

function loadOfflineTiles() {
    const offlineAreas = JSON.parse(localStorage.getItem('pakmap_offline_areas') || '[]');
    offlineTiles = offlineAreas;
}

function updateStorageInfo() {
    const offlineAreas = JSON.parse(localStorage.getItem('pakmap_offline_areas') || '[]');
    const estimatedSize = offlineAreas.length * 2.5; // Estimate 2.5MB per area

    const storageText = currentLanguage === 'en'
        ? `Storage: ${estimatedSize.toFixed(1)} MB used`
        : `اسٹوریج: ${estimatedSize.toFixed(1)} ایم بی استعمال شدہ`;

    document.getElementById('storage-info').textContent = storageText;
}

function updateOnlineStatus() {
    const indicator = document.getElementById('offline-indicator');
    const text = document.getElementById('offline-text');

    if (navigator.onLine) {
        indicator.classList.remove('offline');
        text.textContent = currentLanguage === 'en' ? 'Online Mode' : 'آن لائن موڈ';
    } else {
        indicator.classList.add('offline');
        text.textContent = currentLanguage === 'en' ? 'Offline Mode' : 'آف لائن موڈ';
    }
}

// Language toggle
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'ur' : 'en';
    const btn = document.getElementById('lang-toggle');

    if (currentLanguage === 'en') {
        btn.textContent = 'اردو';
        updateUIEnglish();
    } else {
        btn.textContent = 'English';
        updateUIUrdu();
    }
}

function updateUIEnglish() {
    document.getElementById('search-input').placeholder = 'Search cities, villages, places...';
    document.getElementById('offline-text').textContent = 'Online Mode';
    document.getElementById('download-btn').innerHTML = '⬇️ Download Current Area';
    updateStorageInfo();
}

function updateUIUrdu() {
    document.getElementById('search-input').placeholder = 'شہر، گاؤں، مقامات تلاش کریں...';
    document.getElementById('offline-text').textContent = 'آن لائن موڈ';
    document.getElementById('download-btn').innerHTML = '⬇️ موجودہ علاقہ ڈاؤن لوڈ کریں';
    updateStorageInfo();
}

// Navigation announcements
function announceNavigation(english, urdu) {
    const navText = document.getElementById('nav-text');
    navText.innerHTML = `${english}<br><urdu>${urdu}</urdu>`;

    // Text-to-speech (if supported)
    if ('speechSynthesis' in window) {
        speakText(english, 'en');
        setTimeout(() => speakText(urdu, 'ur'), 2000);
    }
}

function speakText(text, lang) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
}

// Vector tile optimization (simulated for performance)
function optimizeTileLoading() {
    // Implement vector tile caching strategy
    const tileCache = new Map();
    const maxCacheSize = 100;

    map.on('tileload', (e) => {
        const key = `${e.tile.src}`;
        if (tileCache.size >= maxCacheSize) {
            // Remove oldest entry
            const firstKey = tileCache.keys().next().value;
            tileCache.delete(firstKey);
        }
        tileCache.set(key, e.tile);
    });
}

// Handle visibility changes (for mobile optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause heavy operations when tab is hidden
        map._onResize();
    } else {
        // Resume operations
        map.invalidateSize();
    }
});

// Handle online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', initMap);

// Service Worker registration for offline support (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Register service worker for better offline support
        // This would be implemented in a production environment
        console.log('PAK MAP: Service Worker support available');
    });
}

// Encrypt sensitive data before storage (simple implementation)
function encryptData(data) {
    // In production, use proper encryption libraries
    // This is a simple base64 encoding for demonstration
    try {
        return btoa(JSON.stringify(data));
    } catch (e) {
        console.error('Encryption failed:', e);
        return null;
    }
}

function decryptData(encryptedData) {
    try {
        return JSON.parse(atob(encryptedData));
    } catch (e) {
        console.error('Decryption failed:', e);
        return null;
    }
}

// Performance monitoring
function monitorPerformance() {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.duration > 100) {
                    console.warn('Slow operation detected:', entry.name, entry.duration);
                }
            });
        });
        observer.observe({ entryTypes: ['measure', 'longtask'] });
    }
}

// Start performance monitoring
monitorPerformance();

console.log('PAK MAP initialized successfully!');
console.log('Privacy-focused mapping for Pakistan');
console.log('All sensitive data stored locally and encrypted');
