// FloatChat Interactive Prototype
// Global state management
const appState = {
    currentMode: 'researcher',
    currentTab: 'globe',
    argoFloats: [],
    chatHistory: [],
    isOverlayOpen: false,
    isFilterDrawerOpen: false,
    isExportModalOpen: false,
    selectedFloats: [],
    currentView: 'satellite',
    zoomLevel: 1,
    filters: {
        region: 'all',
        country: 'all',
        year: 'all',
        parameters: 'all',
        quality: 'all'
    }
};

// Enhanced Mock ARGO float data with quality indicators
const mockArgoData = [
    { id: '2900123', lat: 15.5, lon: 75.2, year: 2023, region: 'Indian Ocean', country: 'India', quality: 'high', lastUpdate: '2023-12-15', parameters: ['temperature', 'salinity', 'pressure'] },
    { id: '2900124', lat: 12.8, lon: 80.2, year: 2023, region: 'Indian Ocean', country: 'India', quality: 'high', lastUpdate: '2023-12-14', parameters: ['temperature', 'salinity'] },
    { id: '2900125', lat: 19.0, lon: 72.8, year: 2023, region: 'Indian Ocean', country: 'India', quality: 'medium', lastUpdate: '2023-12-10', parameters: ['temperature', 'pressure'] },
    { id: '2900126', lat: 8.5, lon: 76.9, year: 2023, region: 'Indian Ocean', country: 'India', quality: 'high', lastUpdate: '2023-12-12', parameters: ['temperature', 'salinity', 'pressure', 'oxygen'] },
    { id: '2900127', lat: 22.3, lon: 69.7, year: 2023, region: 'Indian Ocean', country: 'India', quality: 'medium', lastUpdate: '2023-12-08', parameters: ['temperature', 'salinity'] },
    { id: '2900128', lat: 18.9, lon: 72.8, year: 2022, region: 'Indian Ocean', country: 'India', quality: 'low', lastUpdate: '2023-11-20', parameters: ['temperature'] },
    { id: '2900129', lat: 13.0, lon: 80.2, year: 2022, region: 'Indian Ocean', country: 'India', quality: 'medium', lastUpdate: '2023-12-05', parameters: ['temperature', 'salinity', 'pressure'] },
    { id: '2900130', lat: 16.7, lon: 74.2, year: 2022, region: 'Indian Ocean', country: 'India', quality: 'high', lastUpdate: '2023-12-13', parameters: ['temperature', 'salinity', 'pressure', 'oxygen'] },
    { id: '2900131', lat: 20.5, lon: 70.0, year: 2021, region: 'Indian Ocean', country: 'India', quality: 'low', lastUpdate: '2023-10-15', parameters: ['temperature', 'pressure'] },
    { id: '2900132', lat: 11.0, lon: 75.8, year: 2021, region: 'Indian Ocean', country: 'India', quality: 'medium', lastUpdate: '2023-12-01', parameters: ['temperature', 'salinity'] },
    { id: '2900133', lat: 25.0, lon: 66.0, year: 2023, region: 'Arabian Sea', country: 'Pakistan', quality: 'high', lastUpdate: '2023-12-14', parameters: ['temperature', 'salinity', 'pressure'] },
    { id: '2900134', lat: 6.0, lon: 80.0, year: 2023, region: 'Indian Ocean', country: 'Sri Lanka', quality: 'high', lastUpdate: '2023-12-16', parameters: ['temperature', 'salinity', 'pressure', 'oxygen'] },
    { id: '2900135', lat: 35.0, lon: 139.0, year: 2023, region: 'Pacific Ocean', country: 'Japan', quality: 'high', lastUpdate: '2023-12-15', parameters: ['temperature', 'salinity', 'pressure'] },
    { id: '2900136', lat: 25.0, lon: -80.0, year: 2023, region: 'Atlantic Ocean', country: 'USA', quality: 'medium', lastUpdate: '2023-12-10', parameters: ['temperature', 'salinity'] },
    { id: '2900137', lat: 40.0, lon: -74.0, year: 2023, region: 'Atlantic Ocean', country: 'USA', quality: 'high', lastUpdate: '2023-12-12', parameters: ['temperature', 'salinity', 'pressure', 'oxygen'] }
];

