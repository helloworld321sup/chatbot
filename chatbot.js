// Chatbot JavaScript - AI-powered conversational interface
class ChatBot {
    constructor() {
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.botStatus = document.getElementById('bot-status');
        
        // Settings
        this.settings = {
            botName: 'AI Assistant',
            responseSpeed: 'normal',
            showTimestamps: true,
            showTypingIndicator: true
        };
        
        // Load settings from localStorage
        this.loadSettings();
        
        // AI Response system
        this.responses = new ResponseSystem();
        
        // Initialize event listeners
        this.initializeEventListeners();
        
        // Initialize theme
        this.initializeTheme();
    }
    
    initializeEventListeners() {
        // Send message events
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const message = e.target.getAttribute('data-message');
                this.messageInput.value = message;
                this.sendMessage();
            });
        });
        
        // Header controls
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('clear-chat').addEventListener('click', () => this.clearChat());
        document.getElementById('settings-btn').addEventListener('click', () => this.openSettings());
        
        // Settings modal
        document.getElementById('close-settings').addEventListener('click', () => this.closeSettings());
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());
        
        // Click outside modal to close
        document.getElementById('settings-modal').addEventListener('click', (e) => {
            if (e.target.id === 'settings-modal') this.closeSettings();
        });
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        // Clear input and disable send button
        this.messageInput.value = '';
        this.sendButton.disabled = true;
        
        // Add user message
        this.addMessage(message, 'user');
        
        // Show typing indicator
        if (this.settings.showTypingIndicator) {
            this.showTypingIndicator();
        }
        
        // Get response delay based on settings
        const delay = this.getResponseDelay();
        
        // Generate AI response
        setTimeout(async () => {
            const response = await this.responses.generateResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }, delay);
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = this.formatMessage(text);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.settings.showTimestamps ? this.getCurrentTime() : '';
        
        content.appendChild(textDiv);
        if (this.settings.showTimestamps) {
            content.appendChild(timeDiv);
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMessage(text) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        text = text.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
        
        // Convert newlines to <br>
        text = text.replace(/\n/g, '<br>');
        
        // Format code blocks (```code```)
        text = text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // Format inline code (`code`)
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Format bold text (**text**)
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Format italic text (*text*)
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return text;
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    getResponseDelay() {
        const delays = {
            fast: 500,
            normal: 1500,
            slow: 3000
        };
        return delays[this.settings.responseSpeed] || 1500;
    }
    
    toggleTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('#theme-toggle i');
        
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('chatbot-theme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('chatbot-theme', 'dark');
        }
    }
    
    initializeTheme() {
        const savedTheme = localStorage.getItem('chatbot-theme');
        const themeIcon = document.querySelector('#theme-toggle i');
        
        if (savedTheme === 'dark') {
            document.body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'fas fa-sun';
        }
    }
    
    clearChat() {
        // Keep only the initial bot message
        const messages = this.chatMessages.querySelectorAll('.message');
        for (let i = 1; i < messages.length; i++) {
            messages[i].remove();
        }
    }
    
    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('show');
        
        // Populate current settings
        document.getElementById('bot-name').value = this.settings.botName;
        document.getElementById('response-speed').value = this.settings.responseSpeed;
        document.getElementById('show-timestamps').checked = this.settings.showTimestamps;
        document.getElementById('typing-indicator-setting').checked = this.settings.showTypingIndicator;
    }
    
    closeSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('show');
    }
    
    saveSettings() {
        this.settings.botName = document.getElementById('bot-name').value;
        this.settings.responseSpeed = document.getElementById('response-speed').value;
        this.settings.showTimestamps = document.getElementById('show-timestamps').checked;
        this.settings.showTypingIndicator = document.getElementById('typing-indicator-setting').checked;
        
        // Update UI
        document.querySelector('.bot-info h1').textContent = this.settings.botName;
        
        // Save to localStorage
        localStorage.setItem('chatbot-settings', JSON.stringify(this.settings));
        
        this.closeSettings();
    }
    
    loadSettings() {
        const saved = localStorage.getItem('chatbot-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
            document.querySelector('.bot-info h1').textContent = this.settings.botName;
        }
    }
}

