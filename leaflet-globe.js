/**
 * Leaflet 2D World Map Integration for FloatChat
 * Handles 2D world map visualization with ARGO float data using Leaflet
 */

class LeafletGlobe {
    constructor() {
        this.map = null;
        this.argoMarkers = [];
        this.argoData = [];
        this.autoRotate = false;
        this.autoRotateInterval = null;
        this.currentView = 'satellite';
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Leaflet Globe...');
            
            // Create the map with world wrapping enabled
            this.map = L.map('leafletMap', {
                center: [0, 0],      // Equator & prime meridian
                zoom: 2,             // Zoomed out for full-globe view
                worldCopyJump: true, // Allow seamless horizontal wrapping
                crs: L.CRS.EPSG3857, // Web Mercator projection
                zoomControl: true,
                attributionControl: true
            });

            // Add Esri World Imagery tile layer
            this.addEsriImageryLayer();
            
            // Add custom controls
            this.addCustomControls();
            
            // Load ARGO float data
            this.loadArgoData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            console.log('Leaflet Globe initialized successfully');
            
        } catch (error) {
            console.error('Error initializing Leaflet Globe:', error);
        }
    }

    addEsriImageryLayer() {
        // Add the Esri world imagery tile layer
        const esriLayer = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 
            {
                attribution: 'Tiles © Esri, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18,
                minZoom: 1
            }
        ).addTo(this.map);

        // Store reference for layer switching
        this.currentLayer = esriLayer;
    }

    addCustomControls() {
        // Add custom view mode controls
        const viewControl = L.control({ position: 'topright' });
        viewControl.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'leaflet-control-custom');
            div.innerHTML = `
                <div class="view-controls">
                    <button class="control-btn" id="satelliteView" title="Satellite View">
                        <i class="fas fa-satellite"></i>
                    </button>
                    <button class="control-btn" id="terrainView" title="Terrain View">
                        <i class="fas fa-mountain"></i>
                    </button>
                    <button class="control-btn" id="politicalView" title="Political Boundaries">
                        <i class="fas fa-map"></i>
                    </button>
                    <button class="control-btn" id="nightView" title="Night View">
                        <i class="fas fa-moon"></i>
                    </button>
                </div>
            `;
            return div;
        };
        viewControl.addTo(this.map);
    }

    setupEventListeners() {
        // Map click events
        this.map.on('click', (e) => {
            console.log('Map clicked at:', e.latlng);
        });

        // Map zoom events
        this.map.on('zoomend', () => {
            this.updateMarkerVisibility();
        });
    }

    loadArgoData() {
        // Generate mock ARGO float data
        this.argoData = this.generateMockArgoData();
        this.plotArgoFloats();
    }

    generateMockArgoData() {
        const argoData = [];
        const regions = [
            { name: 'North Atlantic', bounds: [[20, -80], [60, -20]] },
            { name: 'South Atlantic', bounds: [[-60, -80], [-20, -20]] },
            { name: 'North Pacific', bounds: [[20, 120], [60, -120]] },
            { name: 'South Pacific', bounds: [[-60, 120], [-20, -120]] },
            { name: 'Indian Ocean', bounds: [[-60, 20], [20, 120]] },
            { name: 'Southern Ocean', bounds: [[-80, -180], [-60, 180]] }
        ];

        regions.forEach(region => {
            const numFloats = Math.floor(Math.random() * 15) + 5;
            for (let i = 0; i < numFloats; i++) {
                const lat = region.bounds[0][0] + Math.random() * (region.bounds[1][0] - region.bounds[0][0]);
                const lng = region.bounds[0][1] + Math.random() * (region.bounds[1][1] - region.bounds[0][1]);
                
                argoData.push({
                    id: `argo_${region.name.replace(/\s+/g, '_').toLowerCase()}_${i}`,
                    lat: lat,
                    lng: lng,
                    region: region.name,
                    quality: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
                    lastUpdate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
                    parameters: ['temperature', 'salinity', 'pressure', 'oxygen'].slice(0, Math.floor(Math.random() * 4) + 1),
                    status: Math.random() > 0.1 ? 'active' : 'inactive'
                });
            }
        });

        return argoData;
    }

    plotArgoFloats() {
        // Clear existing markers
        this.argoMarkers.forEach(marker => this.map.removeLayer(marker));
        this.argoMarkers = [];

        // Create markers for each ARGO float
        this.argoData.forEach(float => {
            const marker = this.createArgoMarker(float);
            this.argoMarkers.push(marker);
            marker.addTo(this.map);
        });

        console.log(`Plotted ${this.argoMarkers.length} ARGO float markers`);
    }

    createArgoMarker(float) {
        // Create custom icon based on float status and quality
        const iconColor = this.getIconColor(float);
        const iconSize = this.getIconSize(float);
        
        const customIcon = L.divIcon({
            className: 'argo-marker',
            html: `
                <div class="argo-float-marker" style="
                    width: ${iconSize}px;
                    height: ${iconSize}px;
                    background-color: ${iconColor};
                    border: 2px solid #fff;
                    border-radius: 50%;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${iconSize * 0.4}px;
                    color: white;
                    font-weight: bold;
                ">
                    <i class="fas fa-water"></i>
                </div>
            `,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize/2, iconSize/2]
        });

        const marker = L.marker([float.lat, float.lng], { icon: customIcon });
        
        // Add popup with float information
        const popupContent = `
            <div class="argo-popup">
                <h4>ARGO Float ${float.id}</h4>
                <p><strong>Region:</strong> ${float.region}</p>
                <p><strong>Status:</strong> <span class="status-${float.status}">${float.status}</span></p>
                <p><strong>Quality:</strong> <span class="quality-${float.quality}">${float.quality}</span></p>
                <p><strong>Last Update:</strong> ${float.lastUpdate.toLocaleDateString()}</p>
                <p><strong>Parameters:</strong> ${float.parameters.join(', ')}</p>
                <div class="popup-actions">
                    <button class="btn-primary" onclick="window.leafletGlobe.selectArgoFloat('${float.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn-secondary" onclick="window.leafletGlobe.askAboutFloat('${float.id}')">
                        <i class="fas fa-comment"></i> Ask About This
                    </button>
                </div>
            </div>
        `;
        
        marker.bindPopup(popupContent);
        
        // Add click event
        marker.on('click', () => {
            this.selectArgoFloat(float.id);
        });

        return marker;
    }

    getIconColor(float) {
        if (float.status === 'inactive') return '#6b7280'; // Gray for inactive
        switch (float.quality) {
            case 'high': return '#10b981'; // Green for high quality
            case 'medium': return '#f59e0b'; // Yellow for medium quality
            case 'low': return '#ef4444'; // Red for low quality
            default: return '#3b82f6'; // Blue default
        }
    }

    getIconSize(float) {
        const baseSize = 12;
        const zoom = this.map.getZoom();
        if (zoom < 3) return baseSize;
        if (zoom < 6) return baseSize + 4;
        return baseSize + 8;
    }

    updateMarkerVisibility() {
        // Update marker sizes based on zoom level
        this.argoMarkers.forEach((marker, index) => {
            const float = this.argoData[index];
            const newSize = this.getIconSize(float);
            const newColor = this.getIconColor(float);
            
            // Update marker appearance
            const markerElement = marker.getElement();
            if (markerElement) {
                const iconElement = markerElement.querySelector('.argo-float-marker');
                if (iconElement) {
                    iconElement.style.width = `${newSize}px`;
                    iconElement.style.height = `${newSize}px`;
                    iconElement.style.backgroundColor = newColor;
                }
            }
        });
    }

    selectArgoFloat(floatId) {
        const float = this.argoData.find(f => f.id === floatId);
        if (float) {
            // Center map on the float
            this.map.setView([float.lat, float.lng], 6);
            
            // Highlight the marker
            const marker = this.argoMarkers.find(m => m.options.floatId === floatId);
            if (marker) {
                marker.openPopup();
            }
            
            // Trigger chatbot expansion
            if (window.expandChatbotPanel) {
                window.expandChatbotPanel(floatId);
            }
            
            console.log('Selected ARGO float:', float);
        }
    }

    askAboutFloat(floatId) {
        const float = this.argoData.find(f => f.id === floatId);
        if (float) {
            // Generate a question about the float
            const question = `Tell me about ARGO float ${floatId} in the ${float.region} region. What data has it collected recently?`;
            
            // Trigger chatbot with the question
            if (window.askFloatChat) {
                window.askFloatChat(question);
            }
            
            console.log('Asking about float:', float);
        }
    }

    // View mode switching methods
    setGlobeView(viewMode) {
        this.currentView = viewMode;
        
        // Remove current layer
        if (this.currentLayer) {
            this.map.removeLayer(this.currentLayer);
        }
        
        let newLayer;
        switch (viewMode) {
            case 'satellite':
                newLayer = L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    {
                        attribution: 'Tiles © Esri, USDA, USGS, AEX, GeoEye',
                        maxZoom: 18
                    }
                );
                break;
            case 'terrain':
                newLayer = L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
                    {
                        attribution: 'Tiles © Esri',
                        maxZoom: 18
                    }
                );
                break;
            case 'political':
                newLayer = L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
                    {
                        attribution: 'Tiles © Esri',
                        maxZoom: 18
                    }
                );
                break;
            case 'night':
                newLayer = L.tileLayer(
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                    {
                        attribution: 'Tiles © Esri',
                        maxZoom: 18
                    }
                );
                break;
        }
        
        if (newLayer) {
            newLayer.addTo(this.map);
            this.currentLayer = newLayer;
        }
    }

    // Zoom control methods
    zoomIn() {
        this.map.zoomIn();
    }

    zoomOut() {
        this.map.zoomOut();
    }

    resetView() {
        this.map.setView([0, 0], 2);
    }

    // Auto-rotation methods
    toggleAutoRotation() {
        this.autoRotate = !this.autoRotate;
        
        if (this.autoRotate) {
            this.startAutoRotation();
        } else {
            this.stopAutoRotation();
        }
        
        return this.autoRotate;
    }

    startAutoRotation() {
        if (this.autoRotateInterval) return;
        
        this.autoRotateInterval = setInterval(() => {
            const currentCenter = this.map.getCenter();
            const newLng = (currentCenter.lng + 0.5) % 360;
            this.map.setView([currentCenter.lat, newLng], this.map.getZoom());
        }, 100);
    }

    stopAutoRotation() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }

    // Filter methods
    filterArgoFloats(filters) {
        const filteredData = this.argoData.filter(float => {
            if (filters.region && filters.region !== 'all' && !float.region.toLowerCase().includes(filters.region.toLowerCase())) {
                return false;
            }
            if (filters.quality && filters.quality !== 'all' && float.quality !== filters.quality) {
                return false;
            }
            if (filters.status && filters.status !== 'all' && float.status !== filters.status) {
                return false;
            }
            return true;
        });
        
        // Update markers
        this.argoMarkers.forEach(marker => this.map.removeLayer(marker));
        this.argoMarkers = [];
        
        filteredData.forEach(float => {
            const marker = this.createArgoMarker(float);
            this.argoMarkers.push(marker);
            marker.addTo(this.map);
        });
        
        console.log(`Filtered to ${filteredData.length} ARGO floats`);
    }
}

// Initialize the Leaflet globe when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.leafletGlobe = new LeafletGlobe();
});