// Mode-specific prompts
const modePrompts = {
    explorer: [
        {
            title: "What's the temperature near Chennai?",
            description: "Explore surface temperatures in the Bay of Bengal"
        },
        {
            title: "Show me ARGO floats in India",
            description: "Discover all Indian Ocean monitoring stations"
        },
        {
            title: "How deep do floats go?",
            description: "Learn about ocean depth measurements"
        },
        {
            title: "What's happening in the Arabian Sea?",
            description: "Check recent ocean conditions"
        }
    ],
    navigator: [
        {
            title: "Best fishing conditions near Mumbai",
            description: "Get oceanographic data for fishing"
        },
        {
            title: "Sea surface temperature trends",
            description: "Monitor temperature changes over time"
        },
        {
            title: "Salinity levels in Bay of Bengal",
            description: "Check water salinity for navigation"
        },
        {
            title: "Ocean currents near Kerala coast",
            description: "Understand local current patterns"
        }
    ],
    researcher: [
        {
            title: "Analyze temperature anomalies in Indian Ocean",
            description: "Scientific analysis of temperature variations"
        },
        {
            title: "Compare salinity profiles across regions",
            description: "Cross-regional salinity comparison study"
        },
        {
            title: "Mixed layer depth calculations",
            description: "Advanced oceanographic parameter analysis"
        },
        {
            title: "Export ARGO data for research",
            description: "Download datasets for scientific research"
        }
    ]
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    generateArgoFloats();
    updateModePrompts();
    setupAnimations();
});

function initializeApp() {
    // Set initial mode
    document.body.setAttribute('data-mode', appState.currentMode);
    
    // Initialize tooltip
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

function setupEventListeners() {
    // Mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            switchMode(mode);
        });
    });

    // Tab switching
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });

    // Filter drawer
    document.getElementById('hamburgerMenu').addEventListener('click', toggleFilterDrawer);
    document.getElementById('closeDrawer').addEventListener('click', closeFilterDrawer);
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    // Click outside to close filter drawer
    document.addEventListener('click', function(e) {
        const backdrop = document.getElementById('filterBackdrop');
        
        if (appState.isFilterDrawerOpen && e.target === backdrop) {
            closeFilterDrawer();
        }
    });

    // Globe controls - Leaflet integration
    document.getElementById('satelliteView').addEventListener('click', () => {
        if (window.leafletGlobe) {
            window.leafletGlobe.setGlobeView('satellite');
        }
        setGlobeView('satellite');
    });
    document.getElementById('terrainView').addEventListener('click', () => {
        if (window.leafletGlobe) {
            window.leafletGlobe.setGlobeView('terrain');
        }
        setGlobeView('terrain');
    });
    document.getElementById('politicalView').addEventListener('click', () => {
        if (window.leafletGlobe) {
            window.leafletGlobe.setGlobeView('political');
        }
        setGlobeView('political');
    });
    document.getElementById('nightView').addEventListener('click', () => {
        if (window.leafletGlobe) {
            window.leafletGlobe.setGlobeView('night');
        }
        setGlobeView('night');
    });
    document.getElementById('zoomIn').addEventListener('click', () => {
        if (window.leafletGlobe) {
            window.leafletGlobe.zoomIn();
        }
        zoomIn();
    });
    document.getElementById('zoomOut').addEventListener('click', () => {
        if (window.leafletGlobe) {
            window.leafletGlobe.zoomOut();
        }
        zoomOut();
    });
    document.getElementById('resetView').addEventListener('click', () => {
        if (window.leafletGlobe) {
            window.leafletGlobe.resetView();
        }
        resetView();
    });

    // Sidebar actions
    document.getElementById('newChatBtn').addEventListener('click', startNewChat);
    document.getElementById('historyBtn').addEventListener('click', showHistory);
    document.getElementById('exportBtn').addEventListener('click', openExportModal);
    document.getElementById('alertsBtn').addEventListener('click', showAlerts);
    
    // Export functionality
    document.getElementById('closeExportModal').addEventListener('click', closeExportModal);
    document.getElementById('cancelExport').addEventListener('click', closeExportModal);
    document.getElementById('confirmExport').addEventListener('click', confirmExport);

    // Chat input handling
    const chatInput = document.getElementById('chatInput');
    const chatbotInput = document.getElementById('chatbotInput');
    const overlayInput = document.getElementById('overlayInput');

    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            openChatOverlay();
            addOverlayMessage(this.value);
            this.value = '';
        }
    });

    chatbotInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            addChatbotMessage(this.value);
            this.value = '';
        }
    });

    overlayInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            addOverlayMessage(this.value);
            this.value = '';
        }
    });

    // Send buttons
    document.querySelector('.send-btn').addEventListener('click', function() {
        const input = document.getElementById('chatbotInput');
        if (input.value.trim()) {
            addChatbotMessage(input.value);
            input.value = '';
        }
    });

    document.querySelector('.overlay-send').addEventListener('click', function() {
        const input = document.getElementById('overlayInput');
        if (input.value.trim()) {
            addOverlayMessage(input.value);
            input.value = '';
        }
    });

    // Close overlay
    document.querySelector('.close-overlay').addEventListener('click', function() {
        closeChatOverlay();
    });

    // Filter changes
    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', function() {
            filterArgoFloats();
        });
    });

    // Language selector
    document.getElementById('languageSelect').addEventListener('change', function() {
        // Language switching functionality would go here
        console.log('Language changed to:', this.value);
    });
}