// AI Response System
class ResponseSystem {
    constructor() {
        this.conversationHistory = [];
        this.topics = {
            greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
            farewell: ['bye', 'goodbye', 'see you', 'farewell', 'take care'],
            thanks: ['thank you', 'thanks', 'appreciate', 'grateful'],
            programming: ['code', 'programming', 'javascript', 'python', 'html', 'css', 'algorithm', 'function'],
            math: ['calculate', 'math', 'mathematics', 'equation', 'solve', 'number'],
            weather: ['weather', 'temperature', 'rain', 'sunny', 'cloudy', 'forecast'],
            jokes: ['joke', 'funny', 'humor', 'laugh', 'comedy'],
            facts: ['fact', 'interesting', 'tell me about', 'explain', 'what is'],
            help: ['help', 'assist', 'support', 'how to', 'can you']
        };
        
        this.responses = {
            greeting: [
                "Hello! How can I help you today? 😊",
                "Hi there! What would you like to talk about?",
                "Hey! I'm here to assist you with anything you need.",
                "Good to see you! How can I make your day better?"
            ],
            farewell: [
                "Goodbye! Have a wonderful day! 👋",
                "See you later! Feel free to come back anytime.",
                "Take care! It was great chatting with you.",
                "Farewell! Hope I was helpful today."
            ],
            thanks: [
                "You're very welcome! Happy to help! 😊",
                "No problem at all! That's what I'm here for.",
                "My pleasure! Is there anything else you'd like to know?",
                "Glad I could help! Feel free to ask more questions."
            ],
            programming: [
                "I'd love to help with programming! What language or concept are you working with?",
                "Programming is fascinating! Are you looking for help with a specific problem or learning something new?",
                "Great choice! Coding opens up so many possibilities. What programming topic interests you?",
                "I'm here to help with your coding journey! What would you like to explore?"
            ],
            math: [
                "Math can be fun! What kind of problem are you working on?",
                "I'm ready to help with mathematics! What calculation or concept do you need assistance with?",
                "Numbers and equations are my specialty! What mathematical challenge can I help you solve?",
                "Let's tackle some math together! What do you need help calculating or understanding?"
            ],
            weather: [
                "I don't have access to real-time weather data, but I can help you understand weather patterns! What would you like to know?",
                "Weather is always interesting to discuss! While I can't give current conditions, I can explain meteorological concepts.",
                "I'd love to chat about weather! Though I don't have live data, I can share weather-related information.",
                "Weather talk! I can't provide current forecasts, but I'm happy to discuss climate and weather science."
            ],
            jokes: [
                "Why don't scientists trust atoms? Because they make up everything! 😄",
                "I told my computer a joke about UDP... I don't know if it got it! 💻",
                "Why did the programmer quit his job? He didn't get arrays! 🤓",
                "What do you call a bear with no teeth? A gummy bear! 🐻",
                "Why don't eggs tell jokes? They'd crack each other up! 🥚"
            ],
            facts: [
                "Here's a fun fact: Honey never spoils! Archaeologists have found edible honey in ancient Egyptian tombs! 🍯",
                "Did you know? Octopuses have three hearts and blue blood! 🐙",
                "Interesting fact: Bananas are berries, but strawberries aren't! 🍌",
                "Cool fact: A group of flamingos is called a 'flamboyance'! 🦩",
                "Amazing fact: There are more possible games of chess than atoms in the observable universe! ♟️"
            ],
            help: [
                "I'm here to help! I can assist with:\n• General questions and conversations\n• Programming and technology\n• Math problems\n• Creative writing\n• Fun facts and jokes\n\nWhat would you like help with?",
                "Happy to assist! I can help you with various topics like coding, math, general questions, or just have a friendly chat. What interests you?",
                "I'm your AI assistant! I can provide information, help solve problems, answer questions, or just chat. How can I help you today?",
                "Need assistance? I'm here for you! Whether it's learning something new, solving a problem, or having a conversation, I'm ready to help."
            ],
            default: [
                "That's interesting! Tell me more about that.",
                "I'd love to learn more about your thoughts on this topic.",
                "That's a great point! What else would you like to discuss?",
                "Interesting perspective! How can I help you explore this further?",
                "I'm listening! What would you like to know or talk about?",
                "That's fascinating! Is there a specific aspect you'd like to dive deeper into?",
                "Thanks for sharing! What questions do you have about this?",
                "I appreciate you bringing that up! How can I assist you with it?"
            ]
        };
    }
    
