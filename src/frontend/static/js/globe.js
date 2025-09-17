// Globe visualization and ARGO float management
class GlobeManager {
    constructor() {
        this.globe = null;
        this.argoFloats = [];
        this.connections = [];
        this.isRotating = true;
        this.selectedFloat = null;
        
        this.init();
    }
    
    init() {
        this.setupGlobe();
        this.generateARGOFloats();
        this.renderFloats();
        this.setupInteractions();
        this.startRotation();
    }
    
    setupGlobe() {
        this.globe = document.getElementById('globe');
        if (!this.globe) return;
        
        // Add globe event listeners
        this.globe.addEventListener('click', (e) => {
            if (e.target === this.globe) {
                this.deselectAllFloats();
            }
        });
        
        this.globe.addEventListener('mouseenter', () => {
            this.pauseRotation();
        });
        
        this.globe.addEventListener('mouseleave', () => {
            this.resumeRotation();
        });
    }
    
    generateARGOFloats() {
        this.argoFloats = [];
        const numFloats = 60;
        
        // Generate floats in a more realistic distribution
        for (let i = 0; i < numFloats; i++) {
            const float = this.createARGOFloat(i);
            this.argoFloats.push(float);
        }
    }
    
    createARGOFloat(index) {
        // Create more realistic float positions
        const angle = (Math.PI * 2 * index) / 60 + (Math.random() - 0.5) * 0.5;
        const radius = 200 + Math.random() * 100;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Add some noise to make it look more natural
        const noiseX = (Math.random() - 0.5) * 20;
        const noiseY = (Math.random() - 0.5) * 20;
        
        return {
            id: `290${String(index).padStart(4, '0')}`,
            x: x + noiseX,
            y: y + noiseY,
            temperature: 15 + Math.random() * 20,
            salinity: 33 + Math.random() * 4,
            depth: 300 + Math.random() * 2500,
            year: 2020 + Math.floor(Math.random() * 4),
            region: this.getRandomRegion(),
            country: this.getRandomCountry(),
            status: Math.random() > 0.1 ? 'active' : 'inactive',
            lastProfile: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        };
    }
    
    getRandomRegion() {
        const regions = ['Indian Ocean', 'Pacific Ocean', 'Atlantic Ocean', 'Southern Ocean'];
        return regions[Math.floor(Math.random() * regions.length)];
    }
    
    getRandomCountry() {
        const countries = ['India', 'USA', 'Australia', 'Japan', 'France', 'Germany', 'UK'];
        return countries[Math.floor(Math.random() * countries.length)];
    }
    
    renderFloats() {
        if (!this.globe) return;
        
        // Clear existing floats
        this.globe.querySelectorAll('.argo-dot').forEach(dot => dot.remove());
        
        this.argoFloats.forEach((float, index) => {
            const dot = this.createFloatDot(float, index);
            this.globe.appendChild(dot);
        });
    }
    
    createFloatDot(float, index) {
        const dot = document.createElement('div');
        dot.className = 'argo-dot';
        dot.dataset.floatId = float.id;
        dot.dataset.temperature = float.temperature.toFixed(1);
        dot.dataset.salinity = float.salinity.toFixed(2);
        dot.dataset.depth = float.depth.toFixed(0);
        dot.dataset.year = float.year;
        dot.dataset.region = float.region;
        dot.dataset.country = float.country;
        dot.dataset.status = float.status;
        
        // Position the dot
        const centerX = this.globe.offsetWidth / 2;
        const centerY = this.globe.offsetHeight / 2;
        
        dot.style.left = `${centerX + float.x}px`;
        dot.style.top = `${centerY + float.y}px`;
        
        // Add status-based styling
        if (float.status === 'inactive') {
            dot.style.opacity = '0.5';
            dot.style.background = '#666';
        }
        
        // Add event listeners
        this.setupFloatInteractions(dot, float);
        
        // Staggered animation
        setTimeout(() => {
            dot.style.opacity = '1';
            dot.style.transform = 'scale(1)';
        }, index * 100);
        
        return dot;
    }
    
