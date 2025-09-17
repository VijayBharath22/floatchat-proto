// Main application controller
class FloatChatApp {
    constructor() {
        this.currentMode = 'explorer';
        this.currentTab = 'globe';
        this.currentLanguage = 'en';
        this.argoFloats = [];
        this.chatHistory = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.initializeGlobe();
        this.loadModeSettings();
        this.setupLanguageSupport();
        this.initializeChatbot();
    }
    
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
        
        // Mode switching
        document.getElementById('modeSelect').addEventListener('change', (e) => {
            this.switchMode(e.target.value);
        });
        
        // Language switching
        document.getElementById('languageSelect').addEventListener('change', (e) => {
            this.switchLanguage(e.target.value);
        });
        
        // Chat input handling
        const chatInput = document.getElementById('chatInput');
        const chatbotInput = document.getElementById('chatbotInput');
        
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleGlobeChatInput();
                }
            });
        }
        
        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleChatbotInput();
                }
            });
        }
        
        // Send button
        document.getElementById('sendBtn').addEventListener('click', () => {
            this.handleChatbotInput();
        });
        
        // Filter changes
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => {
                this.updateGlobeData();
            });
        });
        
        // Auth buttons
        document.querySelector('.btn-login').addEventListener('click', () => {
            this.showLoginModal();
        });
        
        document.querySelector('.btn-signup').addEventListener('click', () => {
            this.showSignupModal();
        });
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Trigger animations
        if (tabName === 'chatbot') {
            this.animateToChatbot();
        } else {
            this.animateToGlobe();
        }
    }
    
    switchMode(mode) {
        const container = document.querySelector('.app-container');
        container.classList.add('mode-transition');
        container.dataset.mode = mode;
        this.currentMode = mode;
        
        // Update suggested prompts
        this.updateSuggestedPrompts();
        
        // Update globe data based on mode
        this.updateGlobeData();
        
        // Remove transition class after animation
        setTimeout(() => {
            container.classList.remove('mode-transition');
        }, 600);
        
        this.showNotification(`Switched to ${mode.charAt(0).toUpperCase() + mode.slice(1)} mode`);
    }
    
    switchLanguage(language) {
        this.currentLanguage = language;
        this.updateLanguageContent();
        this.showNotification(`Language changed to ${this.getLanguageName(language)}`);
    }
    
    getLanguageName(code) {
        const languages = {
            'en': 'English',
            'hi': 'हिंदी',
            'es': 'Español',
            'fr': 'Français'
        };
        return languages[code] || 'English';
    }
    
    updateLanguageContent() {
        // This would typically load language files
        // For now, we'll just update the placeholder text
        const chatInput = document.getElementById('chatInput');
        const chatbotInput = document.getElementById('chatbotInput');
        
        const placeholders = {
            'en': { globe: 'Ask about ocean data...', chatbot: 'Type your question...' },
            'hi': { globe: 'समुद्री डेटा के बारे में पूछें...', chatbot: 'अपना प्रश्न टाइप करें...' },
            'es': { globe: 'Pregunta sobre datos oceánicos...', chatbot: 'Escribe tu pregunta...' },
            'fr': { globe: 'Demandez des données océaniques...', chatbot: 'Tapez votre question...' }
        };
        
        if (chatInput) {
            chatInput.placeholder = placeholders[this.currentLanguage]?.globe || placeholders['en'].globe;
        }
        if (chatbotInput) {
            chatbotInput.placeholder = placeholders[this.currentLanguage]?.chatbot || placeholders['en'].chatbot;
        }
    }
    
    initializeGlobe() {
        this.generateARGOFloats();
        this.renderGlobe();
    }
    
    generateARGOFloats() {
        this.argoFloats = [];
        const numFloats = 50;
        
        for (let i = 0; i < numFloats; i++) {
            const angle = (Math.PI * 2 * i) / numFloats + Math.random() * 0.5;
            const radius = 250 + Math.random() * 50;
            
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            this.argoFloats.push({
                id: `290${String(i).padStart(4, '0')}`,
                x: x,
                y: y,
                temperature: 20 + Math.random() * 15,
                salinity: 34 + Math.random() * 2,
                depth: 500 + Math.random() * 2000,
                year: 2020 + Math.floor(Math.random() * 4)
            });
        }
    }
    
    renderGlobe() {
        const globe = document.getElementById('globe');
        globe.innerHTML = '';
        
        this.argoFloats.forEach((float, index) => {
            const dot = document.createElement('div');
            dot.className = 'argo-dot';
            dot.style.left = `${300 + float.x}px`;
            dot.style.top = `${300 + float.y}px`;
            dot.dataset.floatId = float.id;
            dot.dataset.temperature = float.temperature.toFixed(1);
            dot.dataset.salinity = float.salinity.toFixed(2);
            dot.dataset.depth = float.depth.toFixed(0);
            dot.dataset.year = float.year;
            
            // Add click handler
            dot.addEventListener('click', () => {
                this.showFloatDetails(float);
            });
            
            // Add hover handler
            dot.addEventListener('mouseenter', () => {
                this.showFloatTooltip(float, dot);
            });
            
            dot.addEventListener('mouseleave', () => {
                this.hideFloatTooltip();
            });
            
            globe.appendChild(dot);
            
            // Stagger animation
            setTimeout(() => {
                dot.style.opacity = '1';
            }, index * 50);
        });
    }
    
    showFloatDetails(float) {
        const details = `
            ARGO Float: ${float.id}
            Temperature: ${float.temperature.toFixed(1)}°C
            Salinity: ${float.salinity.toFixed(2)} PSU
            Depth: ${float.depth.toFixed(0)}m
            Year: ${float.year}
        `;
        
        this.showNotification(details);
    }
    
    showFloatTooltip(float, element) {
        const tooltip = document.createElement('div');
        tooltip.className = 'float-tooltip';
        tooltip.innerHTML = `
            <strong>${float.id}</strong><br>
            ${float.temperature.toFixed(1)}°C, ${float.salinity.toFixed(2)} PSU<br>
            ${float.year}
        `;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            pointer-events: none;
            z-index: 1000;
            left: ${element.offsetLeft + 10}px;
            top: ${element.offsetTop - 40}px;
        `;
        
        document.body.appendChild(tooltip);
    }
    
    hideFloatTooltip() {
        const tooltip = document.querySelector('.float-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }
    
    updateGlobeData() {
        // Filter floats based on current filters
        const region = document.getElementById('regionFilter').value;
        const year = document.getElementById('yearFilter').value;
        const parameter = document.getElementById('parameterFilter').value;
        
        // Update globe visualization based on filters
        this.renderGlobe();
    }
    
    handleGlobeChatInput() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            // Expand chat overlay
            const overlay = document.getElementById('chatOverlay');
            overlay.classList.add('expanded');
            
            // Switch to chatbot tab after a delay
            setTimeout(() => {
                this.switchTab('chatbot');
                // Set the message in chatbot input
                document.getElementById('chatbotInput').value = message;
                this.handleChatbotInput();
            }, 1000);
        }
    }
    
    handleChatbotInput() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (message) {
            this.addMessage('user', message);
            input.value = '';
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Generate response after delay
            setTimeout(() => {
                this.hideTypingIndicator();
                this.generateResponse(message);
            }, 1500);
        }
    }
    
    addMessage(role, content) {
        const conversationArea = document.getElementById('conversationArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = content;
        
        if (role === 'assistant') {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.innerHTML = `
                <button class="action-btn" onclick="app.copyMessage(this)">
                    <i class="fas fa-copy"></i> Copy
                </button>
                <button class="action-btn" onclick="app.exportMessage(this)">
                    <i class="fas fa-download"></i> Export
                </button>
                <button class="action-btn" onclick="app.playAudio(this)">
                    <i class="fas fa-volume-up"></i> Audio
                </button>
            `;
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(actionsDiv);
        } else {
            messageDiv.appendChild(contentDiv);
        }
        
        conversationArea.appendChild(messageDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;
        
        this.chatHistory.push({ role, content, timestamp: new Date() });
    }
    
    showTypingIndicator() {
        const conversationArea = document.getElementById('conversationArea');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-message';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        conversationArea.appendChild(typingDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;
    }
    
    hideTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }
    
    generateResponse(query) {
        // Mock response generation based on query and mode
        const responses = this.getModeResponses();
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        this.addMessage('assistant', response);
    }
    
    getModeResponses() {
        const responses = {
            explorer: [
                "That's a fascinating question about ocean data! Let me show you some interesting patterns I've found.",
                "Great question! The ocean is full of amazing discoveries. Here's what the data reveals...",
                "I love exploring ocean mysteries! Let me break down what we know about this topic.",
                "The ocean never ceases to amaze! Here's what the ARGO float data tells us..."
            ],
            navigator: [
                "Based on current oceanographic data, here are the key insights for navigation...",
                "The sea conditions show some interesting patterns that could affect your route...",
                "Let me analyze the latest ocean data to help with your navigation planning...",
                "Here's what the ocean data reveals about current conditions in your area..."
            ],
            researcher: [
                "The data analysis reveals significant patterns in the oceanographic parameters...",
                "Based on the ARGO float measurements, here are the key findings...",
                "The statistical analysis of ocean data shows the following trends...",
                "Research data indicates several important correlations in the oceanographic variables..."
            ]
        };
        
        return responses[this.currentMode] || responses.explorer;
    }
    
    updateSuggestedPrompts() {
        const promptsContainer = document.getElementById('suggestedPrompts');
        const prompts = this.getModePrompts();
        
        promptsContainer.innerHTML = '';
        
        prompts.forEach((prompt, index) => {
            const card = document.createElement('div');
            card.className = 'prompt-card stagger-item';
            card.innerHTML = `
                <h4>${prompt.title}</h4>
                <p>${prompt.description}</p>
            `;
            
            card.addEventListener('click', () => {
                document.getElementById('chatbotInput').value = prompt.query;
                this.handleChatbotInput();
            });
            
            promptsContainer.appendChild(card);
        });
    }
    
    getModePrompts() {
        const prompts = {
            explorer: [
                {
                    title: "Ocean Mysteries",
                    description: "Discover fascinating ocean phenomena",
                    query: "What are the most interesting ocean mysteries?"
                },
                {
                    title: "Marine Life",
                    description: "Learn about ocean creatures",
                    query: "Tell me about marine life in different ocean zones"
                },
                {
                    title: "Ocean Colors",
                    description: "Why is the ocean blue?",
                    query: "Why does the ocean appear blue and how does it change?"
                }
            ],
            navigator: [
                {
                    title: "Weather Patterns",
                    description: "Current ocean weather conditions",
                    query: "What are the current ocean weather conditions?"
                },
                {
                    title: "Sea Routes",
                    description: "Optimal navigation paths",
                    query: "What are the best sea routes for navigation?"
                },
                {
                    title: "Tidal Information",
                    description: "Tide and current data",
                    query: "Show me tidal and current information"
                }
            ],
            researcher: [
                {
                    title: "Data Analysis",
                    description: "Statistical ocean data analysis",
                    query: "Perform statistical analysis of ocean temperature data"
                },
                {
                    title: "Climate Trends",
                    description: "Long-term climate patterns",
                    query: "Analyze long-term climate trends in ocean data"
                },
                {
                    title: "Research Insights",
                    description: "Scientific research findings",
                    query: "What are the latest research findings in oceanography?"
                }
            ]
        };
        
        return prompts[this.currentMode] || prompts.explorer;
    }
    
    copyMessage(button) {
        const message = button.closest('.message').querySelector('.message-content').textContent;
        navigator.clipboard.writeText(message).then(() => {
            this.showNotification('Message copied to clipboard!');
        });
    }
    
    exportMessage(button) {
        const message = button.closest('.message').querySelector('.message-content').textContent;
        const blob = new Blob([message], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'floatchat-message.txt';
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Message exported!');
    }
    
    playAudio(button) {
        const message = button.closest('.message').querySelector('.message-content').textContent;
        // This would integrate with a text-to-speech service
        this.showNotification('Audio playback started');
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('slide-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showLoginModal() {
        this.showNotification('Login modal would open here');
    }
    
    showSignupModal() {
        this.showNotification('Signup modal would open here');
    }
    
    loadModeSettings() {
        // Load saved mode preferences
        const savedMode = localStorage.getItem('floatChatMode');
        if (savedMode) {
            this.switchMode(savedMode);
            document.getElementById('modeSelect').value = savedMode;
        }
    }
    
    setupLanguageSupport() {
        // Initialize language support
        this.updateLanguageContent();
    }
    
    initializeChatbot() {
        // Initialize chatbot with greeting
        this.addMessage('assistant', 'How may I help you?');
        this.updateSuggestedPrompts();
    }
    
    animateToChatbot() {
        // Animation for switching to chatbot
        anime({
            targets: '.tab-content',
            opacity: [0, 1],
            translateX: [100, 0],
            duration: 500,
            easing: 'easeOutExpo'
        });
    }
    
    animateToGlobe() {
        // Animation for switching to globe
        anime({
            targets: '.tab-content',
            opacity: [0, 1],
            translateX: [-100, 0],
            duration: 500,
            easing: 'easeOutExpo'
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FloatChatApp();
});
