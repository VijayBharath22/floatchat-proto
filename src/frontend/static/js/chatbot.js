// Chatbot functionality and conversation management
class ChatbotManager {
    constructor() {
        this.conversationHistory = [];
        this.currentMode = 'explorer';
        this.isTyping = false;
        this.suggestedPrompts = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadConversationHistory();
        this.updateModePrompts();
        this.setupTypingIndicator();
    }
    
    setupEventListeners() {
        // Chat input handling
        const chatbotInput = document.getElementById('chatbotInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
            
            chatbotInput.addEventListener('input', () => {
                this.handleInputChange();
            });
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // Suggested prompts
        document.addEventListener('click', (e) => {
            if (e.target.closest('.prompt-card')) {
                const card = e.target.closest('.prompt-card');
                const query = card.dataset.query;
                if (query) {
                    this.useSuggestedPrompt(query);
                }
            }
        });
    }
    
    handleInputChange() {
        const input = document.getElementById('chatbotInput');
        const sendBtn = document.getElementById('sendBtn');
        
        if (input.value.trim()) {
            sendBtn.style.opacity = '1';
            sendBtn.style.transform = 'scale(1)';
        } else {
            sendBtn.style.opacity = '0.5';
            sendBtn.style.transform = 'scale(0.9)';
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chatbotInput');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Add user message
        this.addMessage('user', message);
        
        // Clear input
        input.value = '';
        this.handleInputChange();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Generate response
        setTimeout(() => {
            this.generateResponse(message);
        }, 1000 + Math.random() * 2000); // Random delay for realism
    }
    
    addMessage(role, content, options = {}) {
        const conversationArea = document.getElementById('conversationArea');
        if (!conversationArea) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (options.isTyping) {
            contentDiv.innerHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
        } else {
            contentDiv.textContent = content;
        }
        
        if (role === 'assistant' && !options.isTyping) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.innerHTML = `
                <button class="action-btn" onclick="chatbotManager.copyMessage(this)" title="Copy message">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn" onclick="chatbotManager.exportMessage(this)" title="Export message">
                    <i class="fas fa-download"></i>
                </button>
                <button class="action-btn" onclick="chatbotManager.playAudio(this)" title="Play audio">
                    <i class="fas fa-volume-up"></i>
                </button>
            `;
            messageDiv.appendChild(contentDiv);
            messageDiv.appendChild(actionsDiv);
        } else {
            messageDiv.appendChild(contentDiv);
        }
        
        conversationArea.appendChild(messageDiv);
        conversationArea.scrollTop = conversationArea.scrollHeight;
        
        // Store in history
        this.conversationHistory.push({
            role,
            content,
            timestamp: new Date(),
            options
        });
        
        // Animate message appearance
        anime({
            targets: messageDiv,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 300,
            easing: 'easeOutExpo'
        });
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.addMessage('assistant', '', { isTyping: true });
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const typingMessage = document.querySelector('.message.assistant .typing-indicator');
        if (typingMessage) {
            typingMessage.closest('.message').remove();
        }
    }
    
    generateResponse(userMessage) {
        this.hideTypingIndicator();
        
        // Generate response based on mode and message content
        const response = this.createResponse(userMessage);
        
        // Simulate typing effect
        this.typeResponse(response);
    }
    
    createResponse(userMessage) {
        const responses = this.getModeResponses();
        const messageLower = userMessage.toLowerCase();
        
        // Check for specific keywords and generate contextual responses
        if (messageLower.includes('temperature') || messageLower.includes('temp')) {
            return this.generateTemperatureResponse();
        } else if (messageLower.includes('salinity') || messageLower.includes('salt')) {
            return this.generateSalinityResponse();
        } else if (messageLower.includes('depth') || messageLower.includes('deep')) {
            return this.generateDepthResponse();
        } else if (messageLower.includes('argo') || messageLower.includes('float')) {
            return this.generateARGOResponse();
        } else if (messageLower.includes('ocean') || messageLower.includes('sea')) {
            return this.generateOceanResponse();
        } else if (messageLower.includes('data') || messageLower.includes('analysis')) {
            return this.generateDataResponse();
        } else {
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }
    
    getModeResponses() {
        const responses = {
            explorer: [
                "That's a fascinating question about our oceans! 🌊 The ocean is full of incredible mysteries waiting to be discovered.",
                "Great question! The ocean is like a giant laboratory where amazing things happen every day.",
                "I love exploring ocean mysteries! Let me share some cool facts about what we know.",
                "The ocean never ceases to amaze! Here's what makes it so special...",
                "What an interesting question! The ocean is home to so many incredible phenomena.",
                "That's a wonderful question about our blue planet! Let me tell you something amazing..."
            ],
            navigator: [
                "Based on current oceanographic data, here are the key insights for your navigation...",
                "The sea conditions show some interesting patterns that could affect your route planning.",
                "Let me analyze the latest ocean data to help with your navigation decisions...",
                "Here's what the ocean data reveals about current conditions in your area...",
                "For navigation purposes, the current oceanographic conditions suggest...",
                "The latest data shows some important patterns for maritime navigation..."
            ],
            researcher: [
                "The data analysis reveals significant patterns in the oceanographic parameters...",
                "Based on the ARGO float measurements, here are the key scientific findings...",
                "The statistical analysis of ocean data shows the following trends and correlations...",
                "Research data indicates several important patterns in the oceanographic variables...",
                "The scientific literature and data analysis reveal some compelling insights...",
                "From a research perspective, the oceanographic data demonstrates..."
            ]
        };
        
        return responses[this.currentMode] || responses.explorer;
    }
    
    generateTemperatureResponse() {
        const temp = (20 + Math.random() * 15).toFixed(1);
        const responses = {
            explorer: `The ocean temperature is around ${temp}°C! 🌡️ That's like a perfect swimming pool temperature. The ocean acts like a giant heater for our planet!`,
            navigator: `Current ocean temperature readings show ${temp}°C. This affects water density and can influence navigation routes and fuel efficiency.`,
            researcher: `Temperature analysis reveals ${temp}°C with standard deviation of ±2.1°C. This correlates with seasonal patterns and regional climate variations.`
        };
        return responses[this.currentMode] || responses.explorer;
    }
    
    generateSalinityResponse() {
        const salinity = (34 + Math.random() * 2).toFixed(2);
        const responses = {
            explorer: `Ocean salinity is about ${salinity} PSU! 🧂 That's like adding 35 grams of salt to every liter of water. Pretty salty!`,
            navigator: `Salinity levels at ${salinity} PSU affect water density and buoyancy, important factors for vessel performance.`,
            researcher: `Salinity measurements show ${salinity} PSU with regional variations of ±0.5 PSU, indicating freshwater input patterns.`
        };
        return responses[this.currentMode] || responses.explorer;
    }
    
    generateDepthResponse() {
        const depth = (500 + Math.random() * 2000).toFixed(0);
        const responses = {
            explorer: `The ocean goes down to about ${depth} meters here! 🏊‍♂️ That's deeper than most mountains are tall!`,
            navigator: `Water depth of ${depth}m affects navigation safety and requires appropriate charting and depth sounders.`,
            researcher: `Depth measurements show ${depth}m with bathymetric variations indicating geological features and sediment distribution.`
        };
        return responses[this.currentMode] || responses.explorer;
    }
    
    generateARGOResponse() {
        const responses = {
            explorer: `ARGO floats are like ocean robots! 🤖 They dive deep, collect data, and surface to send information to scientists. Pretty cool, right?`,
            navigator: `ARGO float data provides real-time oceanographic information crucial for maritime operations and weather forecasting.`,
            researcher: `ARGO profiling floats provide high-resolution vertical profiles of temperature, salinity, and pressure, enabling comprehensive ocean monitoring.`
        };
        return responses[this.currentMode] || responses.explorer;
    }
    
    generateOceanResponse() {
        const responses = {
            explorer: `The ocean is amazing! 🌊 It covers 71% of Earth and contains 97% of our planet's water. It's like a giant, living system!`,
            navigator: `Ocean conditions directly impact maritime operations, weather patterns, and global climate systems.`,
            researcher: `The ocean is a complex system involving physical, chemical, and biological processes that regulate Earth's climate.`
        };
        return responses[this.currentMode] || responses.explorer;
    }
    
    generateDataResponse() {
        const responses = {
            explorer: `Data helps us understand the ocean better! 📊 It's like putting together a giant puzzle of how our planet works.`,
            navigator: `Oceanographic data analysis provides critical insights for operational planning and risk assessment.`,
            researcher: `Statistical analysis of oceanographic data reveals trends, anomalies, and correlations essential for scientific understanding.`
        };
        return responses[this.currentMode] || responses.explorer;
    }
    
    typeResponse(response) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message assistant';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        actionsDiv.innerHTML = `
            <button class="action-btn" onclick="chatbotManager.copyMessage(this)" title="Copy message">
                <i class="fas fa-copy"></i>
            </button>
            <button class="action-btn" onclick="chatbotManager.exportMessage(this)" title="Export message">
                <i class="fas fa-download"></i>
            </button>
            <button class="action-btn" onclick="chatbotManager.playAudio(this)" title="Play audio">
                <i class="fas fa-volume-up"></i>
            </button>
        `;
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(actionsDiv);
        
        document.getElementById('conversationArea').appendChild(messageDiv);
        
        // Type the response character by character
        let index = 0;
        const typeInterval = setInterval(() => {
            if (index < response.length) {
                contentDiv.textContent += response[index];
                index++;
            } else {
                clearInterval(typeInterval);
                this.isTyping = false;
            }
        }, 30);
        
        // Store in history
        this.conversationHistory.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });
        
        // Scroll to bottom
        const conversationArea = document.getElementById('conversationArea');
        conversationArea.scrollTop = conversationArea.scrollHeight;
        
        // Animate message appearance
        anime({
            targets: messageDiv,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 300,
            easing: 'easeOutExpo'
        });
    }
    
    useSuggestedPrompt(query) {
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.value = query;
            input.focus();
            this.handleInputChange();
        }
    }
    
    updateModePrompts() {
        this.suggestedPrompts = this.getModePrompts();
        this.renderSuggestedPrompts();
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
                },
                {
                    title: "Ocean Waves",
                    description: "How do waves form?",
                    query: "How do ocean waves form and what makes them different?"
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
                },
                {
                    title: "Storm Tracking",
                    description: "Ocean storm patterns",
                    query: "What are the current storm patterns in the ocean?"
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
                },
                {
                    title: "Ocean Circulation",
                    description: "Global ocean circulation patterns",
                    query: "Explain global ocean circulation patterns and their effects"
                }
            ]
        };
        
        return prompts[this.currentMode] || prompts.explorer;
    }
    
    renderSuggestedPrompts() {
        const container = document.getElementById('suggestedPrompts');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.suggestedPrompts.forEach((prompt, index) => {
            const card = document.createElement('div');
            card.className = 'prompt-card stagger-item';
            card.dataset.query = prompt.query;
            card.innerHTML = `
                <h4>${prompt.title}</h4>
                <p>${prompt.description}</p>
            `;
            
            // Stagger animation
            card.style.animationDelay = `${index * 0.1}s`;
            
            container.appendChild(card);
        });
    }
    
    copyMessage(button) {
        const message = button.closest('.message').querySelector('.message-content').textContent;
        navigator.clipboard.writeText(message).then(() => {
            this.showNotification('Message copied to clipboard!');
        }).catch(() => {
            this.showNotification('Failed to copy message');
        });
    }
    
    exportMessage(button) {
        const message = button.closest('.message').querySelector('.message-content').textContent;
        const timestamp = new Date().toISOString().split('T')[0];
        const blob = new Blob([message], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `floatchat-message-${timestamp}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Message exported!');
    }
    
    playAudio(button) {
        const message = button.closest('.message').querySelector('.message-content').textContent;
        
        // Check if speech synthesis is supported
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            
            // Try to use a natural voice
            const voices = speechSynthesis.getVoices();
            const naturalVoice = voices.find(voice => 
                voice.name.includes('Google') || 
                voice.name.includes('Microsoft') ||
                voice.name.includes('Natural')
            );
            
            if (naturalVoice) {
                utterance.voice = naturalVoice;
            }
            
            speechSynthesis.speak(utterance);
            this.showNotification('Playing audio...');
        } else {
            this.showNotification('Audio playback not supported in this browser');
        }
    }
    