    setupFloatInteractions(dot, float) {
        // Click handler
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectFloat(float, dot);
        });
        
        // Hover handlers
        dot.addEventListener('mouseenter', () => {
            this.showFloatTooltip(float, dot);
            this.highlightConnections(float);
        });
        
        dot.addEventListener('mouseleave', () => {
            this.hideFloatTooltip();
            this.clearConnections();
        });
        
        // Double click for details
        dot.addEventListener('dblclick', () => {
            this.showFloatDetails(float);
        });
    }
    
    selectFloat(float, dot) {
        // Deselect previous
        this.deselectAllFloats();
        
        // Select new float
        dot.classList.add('selected');
        this.selectedFloat = float;
        
        // Show detailed info
        this.showFloatInfoPanel(float);
        
        // Create connections to nearby floats
        this.createConnections(float);
    }
    
    deselectAllFloats() {
        document.querySelectorAll('.argo-dot').forEach(dot => {
            dot.classList.remove('selected');
        });
        this.selectedFloat = null;
        this.clearConnections();
        this.hideFloatInfoPanel();
    }
    
    showFloatTooltip(float, dot) {
        const tooltip = document.createElement('div');
        tooltip.className = 'float-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <strong>ARGO Float ${float.id}</strong>
                <span class="status ${float.status}">${float.status}</span>
            </div>
            <div class="tooltip-content">
                <div>🌡️ ${float.temperature.toFixed(1)}°C</div>
                <div>🧂 ${float.salinity.toFixed(2)} PSU</div>
                <div>📏 ${float.depth.toFixed(0)}m depth</div>
                <div>🌍 ${float.region}</div>
                <div>📅 ${float.year}</div>
            </div>
        `;
        
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 1rem;
            border-radius: 8px;
            font-size: 0.8rem;
            pointer-events: none;
            z-index: 1000;
            min-width: 200px;
            left: ${dot.offsetLeft + 15}px;
            top: ${dot.offsetTop - 80}px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(tooltip);
    }
    
    hideFloatTooltip() {
        const tooltip = document.querySelector('.float-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    showFloatDetails(float) {
        const details = `
            ARGO Float Details:
            ID: ${float.id}
            Temperature: ${float.temperature.toFixed(1)}°C
            Salinity: ${float.salinity.toFixed(2)} PSU
            Depth: ${float.depth.toFixed(0)}m
            Region: ${float.region}
            Country: ${float.country}
            Year: ${float.year}
            Status: ${float.status}
            Last Profile: ${float.lastProfile.toLocaleDateString()}
        `;
        
        if (window.app) {
            window.app.showNotification(details);
        }
    }
    
    showFloatInfoPanel(float) {
        // Create or update info panel
        let panel = document.querySelector('.float-info-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.className = 'float-info-panel';
            document.querySelector('.globe-area').appendChild(panel);
        }
        
        panel.innerHTML = `
            <div class="info-header">
                <h3>ARGO Float ${float.id}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <div class="info-content">
                <div class="info-grid">
                    <div class="info-item">
                        <label>Temperature</label>
                        <span>${float.temperature.toFixed(1)}°C</span>
                    </div>
                    <div class="info-item">
                        <label>Salinity</label>
                        <span>${float.salinity.toFixed(2)} PSU</span>
                    </div>
                    <div class="info-item">
                        <label>Depth</label>
                        <span>${float.depth.toFixed(0)}m</span>
                    </div>
                    <div class="info-item">
                        <label>Region</label>
                        <span>${float.region}</span>
                    </div>
                    <div class="info-item">
                        <label>Country</label>
                        <span>${float.country}</span>
                    </div>
                    <div class="info-item">
                        <label>Status</label>
                        <span class="status ${float.status}">${float.status}</span>
                    </div>
                </div>
                <div class="info-actions">
                    <button class="action-btn" onclick="globeManager.exportFloatData('${float.id}')">
                        Export Data
                    </button>
                    <button class="action-btn" onclick="globeManager.showFloatHistory('${float.id}')">
                        View History
                    </button>
                </div>
            </div>
        `;
        
        // Animate panel appearance
        anime({
            targets: panel,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 300,
            easing: 'easeOutExpo'
        });
    }
    
    hideFloatInfoPanel() {
        const panel = document.querySelector('.float-info-panel');
        if (panel) {
            anime({
                targets: panel,
                opacity: [1, 0],
                translateY: [0, 20],
                duration: 200,
                easing: 'easeInExpo',
                complete: () => panel.remove()
            });
        }
    }
    
    createConnections(selectedFloat) {
        this.clearConnections();
        
        // Find nearby floats
        const nearbyFloats = this.argoFloats.filter(float => {
            if (float.id === selectedFloat.id) return false;
            
            const distance = Math.sqrt(
                Math.pow(float.x - selectedFloat.x, 2) + 
                Math.pow(float.y - selectedFloat.y, 2)
            );
            
            return distance < 150; // Connection threshold
        });
        
        // Create connection lines
        nearbyFloats.forEach(float => {
            this.createConnectionLine(selectedFloat, float);
        });
    }
    
    createConnectionLine(float1, float2) {
        const line = document.createElement('div');
        line.className = 'connection-line';
        
        const centerX = this.globe.offsetWidth / 2;
        const centerY = this.globe.offsetHeight / 2;
        
        const x1 = centerX + float1.x;
        const y1 = centerY + float1.y;
        const x2 = centerX + float2.x;
        const y2 = centerY + float2.y;
        
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        
        line.style.cssText = `
            position: absolute;
            left: ${x1}px;
            top: ${y1}px;
            width: ${length}px;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transform: rotate(${angle}deg);
            transform-origin: 0 50%;
            z-index: 1;
        `;
        
        this.globe.appendChild(line);
        this.connections.push(line);
        
        // Animate connection
        anime({
            targets: line,
            scaleX: [0, 1],
            duration: 500,
            easing: 'easeOutExpo',
            delay: Math.random() * 200
        });
    }
    
    clearConnections() {
        this.connections.forEach(line => line.remove());
        this.connections = [];
    }
    
    highlightConnections(float) {
        // Highlight connected floats
        const connectedFloats = this.argoFloats.filter(f => {
            if (f.id === float.id) return false;
            const distance = Math.sqrt(
                Math.pow(f.x - float.x, 2) + 
                Math.pow(f.y - float.y, 2)
            );
            return distance < 150;
        });
        
        connectedFloats.forEach(connectedFloat => {
            const dot = document.querySelector(`[data-float-id="${connectedFloat.id}"]`);
            if (dot) {
                dot.classList.add('connected');
            }
        });
    }
    
    startRotation() {
        if (!this.globe) return;
        
        this.rotationAnimation = anime({
            targets: this.globe,
            rotate: '360deg',
            duration: 20000,
            easing: 'linear',
            loop: true,
            autoplay: this.isRotating
        });
    }
    
    pauseRotation() {
        if (this.rotationAnimation) {
            this.rotationAnimation.pause();
        }
    }
    
    resumeRotation() {
        if (this.rotationAnimation && this.isRotating) {
            this.rotationAnimation.play();
        }
    }
    
    toggleRotation() {
        this.isRotating = !this.isRotating;
        if (this.isRotating) {
            this.resumeRotation();
        } else {
            this.pauseRotation();
        }
    }
    
    updateFloats(filters) {
        // Filter floats based on criteria
        let filteredFloats = this.argoFloats;
        
        if (filters.region && filters.region !== 'all') {
            filteredFloats = filteredFloats.filter(float => 
                float.region.toLowerCase().includes(filters.region.toLowerCase())
            );
        }
        
        if (filters.year && filters.year !== 'all') {
            filteredFloats = filteredFloats.filter(float => 
                float.year === parseInt(filters.year)
            );
        }
        
        if (filters.country && filters.country !== 'all') {
            filteredFloats = filteredFloats.filter(float => 
                float.country.toLowerCase().includes(filters.country.toLowerCase())
            );
        }
        
        // Update visualization
        this.renderFilteredFloats(filteredFloats);
    }
    
    renderFilteredFloats(filteredFloats) {
        // Hide all floats first
        document.querySelectorAll('.argo-dot').forEach(dot => {
            dot.style.display = 'none';
        });
        
        // Show filtered floats
        filteredFloats.forEach(float => {
            const dot = document.querySelector(`[data-float-id="${float.id}"]`);
            if (dot) {
                dot.style.display = 'block';
                anime({
                    targets: dot,
                    scale: [0, 1],
                    opacity: [0, 1],
                    duration: 300,
                    easing: 'easeOutBack'
                });
            }
        });
    }
    
    exportFloatData(floatId) {
        const float = this.argoFloats.find(f => f.id === floatId);
        if (!float) return;
        
        const data = {
            id: float.id,
            temperature: float.temperature,
            salinity: float.salinity,
            depth: float.depth,
            region: float.region,
            country: float.country,
            year: float.year,
            status: float.status,
            lastProfile: float.lastProfile.toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `argo-float-${floatId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        if (window.app) {
            window.app.showNotification(`Exported data for ARGO Float ${floatId}`);
        }
    }
    
    showFloatHistory(floatId) {
        // Mock historical data
        const history = this.generateFloatHistory(floatId);
        
        if (window.app) {
            window.app.showNotification(`Showing history for ARGO Float ${floatId} (${history.length} profiles)`);
        }
    }
    
    generateFloatHistory(floatId) {
        // Generate mock historical data
        const history = [];
        const baseFloat = this.argoFloats.find(f => f.id === floatId);
        if (!baseFloat) return history;
        
        for (let i = 0; i < 12; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            
            history.push({
                date: date.toISOString().split('T')[0],
                temperature: baseFloat.temperature + (Math.random() - 0.5) * 2,
                salinity: baseFloat.salinity + (Math.random() - 0.5) * 0.5,
                depth: baseFloat.depth + (Math.random() - 0.5) * 200
            });
        }
        
        return history;
    }
}

// Initialize globe manager
let globeManager;
document.addEventListener('DOMContentLoaded', () => {
    globeManager = new GlobeManager();
});
