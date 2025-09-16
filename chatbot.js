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

// AI Response System with Knowledge Base
class ResponseSystem {
    constructor() {
        this.conversationHistory = [];
        this.knowledgeBase = new KnowledgeBase();
        this.topics = {
            greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
            farewell: ['bye', 'goodbye', 'see you', 'farewell', 'take care'],
            thanks: ['thank you', 'thanks', 'appreciate', 'grateful'],
            programming: ['code', 'programming', 'javascript', 'python', 'html', 'css', 'algorithm', 'function', 'variable', 'loop', 'array', 'object'],
            math: ['calculate', 'math', 'mathematics', 'equation', 'solve', 'number', 'formula', 'geometry', 'algebra', 'calculus'],
            science: ['science', 'physics', 'chemistry', 'biology', 'astronomy', 'molecule', 'atom', 'planet', 'evolution'],
            history: ['history', 'historical', 'ancient', 'medieval', 'war', 'empire', 'civilization', 'century', 'year'],
            geography: ['country', 'city', 'continent', 'ocean', 'mountain', 'river', 'capital', 'population'],
            technology: ['computer', 'internet', 'ai', 'artificial intelligence', 'machine learning', 'software', 'hardware'],
            weather: ['weather', 'temperature', 'rain', 'sunny', 'cloudy', 'forecast'],
            jokes: ['joke', 'funny', 'humor', 'laugh', 'comedy'],
            facts: ['fact', 'interesting', 'tell me about', 'explain', 'what is', 'who is', 'when did', 'where is', 'how does'],
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
        
        // First, try to get a knowledge-based response
        const knowledgeResponse = this.knowledgeBase.query(userMessage);
        if (knowledgeResponse) {
            this.conversationHistory.push({ role: 'bot', message: knowledgeResponse });
            return knowledgeResponse;
        }
        
        // Check if it's a calculation
        const mathResult = this.handleMathQuery(userMessage);
        if (mathResult) {
            this.conversationHistory.push({ role: 'bot', message: mathResult });
            return mathResult;
        }
        
        // Check if user is asking for web search
        const webSearchResult = await this.handleWebSearch(userMessage);
        if (webSearchResult) {
            this.conversationHistory.push({ role: 'bot', message: webSearchResult });
            return webSearchResult;
        }
        
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
    
    handleMathQuery(message) {
        // Handle basic math operations
        const mathPatterns = [
            /what is (\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/i,
            /calculate (\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/i,
            /(\d+(?:\.\d+)?)\s*([+\-*/])\s*(\d+(?:\.\d+)?)/,
        ];
        
        for (const pattern of mathPatterns) {
            const match = message.match(pattern);
            if (match) {
                const num1 = parseFloat(match[1]);
                const operator = match[2];
                const num2 = parseFloat(match[3]);
                
                let result;
                switch (operator) {
                    case '+': result = num1 + num2; break;
                    case '-': result = num1 - num2; break;
                    case '*': result = num1 * num2; break;
                    case '/': 
                        if (num2 === 0) return "I can't divide by zero! That would break the universe! 🌌";
                        result = num1 / num2; 
                        break;
                    default: return null;
                }
                
                return `${num1} ${operator} ${num2} = **${result}**\n\nIs there anything else you'd like me to calculate? 🧮`;
            }
        }
        
        // Handle percentage calculations
        const percentMatch = message.match(/what is (\d+(?:\.\d+)?)%?\s*of\s*(\d+(?:\.\d+)?)/i);
        if (percentMatch) {
            const percent = parseFloat(percentMatch[1]);
            const number = parseFloat(percentMatch[2]);
            const result = (percent / 100) * number;
            return `${percent}% of ${number} = **${result}**\n\nNeed help with more percentage calculations? 📊`;
        }
        
        return null;
    }
    
    async handleWebSearch(message) {
        const searchTriggers = [
            /search for/i,
            /look up/i,
            /find information about/i,
            /what's the latest/i,
            /current news about/i,
            /recent information/i,
            /web search/i,
            /google/i,
            /latest news/i,
            /current events/i,
            /today's news/i,
            /what happened/i,
            /breaking news/i
        ];
        
        const needsWebSearch = searchTriggers.some(trigger => trigger.test(message));
        
        // Also check for questions that might need current information
        const currentInfoQuestions = [
            /what's happening/i,
            /current price/i,
            /stock price/i,
            /weather in/i,
            /temperature in/i,
            /news about/i,
            /latest on/i
        ];
        
        const needsCurrentInfo = currentInfoQuestions.some(trigger => trigger.test(message));
        
        if (needsWebSearch || needsCurrentInfo) {
            // Extract search query
            let searchQuery = message;
            
            // Clean up the search query
            searchQuery = searchQuery.replace(/search for|look up|find information about|what's the latest|google|web search/gi, '').trim();
            searchQuery = searchQuery.replace(/^(about|on|for)\s+/i, '').trim();
            
            if (searchQuery.length < 2) {
                return "I'd be happy to search the web for you! Could you please specify what you'd like me to search for? 🔍";
            }
            
            try {
                const searchResults = await this.performWebSearch(searchQuery);
                return searchResults;
            } catch (error) {
                return `I apologize, but I'm having trouble accessing web search right now. However, I can still help with information from my knowledge base! Try asking me about: science, history, programming, math, or general knowledge topics. 🤖`;
            }
        }
        
        return null;
    }
    
    async performWebSearch(query) {
        // Simulate web search with a realistic delay and response
        // In a real implementation, you would integrate with a search API like:
        // - Google Custom Search API
        // - Bing Search API  
        // - DuckDuckGo API
        // - SerpAPI
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const mockResults = this.generateMockSearchResults(query);
                resolve(mockResults);
            }, 1000);
        });
    }
    
    generateMockSearchResults(query) {
        // This is a mock implementation. In production, you'd use a real search API
        const searchTopics = {
            'weather': `🌤️ **Web Search Results for "${query}"**\n\n**Note:** I don't have access to real-time weather data, but here are some helpful resources:\n\n• **Weather.com** - Current conditions and forecasts\n• **AccuWeather** - Detailed weather information\n• **National Weather Service** - Official weather data\n\nFor current weather, I recommend checking these sites directly or asking a voice assistant with real-time data access! 🌡️`,
            
            'news': `📰 **Web Search Results for "${query}"**\n\n**Note:** I don't have access to real-time news, but here are trusted news sources:\n\n• **BBC News** - International news coverage\n• **Reuters** - Global news and business\n• **Associated Press** - Breaking news updates\n• **NPR** - In-depth news analysis\n\nFor the latest news, please visit these reputable news websites directly! 📺`,
            
            'stock': `📈 **Web Search Results for "${query}"**\n\n**Note:** I cannot provide real-time stock prices, but here are reliable financial resources:\n\n• **Yahoo Finance** - Stock quotes and market data\n• **Google Finance** - Market information\n• **Bloomberg** - Financial news and data\n• **MarketWatch** - Investment insights\n\nFor current stock prices, please check these financial websites directly! 💼`,
            
            'programming': `💻 **Web Search Results for "${query}"**\n\nI found some great programming resources:\n\n• **MDN Web Docs** - Comprehensive web development documentation\n• **Stack Overflow** - Programming Q&A community\n• **GitHub** - Code repositories and examples\n• **W3Schools** - Web development tutorials\n\nI also have programming knowledge in my database! Feel free to ask me specific coding questions. 🚀`,
            
            'science': `🔬 **Web Search Results for "${query}"**\n\nGreat science resources I found:\n\n• **NASA** - Space and earth science information\n• **National Geographic** - Nature and science articles\n• **Scientific American** - Latest scientific discoveries\n• **Nature.com** - Peer-reviewed research\n\nI also have extensive science knowledge! Ask me about physics, chemistry, biology, or astronomy. 🌟`,
            
            'default': `🔍 **Web Search Results for "${query}"**\n\n**Important Note:** I'm currently running in demo mode and don't have access to live web search. However, I can:\n\n• Answer questions from my extensive knowledge base\n• Help with math calculations\n• Explain scientific concepts\n• Discuss programming topics\n• Share historical information\n\n**For real-time web search, you can:**\n• Use Google, Bing, or DuckDuckGo directly\n• Try voice assistants with web access\n• Check specific websites for current information\n\nWhat would you like to know from my knowledge base instead? 🤖`
        };
        
        // Determine which type of search this is
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('weather') || lowerQuery.includes('temperature') || lowerQuery.includes('forecast')) {
            return searchTopics.weather;
        } else if (lowerQuery.includes('news') || lowerQuery.includes('breaking') || lowerQuery.includes('latest')) {
            return searchTopics.news;
        } else if (lowerQuery.includes('stock') || lowerQuery.includes('price') || lowerQuery.includes('market')) {
            return searchTopics.stock;
        } else if (lowerQuery.includes('code') || lowerQuery.includes('programming') || lowerQuery.includes('javascript') || lowerQuery.includes('python')) {
            return searchTopics.programming;
        } else if (lowerQuery.includes('science') || lowerQuery.includes('research') || lowerQuery.includes('study')) {
            return searchTopics.science;
        } else {
            return searchTopics.default.replace('${query}', query);
        }
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

// Knowledge Base System
class KnowledgeBase {
    constructor() {
        this.knowledge = {
            // Programming & Technology
            'javascript': "JavaScript is a high-level programming language primarily used for web development. It's interpreted, dynamic, and supports object-oriented, imperative, and functional programming styles. Created by Brendan Eich in 1995, it's now essential for both frontend and backend development (Node.js).",
            'python': "Python is a high-level, interpreted programming language known for its simplicity and readability. Created by Guido van Rossum in 1991, it's widely used in web development, data science, AI/ML, automation, and scientific computing. Its philosophy emphasizes code readability and simplicity.",
            'html': "HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure and content of web documents using elements and tags. HTML5 is the current standard, introducing semantic elements, multimedia support, and improved APIs.",
            'css': "CSS (Cascading Style Sheets) is a stylesheet language used to describe the presentation of HTML documents. It controls layout, colors, fonts, animations, and responsive design. CSS3 introduced features like flexbox, grid, animations, and media queries.",
            'artificial intelligence': "AI is the simulation of human intelligence in machines programmed to think and learn. It includes machine learning, natural language processing, computer vision, and robotics. Modern AI uses neural networks and deep learning to solve complex problems.",
            'machine learning': "Machine Learning is a subset of AI that enables computers to learn and improve from experience without being explicitly programmed. It uses algorithms to find patterns in data and make predictions. Types include supervised, unsupervised, and reinforcement learning.",
            
            // Science & Nature
            'photosynthesis': "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen. The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. This process occurs in chloroplasts and is essential for life on Earth.",
            'dna': "DNA (Deoxyribonucleic Acid) is the hereditary material in almost all living organisms. It's a double helix structure made of nucleotides containing four bases: A, T, G, C. DNA stores genetic information and instructions for building and maintaining organisms.",
            'black hole': "A black hole is a region in space where gravity is so strong that nothing, not even light, can escape. They form when massive stars collapse. The boundary around a black hole is called the event horizon. The center contains a singularity where physics breaks down.",
            'quantum physics': "Quantum physics studies matter and energy at the smallest scales. Key principles include wave-particle duality, uncertainty principle, and superposition. It explains phenomena like atomic structure, chemical bonding, and forms the basis for technologies like lasers and computers.",
            'evolution': "Evolution is the process by which species change over time through natural selection. Charles Darwin proposed this theory in 1859. Organisms with favorable traits survive and reproduce, passing these traits to offspring, leading to gradual species change.",
            
            // History & Geography
            'world war ii': "World War II (1939-1945) was the deadliest conflict in human history, involving most of the world's nations. It began with Germany's invasion of Poland and ended with Japan's surrender after atomic bombs were dropped on Hiroshima and Nagasaki.",
            'ancient egypt': "Ancient Egypt was a civilization in northeast Africa lasting over 3,000 years (c. 3100-30 BCE). Known for pyramids, hieroglyphics, mummies, and pharaohs like Tutankhamun and Cleopatra. The Nile River was central to their agriculture and culture.",
            'roman empire': "The Roman Empire (27 BCE - 476/1453 CE) was one of history's largest empires, spanning three continents. Known for engineering (aqueducts, roads), law, military organization, and cultural influence. It split into Western and Eastern (Byzantine) empires.",
            'great wall of china': "The Great Wall of China is a series of fortifications built across northern China over many dynasties. Most of what exists today was built during the Ming Dynasty (1368-1644). It's about 13,000 miles long and is a UNESCO World Heritage Site.",
            'mount everest': "Mount Everest is Earth's highest mountain at 29,032 feet (8,849 meters) above sea level. Located in the Himalayas on the border between Nepal and Tibet. First successfully climbed by Edmund Hillary and Tenzing Norgay in 1953.",
            
            // Mathematics
            'pi': "Pi (π) is a mathematical constant representing the ratio of a circle's circumference to its diameter. It's approximately 3.14159... and is an irrational number (infinite non-repeating decimals). Pi appears in many mathematical formulas and natural phenomena.",
            'fibonacci sequence': "The Fibonacci sequence is a series where each number is the sum of the two preceding ones: 0, 1, 1, 2, 3, 5, 8, 13, 21... This sequence appears frequently in nature (flower petals, tree branches, shell spirals) and art.",
            'prime numbers': "Prime numbers are natural numbers greater than 1 that have no positive divisors other than 1 and themselves. Examples: 2, 3, 5, 7, 11, 13... There are infinitely many primes, and they're fundamental to number theory and cryptography.",
            'calculus': "Calculus is a branch of mathematics focusing on rates of change (derivatives) and accumulation of quantities (integrals). Developed by Newton and Leibniz, it's essential for physics, engineering, economics, and many other fields.",
            
            // General Knowledge
            'solar system': "Our solar system consists of the Sun and eight planets: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. It also includes moons, asteroids, comets, and dwarf planets like Pluto. Formed about 4.6 billion years ago.",
            'photosynthesis': "Photosynthesis converts light energy into chemical energy in plants. Chlorophyll absorbs light, and plants use CO₂ and water to produce glucose and oxygen. This process is crucial for life on Earth as it produces oxygen and food.",
            'democracy': "Democracy is a system of government where citizens exercise power by voting. The word comes from Greek 'demos' (people) and 'kratos' (power). Types include direct democracy (citizens vote on issues) and representative democracy (elect representatives).",
            'internet': "The Internet is a global network of interconnected computers that communicate using standardized protocols. It began as ARPANET in the 1960s and became public in the 1990s. It enables email, web browsing, social media, and countless other services.",
            
            // Fun Facts
            'honey': "Honey never spoils! Archaeologists have found edible honey in ancient Egyptian tombs over 3,000 years old. Honey's low moisture content and acidic pH create an environment where bacteria cannot survive.",
            'octopus': "Octopuses have three hearts, blue blood, and eight arms with suction cups. They're incredibly intelligent, can change color and texture for camouflage, and can squeeze through any opening larger than their beak.",
            'bananas': "Bananas are technically berries, while strawberries aren't! Botanically, berries must have seeds inside their flesh. Bananas develop from a single flower with one ovary, making them true berries.",
            'sharks': "Sharks are older than trees! They've existed for over 400 million years, while trees appeared around 350 million years ago. Sharks have survived five mass extinction events.",
        };
        
        this.patterns = {
            'what is': (query) => this.findDefinition(query.replace(/what is/i, '').trim()),
            'tell me about': (query) => this.findDefinition(query.replace(/tell me about/i, '').trim()),
            'explain': (query) => this.findDefinition(query.replace(/explain/i, '').trim()),
            'who is': (query) => this.findPerson(query.replace(/who is/i, '').trim()),
            'when did': (query) => this.findHistoricalEvent(query.replace(/when did/i, '').trim()),
            'how does': (query) => this.findProcess(query.replace(/how does/i, '').trim()),
            'where is': (query) => this.findLocation(query.replace(/where is/i, '').trim()),
        };
    }
    
    query(userMessage) {
        const message = userMessage.toLowerCase().trim();
        
        // Check for direct pattern matches
        for (const [pattern, handler] of Object.entries(this.patterns)) {
            if (message.includes(pattern)) {
                const result = handler(message);
                if (result) return result;
            }
        }
        
        // Check for direct knowledge matches
        return this.findDefinition(message);
    }
    
    findDefinition(query) {
        // Remove common words and clean up query
        const cleanQuery = query.replace(/\b(the|a|an|is|are|was|were|about|of|in|on|at|to|for|with|by)\b/g, '').trim();
        
        // Direct matches
        if (this.knowledge[cleanQuery]) {
            return this.knowledge[cleanQuery] + "\n\nWould you like to know more about this topic? 🤔";
        }
        
        // Partial matches
        for (const [key, value] of Object.entries(this.knowledge)) {
            if (cleanQuery.includes(key) || key.includes(cleanQuery)) {
                return value + "\n\nIs this what you were looking for? Feel free to ask more specific questions! 💡";
            }
        }
        
        return null;
    }
    
    findPerson(query) {
        const people = {
            'albert einstein': "Albert Einstein (1879-1955) was a theoretical physicist who developed the theory of relativity. His mass-energy equivalence formula E=mc² is one of the most famous equations. He won the Nobel Prize in Physics in 1921 and is considered one of the greatest scientists of all time.",
            'leonardo da vinci': "Leonardo da Vinci (1452-1519) was an Italian Renaissance polymath - artist, inventor, engineer, scientist. Famous for paintings like the Mona Lisa and The Last Supper, he also designed flying machines, studied anatomy, and made scientific observations centuries ahead of his time.",
            'marie curie': "Marie Curie (1867-1934) was a physicist and chemist who conducted pioneering research on radioactivity. She was the first woman to win a Nobel Prize and the only person to win Nobel Prizes in two different sciences (Physics and Chemistry).",
            'isaac newton': "Sir Isaac Newton (1643-1727) was an English mathematician, physicist, and astronomer. He formulated the laws of motion and universal gravitation, developed calculus, and explained the behavior of objects and celestial bodies.",
            'charles darwin': "Charles Darwin (1809-1882) was a British naturalist who proposed the theory of evolution through natural selection. His book 'On the Origin of Species' revolutionized biology and our understanding of life's diversity.",
        };
        
        const cleanQuery = query.replace(/\b(the|a|an|is|are|was|were|about|of|in|on|at|to|for|with|by)\b/g, '').trim();
        
        if (people[cleanQuery]) {
            return people[cleanQuery] + "\n\nWould you like to know more about their contributions or other historical figures? 📚";
        }
        
        return null;
    }
    
    findHistoricalEvent(query) {
        const events = {
            'world war 2 start': "World War II began on September 1, 1939, when Germany invaded Poland. Britain and France declared war on Germany two days later, marking the official start of the war in Europe.",
            'world war 2 end': "World War II ended on September 2, 1945, with Japan's formal surrender aboard the USS Missouri in Tokyo Bay, following the atomic bombings of Hiroshima and Nagasaki.",
            'moon landing happen': "The first moon landing occurred on July 20, 1969, when Apollo 11 astronauts Neil Armstrong and Buzz Aldrin landed on the Moon. Armstrong was the first human to step onto the lunar surface.",
            'internet start': "The Internet began as ARPANET in 1969, connecting four universities. The World Wide Web was invented by Tim Berners-Lee in 1989, and the Internet became publicly accessible in the early 1990s.",
        };
        
        for (const [key, value] of Object.entries(events)) {
            if (query.includes(key.split(' ')[0]) && query.includes(key.split(' ')[1])) {
                return value + "\n\nInterested in more historical events? I'd be happy to share more! 🏛️";
            }
        }
        
        return null;
    }
    
    findProcess(query) {
        const processes = {
            'photosynthesis work': "Photosynthesis works in two stages: 1) Light reactions capture energy and split water molecules, producing oxygen. 2) Calvin cycle uses this energy to convert CO₂ into glucose. It occurs in chloroplasts and is essential for life on Earth.",
            'computer work': "Computers work by processing binary data (0s and 1s) through electronic circuits. The CPU executes instructions from programs stored in memory, manipulating data and producing outputs. All complex operations are built from simple binary operations.",
            'internet work': "The Internet works through a network of interconnected computers using standardized protocols (TCP/IP). Data is broken into packets, routed through various networks, and reassembled at the destination. DNS translates domain names to IP addresses.",
        };
        
        for (const [key, value] of Object.entries(processes)) {
            if (query.includes(key.split(' ')[0])) {
                return value + "\n\nWant to dive deeper into how this process works? Ask away! ⚙️";
            }
        }
        
        return null;
    }
    
    findLocation(query) {
        const locations = {
            'paris': "Paris is the capital and largest city of France, located in north-central France on the Seine River. Known as the 'City of Light,' it's famous for the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and its rich culture, art, and cuisine.",
            'mount everest': "Mount Everest is located in the Himalayas on the border between Nepal and Tibet (China). It's the world's highest mountain at 29,032 feet (8,849 meters) above sea level.",
            'great wall of china': "The Great Wall of China stretches across northern China, running roughly east to west from Dandong in the east to Lop Lake in the west. It passes through 15 provinces and regions.",
        };
        
        const cleanQuery = query.replace(/\b(the|a|an|is|are|was|were|about|of|in|on|at|to|for|with|by)\b/g, '').trim();
        
        if (locations[cleanQuery]) {
            return locations[cleanQuery] + "\n\nWould you like to know more about this place or other locations? 🗺️";
        }
        
        return null;
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
