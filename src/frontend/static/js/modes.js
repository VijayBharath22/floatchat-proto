// Mode management and theme switching
class ModeManager {
    constructor() {
        this.currentMode = 'explorer';
        this.availableModes = ['explorer', 'navigator', 'researcher'];
        this.modeConfigs = this.initializeModeConfigs();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSavedMode();
        this.applyMode(this.currentMode);
    }
    
    setupEventListeners() {
        // Mode selector
        const modeSelect = document.getElementById('modeSelect');
        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                this.switchMode(e.target.value);
            });
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchMode('explorer');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchMode('navigator');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchMode('researcher');
                        break;
                }
            }
        });
    }
    
    initializeModeConfigs() {
        return {
            explorer: {
                name: 'Explorer',
                icon: '🧑‍🎓',
                description: 'Perfect for students and curious minds',
                theme: {
                    primary: '#667eea',
                    secondary: '#764ba2',
                    accent: '#ffd700',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    globe: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    floatColor: '#ffd700',
                    animations: 'playful'
                },
                features: {
                    simplifiedUI: true,
                    educationalContent: true,
                    interactiveElements: true,
                    gamification: true
                },
                prompts: [
                    "What are the most interesting ocean mysteries?",
                    "Tell me about marine life in different ocean zones",
                    "Why does the ocean appear blue?",
                    "How do ocean waves form?"
                ],
                greetings: [
                    "Welcome, ocean explorer! 🌊 Ready to discover amazing ocean secrets?",
                    "Hey there, curious mind! Let's explore the wonders of our blue planet!",
                    "Welcome aboard, explorer! The ocean is full of incredible discoveries waiting for you!"
                ]
            },
            navigator: {
                name: 'Navigator',
                icon: '🐟',
                description: 'Designed for fishermen and maritime professionals',
                theme: {
                    primary: '#1e3c72',
                    secondary: '#2a5298',
                    accent: '#00d4ff',
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    globe: 'linear-gradient(135deg, #0f4c75 0%, #3282b8 100%)',
                    floatColor: '#00d4ff',
                    animations: 'professional'
                },
                features: {
                    dataFocused: true,
                    operationalInfo: true,
                    weatherIntegration: true,
                    routePlanning: true
                },
                prompts: [
                    "What are the current ocean weather conditions?",
                    "Show me tidal and current information",
                    "What are the best sea routes for navigation?",
                    "What are the current storm patterns in the ocean?"
                ],
                greetings: [
                    "Welcome, navigator! 🌊 Let's check the latest ocean conditions for your journey.",
                    "Ahoy! Ready to navigate with the latest ocean data at your fingertips?",
                    "Welcome aboard, captain! The sea conditions are ready for your review."
                ]
            },
            researcher: {
                name: 'Researcher',
                icon: '👨‍🔬',
                description: 'Built for scientists and researchers',
                theme: {
                    primary: '#2c3e50',
                    secondary: '#34495e',
                    accent: '#e74c3c',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    globe: 'linear-gradient(135deg, #1a252f 0%, #2c3e50 100%)',
                    floatColor: '#e74c3c',
                    animations: 'minimal'
                },
                features: {
                    advancedAnalytics: true,
                    dataExport: true,
                    researchTools: true,
                    statisticalAnalysis: true
                },
                prompts: [
                    "Perform statistical analysis of ocean temperature data",
                    "Analyze long-term climate trends in ocean data",
                    "What are the latest research findings in oceanography?",
                    "Explain global ocean circulation patterns and their effects"
                ],
                greetings: [
                    "Welcome, researcher! 🔬 Ready to dive deep into oceanographic data analysis?",
                    "Greetings, scientist! The latest research data is at your disposal.",
                    "Welcome to the research station! Let's analyze some fascinating ocean data."
                ]
            }
        };
    }
    
    switchMode(modeName) {
        if (!this.availableModes.includes(modeName)) {
            console.error(`Invalid mode: ${modeName}`);
            return;
        }
        
        const previousMode = this.currentMode;
        this.currentMode = modeName;
        
        // Apply mode transition animation
        this.animateModeTransition(previousMode, modeName);
        
        // Apply new mode
        this.applyMode(modeName);
        
        // Save mode preference
        this.saveMode(modeName);
        
        // Update other components
        this.notifyModeChange(modeName);
    }
    
    applyMode(modeName) {
        const config = this.modeConfigs[modeName];
        if (!config) return;
        
        // Update app container
        const container = document.querySelector('.app-container');
        container.dataset.mode = modeName;
        
        // Apply theme
        this.applyTheme(config.theme);
        
        // Update UI elements
        this.updateUIElements(config);
        
        // Update content
        this.updateContent(config);
        
        // Apply mode-specific features
        this.applyModeFeatures(config);
    }
    
    applyTheme(theme) {
        const root = document.documentElement;
        
        // Set CSS custom properties
        root.style.setProperty('--primary-color', theme.primary);
        root.style.setProperty('--secondary-color', theme.secondary);
        root.style.setProperty('--accent-color', theme.accent);
        root.style.setProperty('--background-gradient', theme.background);
        root.style.setProperty('--globe-gradient', theme.globe);
        root.style.setProperty('--float-color', theme.floatColor);
        
        // Update body background
        document.body.style.background = theme.background;
        
        // Update globe styling
        const globe = document.querySelector('.globe');
        if (globe) {
            globe.style.background = theme.globe;
        }
        
        // Update ARGO float colors
        document.querySelectorAll('.argo-dot').forEach(dot => {
            dot.style.background = theme.floatColor;
        });
    }
    
    updateUIElements(config) {
        // Update mode selector
        const modeSelect = document.getElementById('modeSelect');
        if (modeSelect) {
            modeSelect.value = this.currentMode;
        }
        
        // Update page title
        document.title = `🌊 FloatChat - ${config.name} Mode`;
        
        // Update logo or branding if needed
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.innerHTML = `<i class="fas fa-water"></i><span>FloatChat ${config.icon}</span>`;
        }
    }
    
    updateContent(config) {
        // Update suggested prompts
        this.updateSuggestedPrompts(config.prompts);
        
        // Update greeting message
        this.updateGreeting(config.greetings);
        
        // Update any mode-specific content
        this.updateModeSpecificContent(config);
    }
    
    updateSuggestedPrompts(prompts) {
        const container = document.getElementById('suggestedPrompts');
        if (!container) return;
        
        container.innerHTML = '';
        
        prompts.forEach((prompt, index) => {
            const card = document.createElement('div');
            card.className = 'prompt-card stagger-item';
            card.dataset.query = prompt;
            card.innerHTML = `
                <h4>${this.getPromptTitle(prompt)}</h4>
                <p>${this.getPromptDescription(prompt)}</p>
            `;
            
            card.style.animationDelay = `${index * 0.1}s`;
            container.appendChild(card);
        });
    }
    
    getPromptTitle(prompt) {
        const titles = {
            "What are the most interesting ocean mysteries?": "Ocean Mysteries",
            "Tell me about marine life in different ocean zones": "Marine Life",
            "Why does the ocean appear blue?": "Ocean Colors",
            "How do ocean waves form?": "Ocean Waves",
            "What are the current ocean weather conditions?": "Weather Patterns",
            "Show me tidal and current information": "Tidal Information",
            "What are the best sea routes for navigation?": "Sea Routes",
            "What are the current storm patterns in the ocean?": "Storm Tracking",
            "Perform statistical analysis of ocean temperature data": "Data Analysis",
            "Analyze long-term climate trends in ocean data": "Climate Trends",
            "What are the latest research findings in oceanography?": "Research Insights",
            "Explain global ocean circulation patterns and their effects": "Ocean Circulation"
        };
        return titles[prompt] || "Ocean Question";
    }
    
    getPromptDescription(prompt) {
        const descriptions = {
            "What are the most interesting ocean mysteries?": "Discover fascinating ocean phenomena",
            "Tell me about marine life in different ocean zones": "Learn about ocean creatures",
            "Why does the ocean appear blue?": "Why is the ocean blue?",
            "How do ocean waves form?": "How do waves form?",
            "What are the current ocean weather conditions?": "Current ocean weather conditions",
            "Show me tidal and current information": "Tide and current data",
            "What are the best sea routes for navigation?": "Optimal navigation paths",
            "What are the current storm patterns in the ocean?": "Ocean storm patterns",
            "Perform statistical analysis of ocean temperature data": "Statistical ocean data analysis",
            "Analyze long-term climate trends in ocean data": "Long-term climate patterns",
            "What are the latest research findings in oceanography?": "Scientific research findings",
            "Explain global ocean circulation patterns and their effects": "Global ocean circulation patterns"
        };
        return descriptions[prompt] || "Ask about ocean data";
    }
    
    updateGreeting(greetings) {
        const greetingElement = document.querySelector('.greeting-message h2');
        if (greetingElement) {
            const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
            greetingElement.textContent = randomGreeting;
        }
    }
    
    updateModeSpecificContent(config) {
        // Update any mode-specific content
        if (config.features.simplifiedUI) {
            this.enableSimplifiedUI();
        } else {
            this.disableSimplifiedUI();
        }
        
        if (config.features.advancedAnalytics) {
            this.enableAdvancedAnalytics();
        } else {
            this.disableAdvancedAnalytics();
        }
    }
    
    enableSimplifiedUI() {
        // Hide complex elements for explorer mode
        document.querySelectorAll('.advanced-feature').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    disableSimplifiedUI() {
        // Show all elements for other modes
        document.querySelectorAll('.advanced-feature').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    enableAdvancedAnalytics() {
        // Show advanced analytics for researcher mode
        document.querySelectorAll('.research-feature').forEach(el => {
            el.style.display = 'block';
        });
    }
    
    disableAdvancedAnalytics() {
        // Hide advanced analytics for other modes
        document.querySelectorAll('.research-feature').forEach(el => {
            el.style.display = 'none';
        });
    }
    
    applyModeFeatures(config) {
        // Apply mode-specific features
        Object.keys(config.features).forEach(feature => {
            if (config.features[feature]) {
                this.enableFeature(feature);
            } else {
                this.disableFeature(feature);
            }
        });
    }
    
    enableFeature(feature) {
        // Enable specific features
        switch(feature) {
            case 'educationalContent':
                this.addEducationalTooltips();
                break;
            case 'gamification':
                this.addGamificationElements();
                break;
            case 'dataFocused':
                this.enhanceDataDisplay();
                break;
            case 'weatherIntegration':
                this.addWeatherWidget();
                break;
            case 'advancedAnalytics':
                this.addAnalyticsPanel();
                break;
        }
    }
    
    disableFeature(feature) {
        // Disable specific features
        switch(feature) {
            case 'educationalContent':
                this.removeEducationalTooltips();
                break;
            case 'gamification':
                this.removeGamificationElements();
                break;
            case 'dataFocused':
                this.simplifyDataDisplay();
                break;
            case 'weatherIntegration':
                this.removeWeatherWidget();
                break;
            case 'advancedAnalytics':
                this.removeAnalyticsPanel();
                break;
        }
    }
    
    addEducationalTooltips() {
        // Add educational tooltips for explorer mode
        document.querySelectorAll('.argo-dot').forEach(dot => {
            dot.title = 'Click to learn about this ARGO float!';
        });
    }
    
    removeEducationalTooltips() {
        // Remove educational tooltips
        document.querySelectorAll('.argo-dot').forEach(dot => {
            dot.title = '';
        });
    }
    
    addGamificationElements() {
        // Add gamification elements for explorer mode
        // This could include progress bars, achievements, etc.
    }
    
    removeGamificationElements() {
        // Remove gamification elements
    }
    
    enhanceDataDisplay() {
        // Enhance data display for navigator mode
        document.querySelectorAll('.data-point').forEach(point => {
            point.classList.add('enhanced');
        });
    }
    
    simplifyDataDisplay() {
        // Simplify data display for other modes
        document.querySelectorAll('.data-point').forEach(point => {
            point.classList.remove('enhanced');
        });
    }
    
    addWeatherWidget() {
        // Add weather widget for navigator mode
        // Implementation would depend on weather API integration
    }
    
    removeWeatherWidget() {
        // Remove weather widget
    }
    
    addAnalyticsPanel() {
        // Add analytics panel for researcher mode
        // Implementation would include statistical analysis tools
    }
    
    removeAnalyticsPanel() {
        // Remove analytics panel
    }
    
    animateModeTransition(previousMode, newMode) {
        const container = document.querySelector('.app-container');
        container.classList.add('mode-transition');
        
        // Use anime.js for smooth transition
        if (typeof anime !== 'undefined') {
            anime({
                targets: container,
                opacity: [1, 0.8, 1],
                scale: [1, 0.98, 1],
                duration: 600,
                easing: 'easeInOutQuad',
                complete: () => {
                    container.classList.remove('mode-transition');
                }
            });
        } else {
            // Fallback CSS animation
            setTimeout(() => {
                container.classList.remove('mode-transition');
            }, 600);
        }
    }
    
    notifyModeChange(modeName) {
        // Notify other components about mode change
        if (window.app) {
            window.app.currentMode = modeName;
        }
        
        if (window.chatbotManager) {
            window.chatbotManager.setMode(modeName);
        }
        
        if (window.globeManager) {
            window.globeManager.updateMode(modeName);
        }
        
        // Dispatch custom event
        const event = new CustomEvent('modeChanged', {
            detail: { mode: modeName, config: this.modeConfigs[modeName] }
        });
        document.dispatchEvent(event);
    }
    
    saveMode(modeName) {
        localStorage.setItem('floatChatMode', modeName);
    }
    
    loadSavedMode() {
        const savedMode = localStorage.getItem('floatChatMode');
        if (savedMode && this.availableModes.includes(savedMode)) {
            this.currentMode = savedMode;
        }
    }
    
    getCurrentMode() {
        return this.currentMode;
    }
    
    getModeConfig(modeName = null) {
        const mode = modeName || this.currentMode;
        return this.modeConfigs[mode];
    }
    
    getAllModes() {
        return this.availableModes.map(mode => ({
            name: mode,
            config: this.modeConfigs[mode]
        }));
    }
}

// Initialize mode manager
let modeManager;
document.addEventListener('DOMContentLoaded', () => {
    modeManager = new ModeManager();
});