function switchMode(mode) {
    appState.currentMode = mode;
    
    // Update UI
    document.body.setAttribute('data-mode', mode);
    
    // Update active mode button
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // Update prompts
    updateModePrompts();
    
    // Animate mode change
    anime({
        targets: '.content-area',
        opacity: [1, 0.7, 1],
        duration: 600,
        easing: 'easeInOutQuad'
    });
}

function switchTab(tab) {
    appState.currentTab = tab;
    
    // Update active tab
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Show/hide tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    // Animate tab transition
    anime({
        targets: `.tab-content`,
        translateX: [0, -20, 0],
        opacity: [1, 0, 1],
        duration: 400,
        easing: 'easeInOutQuad'
    });
}

function generateArgoFloats() {
    const globe = document.getElementById('globe');
    const globeRect = globe.getBoundingClientRect();
    const centerX = globeRect.width / 2;
    const centerY = globeRect.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    appState.argoFloats = mockArgoData.map(float => {
        // Convert lat/lon to globe coordinates
        const x = centerX + (float.lon / 180) * radius * 0.8;
        const y = centerY - (float.lat / 90) * radius * 0.8;
        
        const dot = document.createElement('div');
        dot.className = `argo-dot ${float.quality}-quality`;
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        dot.dataset.floatId = float.id;
        dot.dataset.lat = float.lat;
        dot.dataset.lon = float.lon;
        dot.dataset.year = float.year;
        dot.dataset.region = float.region;
        dot.dataset.country = float.country;
        dot.dataset.quality = float.quality;
        dot.dataset.lastUpdate = float.lastUpdate;
        dot.dataset.parameters = float.parameters.join(',');
        
        // Set quality-based styling
        if (float.quality === 'high') {
            dot.style.background = '#10b981';
            dot.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.6)';
        } else if (float.quality === 'medium') {
            dot.style.background = '#f59e0b';
            dot.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.6)';
        } else {
            dot.style.background = '#ef4444';
            dot.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.6)';
        }
        
        // Add event listeners
        dot.addEventListener('mouseenter', showTooltip);
        dot.addEventListener('mouseleave', hideTooltip);
        dot.addEventListener('click', selectArgoFloat);
        
        globe.appendChild(dot);
        
        return {
            element: dot,
            data: float,
            x: x,
            y: y
        };
    });
    
    // Animate dots appearing
    anime({
        targets: '.argo-dot',
        scale: [0, 1],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutElastic(1, .8)'
    });
}

