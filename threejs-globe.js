/**
 * Three.js 3D Globe Integration for FloatChat
 * Handles 3D globe visualization with ARGO float data using Three.js
 */

class ThreeJSGlobe {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.globe = null;
        this.argoPoints = [];
        this.autoRotate = false;
        this.autoRotateSpeed = 0.005;
        this.raycaster = null;
        this.mouse = null;
        this.earthTexture = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Three.js Globe...');
            
            // Create scene, camera, and renderer
            this.setupScene();
            
            // Load earth texture and create globe
            await this.createGlobe();
            
            // Add lighting
            this.setupLighting();
            
            // Add controls
            this.setupControls();
            
            // Add ARGO float points
            this.loadArgoData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start animation loop
            this.animate();
            
            console.log('Three.js Globe initialized successfully');
            
        } catch (error) {
            console.error('Error initializing Three.js Globe:', error);
        }
    }

    setupScene() {
        const container = document.getElementById('threejsContainer');
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011); // Dark blue space background

        // Create camera
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 15);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to container
        container.appendChild(this.renderer.domElement);

        console.log('Scene setup complete');
        console.log('Container size:', width, 'x', height);
        console.log('Camera position:', this.camera.position);
        console.log('Renderer size:', this.renderer.getSize(new THREE.Vector2()));

        // Setup raycaster for mouse interactions
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    async createGlobe() {
        // Create detailed earth texture with continents and countries
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');
        
        // Fill with ocean blue background
        ctx.fillStyle = '#1e40af'; // Deep ocean blue
        ctx.fillRect(0, 0, 2048, 1024);
        
        // Add ocean depth variations
        this.addOceanDepth(ctx, canvas.width, canvas.height);
        
        // Add continents with realistic shapes
        this.addContinents(ctx);
        
        // Add country borders
        this.addCountryBorders(ctx);
        
        // Add major water bodies
        this.addWaterBodies(ctx);
        
        // Add land features
        this.addLandFeatures(ctx);
        
        // Add ocean currents (relevant for ARGO data)
        this.addOceanCurrents(ctx);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;

        // Create globe geometry and material
        const geometry = new THREE.SphereGeometry(5, 128, 128); // Higher resolution
        const material = new THREE.MeshPhongMaterial({ 
            map: texture,
            shininess: 50,
            specular: new THREE.Color(0x111111)
        });

        // Create globe mesh
        this.globe = new THREE.Mesh(geometry, material);
        this.globe.castShadow = true;
        this.globe.receiveShadow = true;
        this.scene.add(this.globe);

        console.log('Detailed globe created with continents and countries');
        console.log('Globe position:', this.globe.position);
        console.log('Globe visible:', this.globe.visible);
        console.log('Scene children count:', this.scene.children.length);
    }

    addOceanDepth(ctx, width, height) {
        // Add ocean depth variations
        const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width/2);
        gradient.addColorStop(0, '#1e40af'); // Deep blue center
        gradient.addColorStop(0.7, '#3b82f6'); // Medium blue
        gradient.addColorStop(1, '#60a5fa'); // Light blue edges
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    addContinents(ctx) {
        // North America
        ctx.fillStyle = '#22c55e'; // Green
        ctx.beginPath();
        ctx.ellipse(400, 300, 120, 80, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // South America
        ctx.fillStyle = '#16a34a'; // Darker green
        ctx.beginPath();
        ctx.ellipse(450, 650, 60, 100, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Europe
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(1000, 250, 80, 60, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Africa
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(1050, 500, 70, 120, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Asia
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(1400, 300, 150, 100, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Australia
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(1600, 700, 80, 50, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Antarctica
        ctx.fillStyle = '#fbbf24'; // Yellow for ice
        ctx.beginPath();
        ctx.ellipse(1024, 950, 200, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    addCountryBorders(ctx) {
        ctx.strokeStyle = '#374151'; // Dark gray borders
        ctx.lineWidth = 1;
        
        // Add some major country borders
        // USA-Canada border
        ctx.beginPath();
        ctx.moveTo(350, 200);
        ctx.lineTo(450, 200);
        ctx.stroke();
        
        // Europe country borders
        ctx.beginPath();
        ctx.moveTo(950, 220);
        ctx.lineTo(1050, 220);
        ctx.stroke();
        
        // Asia country borders
        ctx.beginPath();
        ctx.moveTo(1300, 250);
        ctx.lineTo(1500, 250);
        ctx.stroke();
    }

    addWaterBodies(ctx) {
        // Mediterranean Sea
        ctx.fillStyle = '#0ea5e9'; // Light blue
        ctx.beginPath();
        ctx.ellipse(1000, 400, 60, 20, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Caribbean Sea
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.ellipse(500, 500, 40, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Red Sea
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.ellipse(1100, 450, 30, 15, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Persian Gulf
        ctx.fillStyle = '#0ea5e9';
        ctx.beginPath();
        ctx.ellipse(1200, 400, 25, 10, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    addLandFeatures(ctx) {
        // Add some mountain ranges
        ctx.fillStyle = '#8b5cf6'; // Purple for mountains
        ctx.beginPath();
        ctx.ellipse(1200, 350, 100, 20, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add some desert areas
        ctx.fillStyle = '#f59e0b'; // Orange for deserts
        ctx.beginPath();
        ctx.ellipse(1100, 450, 80, 30, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add some forest areas
        ctx.fillStyle = '#059669'; // Dark green for forests
        ctx.beginPath();
        ctx.ellipse(400, 350, 60, 40, 0, 0, 2 * Math.PI);
        ctx.fill();
    }

    addOceanCurrents(ctx) {
        // Add major ocean currents as subtle lines
        ctx.strokeStyle = '#0ea5e9'; // Light blue for currents
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        
        // Gulf Stream
        ctx.beginPath();
        ctx.moveTo(300, 200);
        ctx.quadraticCurveTo(400, 150, 500, 200);
        ctx.quadraticCurveTo(600, 250, 700, 300);
        ctx.stroke();
        
        // North Atlantic Current
        ctx.beginPath();
        ctx.moveTo(700, 300);
        ctx.quadraticCurveTo(800, 250, 900, 200);
        ctx.stroke();
        
        // Kuroshio Current (Japan)
        ctx.beginPath();
        ctx.moveTo(1500, 200);
        ctx.quadraticCurveTo(1600, 150, 1700, 200);
        ctx.stroke();
        
        // Antarctic Circumpolar Current
        ctx.beginPath();
        ctx.moveTo(200, 900);
        ctx.quadraticCurveTo(500, 950, 800, 900);
        ctx.quadraticCurveTo(1200, 950, 1500, 900);
        ctx.quadraticCurveTo(1800, 950, 2000, 900);
        ctx.stroke();
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Main directional light (sun) - positioned to show continents clearly
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(15, 10, 8);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        this.scene.add(directionalLight);

        // Secondary light for better continent visibility
        const secondaryLight = new THREE.DirectionalLight(0xffffff, 0.3);
        secondaryLight.position.set(-5, 5, 10);
        this.scene.add(secondaryLight);

        // Rim light for better edge definition
        const rimLight = new THREE.DirectionalLight(0x87ceeb, 0.2);
        rimLight.position.set(-10, -5, -5);
        this.scene.add(rimLight);
    }

    setupControls() {
        // Check if OrbitControls is available
        if (typeof THREE.OrbitControls !== 'undefined') {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.minDistance = 6;
            this.controls.maxDistance = 30;
            this.controls.enablePan = false;
            this.controls.autoRotate = false;
            console.log('OrbitControls initialized successfully');
        } else {
            console.warn('OrbitControls not available, using basic controls');
            // Fallback: manual camera controls
            this.setupBasicControls();
        }
    }

    setupBasicControls() {
        // Basic mouse controls without OrbitControls
        let isMouseDown = false;
        let mouseX = 0, mouseY = 0;
        
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            isMouseDown = true;
        });
        
        this.renderer.domElement.addEventListener('mouseup', (event) => {
            isMouseDown = false;
        });
        
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            if (isMouseDown) {
                const deltaX = event.clientX - mouseX;
                const deltaY = event.clientY - mouseY;
                
                this.camera.position.x += deltaX * 0.01;
                this.camera.position.y -= deltaY * 0.01;
            }
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        
        this.renderer.domElement.addEventListener('wheel', (event) => {
            const zoom = event.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(zoom);
        });
    }

    setupEventListeners() {
        // Auto-rotation toggle
        const autoRotateBtn = document.getElementById('autoRotateBtn');
        if (autoRotateBtn) {
            autoRotateBtn.addEventListener('click', () => this.toggleAutoRotation());
        }

        // Mouse click for ARGO point interaction
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    toggleAutoRotation() {
        this.autoRotate = !this.autoRotate;
        
        if (this.controls && this.controls.autoRotate !== undefined) {
            this.controls.autoRotate = this.autoRotate;
            this.controls.autoRotateSpeed = this.autoRotateSpeed;
        }
        
        const btn = document.getElementById('autoRotateBtn');
        const icon = document.getElementById('autoRotateIcon');
        
        if (this.autoRotate) {
            btn.classList.add('active');
            icon.className = 'fas fa-pause';
        } else {
            btn.classList.remove('active');
            icon.className = 'fas fa-play';
        }
    }

    onMouseClick(event) {
        // Calculate mouse position
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        // Update raycaster
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Check for intersections with ARGO points
        const intersects = this.raycaster.intersectObjects(this.argoPoints);
        
        if (intersects.length > 0) {
            const clickedPoint = intersects[0].object;
            this.showArgoInfo(clickedPoint.userData);
        }
    }

    showArgoInfo(argoData) {
        // Create or update info popup
        let popup = document.getElementById('argoPopup');
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'argoPopup';
            popup.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 1000;
                max-width: 300px;
                backdrop-filter: blur(10px);
            `;
            document.body.appendChild(popup);
        }

        popup.innerHTML = `
            <h3>${argoData.name}</h3>
            <p><strong>Temperature:</strong> ${argoData.temperature}°C</p>
            <p><strong>Salinity:</strong> ${argoData.salinity} PSU</p>
            <p><strong>Pressure:</strong> ${argoData.pressure} dbar</p>
            <p><strong>Quality:</strong> ${argoData.quality}</p>
            <p><strong>Region:</strong> ${argoData.region}</p>
            <p><strong>Last Update:</strong> ${new Date(argoData.timestamp).toLocaleString()}</p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
        `;
    }

    onWindowResize() {
        const container = document.getElementById('threejsContainer');
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    loadArgoData() {
        // Enhanced ARGO float data
        const argoData = [
            {
                id: 'ARGO_001',
                name: 'ARGO Float 001',
                latitude: 20.0,
                longitude: 60.0,
                temperature: 28.5,
                salinity: 35.2,
                pressure: 1000,
                timestamp: '2024-01-15T10:30:00Z',
                quality: 'high',
                region: 'indian'
            },
            {
                id: 'ARGO_002',
                name: 'ARGO Float 002',
                latitude: -15.0,
                longitude: 120.0,
                temperature: 25.8,
                salinity: 34.8,
                pressure: 1500,
                timestamp: '2024-01-15T11:45:00Z',
                quality: 'high',
                region: 'pacific'
            },
            {
                id: 'ARGO_003',
                name: 'ARGO Float 003',
                latitude: 45.0,
                longitude: -30.0,
                temperature: 18.2,
                salinity: 35.5,
                pressure: 800,
                timestamp: '2024-01-15T12:15:00Z',
                quality: 'medium',
                region: 'atlantic'
            },
            {
                id: 'ARGO_004',
                name: 'ARGO Float 004',
                latitude: -60.0,
                longitude: 0.0,
                temperature: 2.1,
                salinity: 34.0,
                pressure: 2000,
                timestamp: '2024-01-15T13:20:00Z',
                quality: 'high',
                region: 'southern'
            },
            {
                id: 'ARGO_005',
                name: 'ARGO Float 005',
                latitude: 70.0,
                longitude: -150.0,
                temperature: -1.5,
                salinity: 32.8,
                pressure: 500,
                timestamp: '2024-01-15T14:10:00Z',
                quality: 'low',
                region: 'arctic'
            },
            {
                id: 'ARGO_006',
                name: 'ARGO Float 006',
                latitude: 10.0,
                longitude: 80.0,
                temperature: 29.2,
                salinity: 35.0,
                pressure: 1200,
                timestamp: '2024-01-15T15:30:00Z',
                quality: 'high',
                region: 'indian'
            },
            {
                id: 'ARGO_007',
                name: 'ARGO Float 007',
                latitude: -25.0,
                longitude: 160.0,
                temperature: 24.5,
                salinity: 34.9,
                pressure: 1800,
                timestamp: '2024-01-15T16:45:00Z',
                quality: 'medium',
                region: 'pacific'
            },
            {
                id: 'ARGO_008',
                name: 'ARGO Float 008',
                latitude: 35.0,
                longitude: -60.0,
                temperature: 22.1,
                salinity: 35.3,
                pressure: 900,
                timestamp: '2024-01-15T17:20:00Z',
                quality: 'high',
                region: 'atlantic'
            },
            {
                id: 'ARGO_009',
                name: 'ARGO Float 009',
                latitude: -45.0,
                longitude: 30.0,
                temperature: 8.5,
                salinity: 34.2,
                pressure: 2500,
                timestamp: '2024-01-15T18:15:00Z',
                quality: 'medium',
                region: 'southern'
            },
            {
                id: 'ARGO_010',
                name: 'ARGO Float 010',
                latitude: 80.0,
                longitude: 20.0,
                temperature: -2.8,
                salinity: 31.5,
                pressure: 300,
                timestamp: '2024-01-15T19:00:00Z',
                quality: 'low',
                region: 'arctic'
            }
        ];

        this.plotArgoFloats(argoData);
    }

    plotArgoFloats(argoData) {
        // Clear existing points
        this.argoPoints.forEach(point => {
            this.scene.remove(point);
        });
        this.argoPoints = [];

        argoData.forEach((float, index) => {
            // Convert lat/lon to 3D coordinates
            const position = this.latLonToVector3(float.latitude, float.longitude, 5.1);

            // Create point geometry and material
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            
            // Set color based on quality
            let color;
            switch (float.quality) {
                case 'high':
                    color = 0x10b981; // Green
                    break;
                case 'medium':
                    color = 0xf59e0b; // Yellow
                    break;
                case 'low':
                    color = 0xef4444; // Red
                    break;
                default:
                    color = 0x6b7280; // Gray
            }

            const material = new THREE.MeshBasicMaterial({ color: color });
            const point = new THREE.Mesh(geometry, material);
            
            // Position the point
            point.position.copy(position);
            
            // Store ARGO data for interaction
            point.userData = float;
            
            // Add to scene and tracking array
            this.scene.add(point);
            this.argoPoints.push(point);

            // Add pulsing animation
            this.animateArgoPoint(point, index);
        });

        console.log(`Plotted ${argoData.length} ARGO float points`);
    }

    latLonToVector3(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        return new THREE.Vector3(
            -(radius * Math.sin(phi) * Math.cos(theta)),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );
    }

    animateArgoPoint(point, index) {
        // Add pulsing animation with delay
        setTimeout(() => {
            const animate = () => {
                if (point.parent) { // Check if point is still in scene
                    point.scale.setScalar(1 + Math.sin(Date.now() * 0.003 + index) * 0.3);
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }, index * 100);
    }

    // Filter ARGO floats based on current filters
    filterArgoFloats(filters) {
        this.argoPoints.forEach(point => {
            const argoData = point.userData;
            let shouldShow = true;

            // Apply region filter
            if (filters.region !== 'all' && argoData.region !== filters.region) {
                shouldShow = false;
            }

            // Apply quality filter
            if (filters.quality !== 'all' && argoData.quality !== filters.quality) {
                shouldShow = false;
            }

            // Show/hide point based on filter results
            point.visible = shouldShow;
        });

        console.log('ARGO points filtered based on current filters');
    }

    // Set globe view mode (for compatibility with existing controls)
    setGlobeView(view) {
        // Three.js doesn't have different imagery layers like Cesium
        // We can adjust lighting or atmosphere instead
        switch (view) {
            case 'night':
                this.scene.background = new THREE.Color(0x000033);
                break;
            case 'satellite':
            case 'terrain':
            case 'political':
            default:
                this.scene.background = new THREE.Color(0x000011);
                break;
        }
    }

    // Zoom controls
    zoomIn() {
        this.camera.position.multiplyScalar(0.8);
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
    }

    zoomOut() {
        this.camera.position.multiplyScalar(1.2);
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
    }

    resetView() {
        this.camera.position.set(0, 0, 15);
        if (this.controls && this.controls.reset) {
            this.controls.reset();
        }
    }

    // Animation loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls if available
        if (this.controls && this.controls.update) {
            this.controls.update();
        }
        
        // Manual auto-rotation if OrbitControls is not available
        if (this.autoRotate && (!this.controls || !this.controls.autoRotate)) {
            this.globe.rotation.y += this.autoRotateSpeed;
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    // Cleanup
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
        }
        if (this.controls) {
            this.controls.dispose();
        }
    }
}

// Initialize Three.js Globe when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.threejsGlobe = new ThreeJSGlobe();
});

// Export for global access
window.ThreeJSGlobe = ThreeJSGlobe;