    showNotification(message) {
        if (window.app) {
            window.app.showNotification(message);
        }
    }
    
    loadConversationHistory() {
        // Load from localStorage
        const saved = localStorage.getItem('floatChatHistory');
        if (saved) {
            this.conversationHistory = JSON.parse(saved);
            this.renderHistory();
        } else {
            // Add welcome message
            this.addMessage('assistant', 'How may I help you?');
        }
    }
    
    saveConversationHistory() {
        localStorage.setItem('floatChatHistory', JSON.stringify(this.conversationHistory));
    }
    
    renderHistory() {
        const conversationArea = document.getElementById('conversationArea');
        if (!conversationArea) return;
        
        conversationArea.innerHTML = '';
        
        this.conversationHistory.forEach(entry => {
            this.addMessage(entry.role, entry.content, entry.options);
        });
    }
    
    clearHistory() {
        this.conversationHistory = [];
        localStorage.removeItem('floatChatHistory');
        document.getElementById('conversationArea').innerHTML = '';
        this.addMessage('assistant', 'How may I help you?');
        this.showNotification('Conversation history cleared');
    }
    
    exportConversation() {
        const conversation = this.conversationHistory.map(entry => ({
            role: entry.role,
            content: entry.content,
            timestamp: entry.timestamp
        }));
        
        const blob = new Blob([JSON.stringify(conversation, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `floatchat-conversation-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Conversation exported!');
    }
    
    setMode(mode) {
        this.currentMode = mode;
        this.updateModePrompts();
        this.showNotification(`Switched to ${mode} mode`);
    }
}

// Initialize chatbot manager
let chatbotManager;
document.addEventListener('DOMContentLoaded', () => {
    chatbotManager = new ChatbotManager();
});