function showTooltip(e) {
    const dot = e.target;
    const tooltip = document.getElementById('tooltip');
    const title = document.getElementById('tooltipTitle');
    const info = document.getElementById('tooltipInfo');
    
    title.textContent = `ARGO Float ${dot.dataset.floatId}`;
    info.textContent = `${dot.dataset.region} • ${dot.dataset.year}`;
    
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY - 10}px`;
    tooltip.classList.add('show');
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('show');
}

function selectArgoFloat(e) {
    const dot = e.target;
    
    // Animate selection
    anime({
        targets: dot,
        scale: [1, 1.5, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Show detailed info (mock)
    const region = dot.dataset.region;
    const year = dot.dataset.year;
    
    // Add to chat overlay
    openChatOverlay();
    addOverlayMessage(`Show me data for ARGO float ${dot.dataset.floatId} in ${region} from ${year}`);
}

function filterArgoFloats() {
    const regionFilter = document.getElementById('regionFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const paramFilter = document.getElementById('paramFilter').value;
    
    appState.argoFloats.forEach(float => {
        let show = true;
        
        if (regionFilter !== 'all' && float.data.region !== regionFilter) {
            show = false;
        }
        if (countryFilter !== 'all' && float.data.country !== countryFilter) {
            show = false;
        }
        if (yearFilter !== 'all' && float.data.year.toString() !== yearFilter) {
            show = false;
        }
        
        if (show) {
            float.element.style.display = 'block';
            anime({
                targets: float.element,
                scale: [0, 1],
                opacity: [0, 1],
                duration: 400,
                easing: 'easeOutQuad'
            });
        } else {
            anime({
                targets: float.element,
                scale: 0,
                opacity: 0,
                duration: 200,
                easing: 'easeInQuad',
                complete: () => {
                    float.element.style.display = 'none';
                }
            });
        }
    });
}

function updateModePrompts() {
    const promptGrid = document.getElementById('promptGrid');
    const prompts = modePrompts[appState.currentMode];
    
    promptGrid.innerHTML = '';
    
    prompts.forEach(prompt => {
        const card = document.createElement('div');
        card.className = 'prompt-card';
        card.innerHTML = `
            <h4>${prompt.title}</h4>
            <p>${prompt.description}</p>
        `;
        
        card.addEventListener('click', function() {
            addChatbotMessage(prompt.title);
        });
        
        promptGrid.appendChild(card);
    });
    
    // Animate prompts
    anime({
        targets: '.prompt-card',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(100),
        duration: 500,
        easing: 'easeOutQuad'
    });
}

function openChatOverlay() {
    if (appState.isOverlayOpen) return;
    
    appState.isOverlayOpen = true;
    const overlay = document.getElementById('chatOverlay');
    overlay.classList.add('active');
    
    // Animate overlay opening
    anime({
        targets: overlay,
        height: '60vh',
        duration: 500,
        easing: 'easeOutQuad'
    });
}

function closeChatOverlay() {
    if (!appState.isOverlayOpen) return;
    
    appState.isOverlayOpen = false;
    const overlay = document.getElementById('chatOverlay');
    
    // Animate overlay closing
    anime({
        targets: overlay,
        height: 0,
        duration: 300,
        easing: 'easeInQuad',
        complete: () => {
            overlay.classList.remove('active');
        }
    });
}

function addOverlayMessage(message) {
    const overlayMessages = document.getElementById('overlayMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    overlayMessages.appendChild(messageDiv);
    overlayMessages.scrollTop = overlayMessages.scrollHeight;
    
    // Animate message
    anime({
        targets: messageDiv,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Simulate AI response
    setTimeout(() => {
        addOverlayResponse(message);
    }, 1000);
}

function addOverlayResponse(userMessage) {
    const overlayMessages = document.getElementById('overlayMessages');
    const responseDiv = document.createElement('div');
    responseDiv.className = 'message bot-message';
    
    // Generate mock response based on message
    const response = generateMockResponse(userMessage);
    
    responseDiv.innerHTML = `
        <div class="message-content">
            <p>${response}</p>
        </div>
        <div class="message-actions">
            <button class="action-btn" title="Copy">
                <i class="fas fa-copy"></i>
            </button>
            <button class="action-btn" title="Export">
                <i class="fas fa-download"></i>
            </button>
            <button class="action-btn" title="Audio">
                <i class="fas fa-volume-up"></i>
            </button>
        </div>
    `;
    
    overlayMessages.appendChild(responseDiv);
    overlayMessages.scrollTop = overlayMessages.scrollHeight;
    
    // Animate response
    anime({
        targets: responseDiv,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function addChatbotMessage(message) {
    const conversationArea = document.getElementById('conversationArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    
    conversationArea.appendChild(messageDiv);
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    // Animate message
    anime({
        targets: messageDiv,
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Simulate AI response
    setTimeout(() => {
        addChatbotResponse(message);
    }, 1500);
}

function addChatbotResponse(userMessage) {
    const conversationArea = document.getElementById('conversationArea');
    const responseDiv = document.createElement('div');
    responseDiv.className = 'message bot-message';
    
    // Generate mock response
    const response = generateMockResponse(userMessage);
    
    responseDiv.innerHTML = `
        <div class="message-content">
            <p>${response}</p>
        </div>
        <div class="message-actions">
            <button class="action-btn" title="Copy">
                <i class="fas fa-copy"></i>
            </button>
            <button class="action-btn" title="Export">
                <i class="fas fa-download"></i>
            </button>
            <button class="action-btn" title="Audio">
                <i class="fas fa-volume-up"></i>
            </button>
        </div>
    `;
    
    conversationArea.appendChild(responseDiv);
    conversationArea.scrollTop = conversationArea.scrollHeight;
    
    // Animate response with typing effect
    const messageText = responseDiv.querySelector('p');
    messageText.textContent = '';
    
    anime({
        targets: messageText,
        innerHTML: [0, response.length],
        duration: response.length * 20,
        easing: 'linear',
        update: function(anim) {
            messageText.textContent = response.substring(0, Math.floor(anim.progress * response.length / 100));
        }
    });
}

function generateMockResponse(userMessage) {
    const responses = {
        'temperature': 'Based on recent ARGO float data, surface temperatures in the Indian Ocean average 28.5°C, with seasonal variations of ±2°C. The Bay of Bengal shows higher temperatures (29-30°C) compared to the Arabian Sea (27-28°C).',
        'salinity': 'Salinity levels in the Indian Ocean range from 34.5-35.5 PSU. The Arabian Sea shows higher salinity (35.2 PSU) due to evaporation, while the Bay of Bengal has lower salinity (34.8 PSU) due to freshwater input from rivers.',
        'argo': 'ARGO floats are autonomous oceanographic instruments that drift with ocean currents and collect temperature, salinity, and pressure data from the surface to 2000m depth. India operates over 50 ARGO floats in the Indian Ocean.',
        'default': 'I can help you explore ocean data from ARGO floats. You can ask about temperature, salinity, ocean currents, or specific regions. Try asking about conditions near your location or a specific ocean parameter.'
    };
    
    const message = userMessage.toLowerCase();
    
    if (message.includes('temperature') || message.includes('temp')) {
        return responses.temperature;
    } else if (message.includes('salinity') || message.includes('salt')) {
        return responses.salinity;
    } else if (message.includes('argo') || message.includes('float')) {
        return responses.argo;
    } else {
        return responses.default;
    }
}

function setupAnimations() {
    // Initial page load animation
    anime({
        targets: '.sidebar',
        translateX: [-300, 0],
        duration: 800,
        easing: 'easeOutQuad'
    });
    
    anime({
        targets: '.content-area',
        translateX: [300, 0],
        duration: 800,
        easing: 'easeOutQuad',
        delay: 200
    });
    
    // Continuous globe rotation
    anime({
        targets: '.globe',
        rotate: 360,
        duration: 60000,
        easing: 'linear',
        loop: true
    });
    
    // Floating animation for ARGO dots
    setInterval(() => {
        anime({
            targets: '.argo-dot',
            translateY: [0, -5, 0],
            duration: 3000,
            easing: 'easeInOutSine',
            delay: anime.stagger(200)
        });
    }, 5000);
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// New Enhanced Functions

function toggleFilterDrawer() {
    const hamburger = document.getElementById('hamburgerMenu');
    const drawer = document.getElementById('filterDrawer');
    
    if (appState.isFilterDrawerOpen) {
        closeFilterDrawer();
    } else {
        openFilterDrawer();
    }
}

function openFilterDrawer() {
    const hamburger = document.getElementById('hamburgerMenu');
    const drawer = document.getElementById('filterDrawer');
    const backdrop = document.getElementById('filterBackdrop');
    
    appState.isFilterDrawerOpen = true;
    hamburger.classList.add('active');
    drawer.classList.add('active');
    backdrop.classList.add('active');
    
    // Animate popup opening
    anime({
        targets: drawer,
        scale: [0.8, 1],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    anime({
        targets: backdrop,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function closeFilterDrawer() {
    const hamburger = document.getElementById('hamburgerMenu');
    const drawer = document.getElementById('filterDrawer');
    const backdrop = document.getElementById('filterBackdrop');
    
    appState.isFilterDrawerOpen = false;
    hamburger.classList.remove('active');
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
}

function applyFilters() {
    const regionFilter = document.getElementById('regionFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const yearFilter = document.getElementById('yearFilter').value;
    const paramFilter = document.getElementById('paramFilter').value;
    const qualityFilter = document.getElementById('qualityFilter').value;
    
    appState.filters = {
        region: regionFilter,
        country: countryFilter,
        year: yearFilter,
        parameters: paramFilter,
        quality: qualityFilter
    };
    
    // Apply filters to Three.js globe
    if (window.leafletGlobe) {
        window.leafletGlobe.filterArgoFloats(appState.filters);
    }
    
    filterArgoFloats();
    closeFilterDrawer();
    
    // Show loading state
    showLoadingState();
    setTimeout(() => {
        hideLoadingState();
    }, 1000);
}

function clearFilters() {
    document.getElementById('regionFilter').value = 'all';
    document.getElementById('countryFilter').value = 'all';
    document.getElementById('yearFilter').value = 'all';
    document.getElementById('paramFilter').value = 'all';
    document.getElementById('qualityFilter').value = 'all';
    
    appState.filters = {
        region: 'all',
        country: 'all',
        year: 'all',
        parameters: 'all',
        quality: 'all'
    };
    
    // Clear filters in Three.js globe
    if (window.leafletGlobe) {
        window.leafletGlobe.filterArgoFloats(appState.filters);
    }
    
    filterArgoFloats();
}


function setGlobeView(view) {
    appState.currentView = view;
    const globe = document.getElementById('globe');
    
    // Update active button
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${view}View`).classList.add('active');
    
    // Change globe appearance based on view
    switch(view) {
        case 'satellite':
            globe.style.background = 'radial-gradient(circle at 30% 30%, #1e40af, #1e3a8a, #1e293b)';
            break;
        case 'terrain':
            globe.style.background = 'radial-gradient(circle at 30% 30%, #059669, #047857, #065f46)';
            break;
        case 'political':
            globe.style.background = 'radial-gradient(circle at 30% 30%, #7c3aed, #6d28d9, #5b21b6)';
            break;
        case 'night':
            globe.style.background = 'radial-gradient(circle at 30% 30%, #1f2937, #111827, #0f172a)';
            break;
    }
    
    // Animate view change
    anime({
        targets: globe,
        scale: [1, 1.05, 1],
        duration: 600,
        easing: 'easeInOutQuad'
    });
}

