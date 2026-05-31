// PAK MAP - Professional Edition (Fixed)
// Uses OpenStreetMap Nominatim API for real-time search

let map;
let currentLayer = 'hybrid'; 
let searchTimeout;
let userMarker;
let watchId;

// Pakistan Bounds
const PAK_BOUNDS = [
    [23.5, 60.5], 
    [37.5, 78.0]  
];

function initMap() {
    // Safety check for map container
    if (!document.getElementById('map')) {
        console.error("Map container not found!");
        return;
    }

    map = L.map('map', {
        center: [30.3753, 69.3451],
        zoom: 6,
        minZoom: 5,
        maxZoom: 19,
        zoomControl: false,
        attributionControl: false
    });

    // Layers
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri'
    });

    const osmOverlay = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        opacity: 0.8,
        attribution: '© OpenStreetMap'
    });

    const standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    });

    map.layers = { satellite, osmOverlay, standard };

    // Start Hybrid
    satellite.addTo(map);
    osmOverlay.addTo(map);

    // Bounds
    map.setMaxBounds(PAK_BOUNDS);
    map.on('drag', () => {
        if (!map.getBounds().intersects(PAK_BOUNDS)) {
            map.panInsideBounds(PAK_BOUNDS, { animate: false });
        }
    });

    // Event Listeners
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
    
    // Try GPS
    locateUser();

    console.log('PAK MAP initialized successfully!');
}

// --- SEARCH ---

function handleSearchInput(e) {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    const resultsDiv = document.getElementById('search-results');

    if (!resultsDiv) return;

    if (query.length < 3) {
        resultsDiv.classList.remove('show');
        return;
    }

    searchTimeout = setTimeout(() => {
        performRealTimeSearch(query);
    }, 500);
}

async function performRealTimeSearch(query) {
    const loader = document.getElementById('loader');
    const loaderText = document.getElementById('loader-text');
    
    if (loader) loader.style.display = 'block';
    if (loaderText) loaderText.innerText = 'Searching Pakistan...';

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pk&limit=10&addressdetails=1`;
        
        const response = await fetch(url, {
            headers: { 'Accept-Language': 'en-US,en;q=0.9' }
        });
        const data = await response.json();

        displayResults(data);
    } catch (error) {
        console.error("Search failed:", error);
        const resultsDiv = document.getElementById('search-results');
        if (resultsDiv) {
            resultsDiv.innerHTML = '<div class="result-item">Search failed. Check connection.</div>';
            resultsDiv.classList.add('show');
        }
    } finally {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
    }
}

function displayResults(results) {
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv) return;

    resultsDiv.innerHTML = '';

    if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="result-item">No results found in Pakistan</div>';
        resultsDiv.classList.add('show');
        return;
    }

    results.forEach(place => {
        const item = document.createElement('div');
        item.className = 'result-item';
        
        let icon = 'location_on';
        if (place.type === 'house' || place.type === 'residential') icon = 'home';
        if (place.type === 'shop' || place.amenity === 'marketplace') icon = 'shopping_bag';
        if (place.amenity === 'restaurant' || place.cuisine) icon = 'restaurant';
        if (place.amenity === 'school' || place.amenity === 'university') icon = 'school';
        if (place.amenity === 'hospital' || place.amenity === 'clinic') icon = 'local_hospital';
        if (place.highway) icon = 'directions_car';

        let displayName = place.name;
        if (place.address) {
            const parts = [];
            if (place.address.village) parts.push(place.address.village);
            if (place.address.town) parts.push(place.address.town);
            if (place.address.city) parts.push(place.address.city);
            if (place.address.state) parts.push(place.address.state);
            
            if (parts.length > 0) {
                displayName += `<br><small>${parts.join(', ')}</small>`;
            }
        }

        item.innerHTML = `
            <div class="result-icon"><span class="material-icons-round">${icon}</span></div>
            <div class="result-info">
                <h4>${place.name}</h4>
                <p>${displayName}</p>
            </div>
        `;

        item.onclick = () => {
            goToLocation(place.lat, place.lon, place.name);
            resultsDiv.classList.remove('show');
            const input = document.getElementById('search-input');
            if (input) input.value = '';
        };

        resultsDiv.appendChild(item);
    });

    resultsDiv.classList.add('show');
}

function searchCategory(category) {
    const input = document.getElementById('search-input');
    if (input) {
        input.value = category;
        performRealTimeSearch(`${category} near me`);
    }
}

// --- NAVIGATION ---

function goToLocation(lat, lon, name) {
    if (!map) return;
    
    map.flyTo([lat, lon], 16, {
        duration: 1.5,
        easeLinearity: 0.25
    });

    if (window.currentMarker) map.removeLayer(window.currentMarker);
    
    window.currentMarker = L.marker([lat, lon]).addTo(map)
        .bindPopup(`<b>${name}</b><br><button onclick="navigateTo(${lat}, ${lon})" style="margin-top:5px; padding:5px 10px; background:#007AFF; color:white; border:none; border-radius:4px; cursor:pointer;">Navigate Here</button>`)
        .openPopup();
}

function navigateTo(lat, lon) {
    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isiOS) {
        window.open(`http://maps.apple.com/?daddr=${lat},${lon}`);
    } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`);
    }
}

function locateUser() {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            if (latitude < 23 || latitude > 37 || longitude < 60 || longitude > 78) {
                // Outside Pakistan bounds, don't move map
                return;
            }

            if (userMarker) map.removeLayer(userMarker);
            
            userMarker = L.circleMarker([latitude, longitude], {
                radius: 8,
                fillColor: "#007AFF",
                color: "#fff",
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map).bindPopup("You are here").openPopup();

            map.flyTo([latitude, longitude], 15);
        },
        () => {
            // Silent fail for GPS
        },
        { enableHighAccuracy: true }
    );
}

function toggleLayers() {
    if (!map || !map.layers) return;
    
    const { satellite, osmOverlay, standard } = map.layers;
    
    if (currentLayer === 'hybrid') {
        map.removeLayer(satellite);
        map.removeLayer(osmOverlay);
        standard.addTo(map);
        currentLayer = 'map';
    } else {
        map.removeLayer(standard);
        satellite.addTo(map);
        osmOverlay.addTo(map);
        currentLayer = 'hybrid';
    }
}

function resetRotation() {
    if (!map) return;
    map.setRotation(0);
    map.flyTo(map.getCenter(), map.getZoom());
}

function toggleLanguage() {
    const input = document.getElementById('search-input');
    if (!input) return;

    if (input.placeholder.includes('Search')) {
        input.placeholder = 'پاکستان تلاش کریں (گاؤں، دکان، شہر)...';
    } else {
        input.placeholder = 'Search Pakistan (Villages, Shops, Cities)...';
    }
}

function toggleVoiceSearch() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Voice search not supported on this device.");
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-PK';
    recognition.start();
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.getElementById('search-input');
        if (input) {
            input.value = transcript;
            performRealTimeSearch(transcript);
        }
    };
}

// Close search on map click
if (typeof map !== 'undefined') {
    map.on('click', () => {
        const resultsDiv = document.getElementById('search-results');
        if (resultsDiv) resultsDiv.classList.remove('show');
    });
}

document.addEventListener('DOMContentLoaded', initMap);