    async generateResponse(userMessage) {
        // Add to conversation history
        this.conversationHistory.push({ role: 'user', message: userMessage });
        
        // Analyze message and determine topic
        const topic = this.analyzeTopic(userMessage.toLowerCase());
        
        // Generate contextual response
        let response = this.getRandomResponse(topic);
        
        // Add some contextual intelligence
        response = this.addContext(response, userMessage, topic);
        
        // Add to conversation history
        this.conversationHistory.push({ role: 'bot', message: response });
        
        // Keep history manageable
        if (this.conversationHistory.length > 20) {
            this.conversationHistory = this.conversationHistory.slice(-20);
        }
        
        return response;
    }
    
    analyzeTopic(message) {
        for (const [topic, keywords] of Object.entries(this.topics)) {
            if (keywords.some(keyword => message.includes(keyword))) {
                return topic;
            }
        }
        return 'default';
    }
    
    getRandomResponse(topic) {
        const responses = this.responses[topic] || this.responses.default;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    addContext(response, userMessage, topic) {
        // Add specific contextual responses based on patterns
        if (topic === 'programming') {
            if (userMessage.toLowerCase().includes('javascript')) {
                response += "\n\nJavaScript is a versatile language! Are you working on web development, Node.js, or something else?";
            } else if (userMessage.toLowerCase().includes('python')) {
                response += "\n\nPython is excellent for beginners and experts alike! What kind of project are you working on?";
            }
        }
        
        if (topic === 'math' && /\d/.test(userMessage)) {
            response += "\n\nI see you mentioned some numbers! Feel free to share the specific calculation you need help with.";
        }
        
        // Add personality based on conversation history
        const recentMessages = this.conversationHistory.slice(-6);
        const userMessages = recentMessages.filter(m => m.role === 'user');
        
        if (userMessages.length > 2) {
            const enthusiasm = [
                "\n\nI'm really enjoying our conversation! 😊",
                "\n\nYou ask great questions!",
                "\n\nThis is a fun discussion!",
                "\n\nI love chatting with curious people like you!"
            ];
            
            if (Math.random() < 0.3) { // 30% chance to add enthusiasm
                response += enthusiasm[Math.floor(Math.random() * enthusiasm.length)];
            }
        }
        
        return response;
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});

// Add some fun Easter eggs
document.addEventListener('keydown', (e) => {
    // Konami code Easter egg
    const konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    if (!window.konamiSequence) window.konamiSequence = [];
    
    window.konamiSequence.push(e.keyCode);
    if (window.konamiSequence.length > konamiCode.length) {
        window.konamiSequence.shift();
    }
    
    if (window.konamiSequence.join(',') === konamiCode.join(',')) {
        // Easter egg activated!
        const messages = document.getElementById('chat-messages');
        const easterEgg = document.createElement('div');
        easterEgg.className = 'message bot-message';
        easterEgg.innerHTML = `
            <div class="message-avatar">🎉</div>
            <div class="message-content">
                <div class="message-text">
                    🎊 Konami Code activated! You found the secret! 🎊<br>
                    <em>You're clearly a person of culture and gaming history!</em>
                </div>
            </div>
        `;
        messages.appendChild(easterEgg);
        messages.scrollTop = messages.scrollHeight;
        window.konamiSequence = [];
    }
});