function zoomIn() {
    if (appState.zoomLevel < 3) {
        appState.zoomLevel += 0.2;
        updateGlobeZoom();
    }
}

function zoomOut() {
    if (appState.zoomLevel > 0.5) {
        appState.zoomLevel -= 0.2;
        updateGlobeZoom();
    }
}

function resetView() {
    appState.zoomLevel = 1;
    appState.currentView = 'satellite';
    updateGlobeZoom();
    setGlobeView('satellite');
}

function updateGlobeZoom() {
    const globe = document.getElementById('globe');
    anime({
        targets: globe,
        scale: appState.zoomLevel,
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function startNewChat() {
    // Clear chat history and start fresh
    appState.chatHistory = [];
    const conversationArea = document.getElementById('conversationArea');
    conversationArea.innerHTML = `
        <div class="message bot-message">
            <div class="message-content">
                <p>Hello! I'm your AI assistant for ocean data exploration. What would you like to know about ARGO float data?</p>
            </div>
            <div class="message-actions">
                <button class="action-btn" title="Copy">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn" title="Export">
                    <i class="fas fa-download"></i>
                </button>
                <button class="action-btn" title="Audio">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
        </div>
    `;
    
    showNotification('New chat session started', 'info');
}

function showHistory() {
    showNotification('Chat history feature coming soon!', 'info');
}

function showAlerts() {
    showNotification('No new alerts', 'info');
}

function openExportModal() {
    const modal = document.getElementById('exportModal');
    appState.isExportModalOpen = true;
    modal.classList.add('active');
    
    // Animate modal opening
    anime({
        targets: modal,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
}

function closeExportModal() {
    const modal = document.getElementById('exportModal');
    appState.isExportModalOpen = false;
    modal.classList.remove('active');
}

function confirmExport() {
    const format = document.querySelector('input[name="format"]:checked').value;
    const dataRange = document.getElementById('dataRange').value;
    const fileName = document.getElementById('fileName').value;
    
    // Simulate export process
    showLoadingState();
    
    setTimeout(() => {
        hideLoadingState();
        closeExportModal();
        
        // Show success message
        showNotification(`Data exported successfully as ${fileName}.${format}`, 'success');
    }, 2000);
}


function showLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.add('active');
}

function hideLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.classList.remove('active');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    anime({
        targets: notification,
        translateY: [-50, 0],
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
    });
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        anime({
            targets: notification,
            translateY: [0, -50],
            opacity: [1, 0],
            duration: 300,
            easing: 'easeInQuad',
            complete: () => {
                notification.remove();
            }
        });
    }, 3000);
}

// Export functions for global access
window.FloatChat = {
    switchMode,
    switchTab,
    openChatOverlay,
    closeChatOverlay,
    generateArgoFloats,
    filterArgoFloats,
    toggleFilterDrawer,
    openExportModal,
    setGlobeView,
    zoomIn,
    zoomOut,
    resetView
};
