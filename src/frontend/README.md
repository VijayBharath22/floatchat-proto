# 🌊 FloatChat - Frontend Prototype

A beautiful, interactive frontend prototype for exploring ARGO ocean data with AI assistance.

## 🚀 Features

### 🌍 Interactive Globe
- 2D globe with animated ARGO float dots
- Click on dots to see float details
- Hover for quick information
- Smooth animations and transitions

### 💬 AI Chatbot
- Perplexity-style conversation interface
- Mode-specific responses and prompts
- Copy, export, and audio playback for messages
- Typing indicators and smooth animations

### 🎨 Three Personalized Modes

#### 🧑‍🎓 Explorer Mode
- Playful, vibrant theme
- Educational content and tooltips
- Simplified UI for students
- Gamification elements

#### 🐟 Navigator Mode
- Oceanic blue/teal theme
- Maritime-focused information
- Weather and navigation data
- Professional interface

#### 👨‍🔬 Researcher Mode
- Dark, professional theme
- Advanced analytics tools
- Research-focused features
- Statistical analysis capabilities

### ✨ Additional Features
- Smooth tab transitions with Anime.js
- Glassmorphism design
- Responsive layout
- Multi-language support
- Mode switching with animations
- Login/signup buttons
- Filter system for globe data

## 🛠️ Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with glassmorphism
- **JavaScript (ES6+)** - Interactive functionality
- **Anime.js** - Smooth animations and transitions
- **Font Awesome** - Icons
- **Google Fonts** - Typography

## 📁 File Structure

```
src/frontend/
├── index.html                 # Main HTML file
├── static/
│   ├── css/
│   │   ├── main.css          # Main styles
│   │   ├── modes.css         # Mode-specific styles
│   │   └── animations.css    # Animation styles
│   └── js/
│       ├── main.js           # Main application logic
│       ├── globe.js          # Globe functionality
│       ├── chatbot.js        # Chatbot functionality
│       ├── modes.js          # Mode management
│       └── animations.js     # Animation controller
└── README.md                 # This file
```

## 🚀 Getting Started

1. **Open the prototype:**
   ```bash
   # Navigate to the frontend directory
   cd src/frontend
   
   # Open index.html in a web browser
   open index.html
   # or
   python -m http.server 8000
   # then visit http://localhost:8000
   ```

2. **Explore the features:**
   - Switch between Globe and Chatbot tabs
   - Try different modes (Explorer, Navigator, Researcher)
   - Click on ARGO float dots to see details
   - Ask questions in the chatbot
   - Use suggested prompts

## 🎮 Usage Guide

### Globe Tab
- **View ARGO floats:** Yellow dots represent ARGO floats
- **Get details:** Click on any dot to see float information
- **Filter data:** Use the filters panel to narrow down results
- **Chat integration:** Type in the chat input to switch to chatbot

### Chatbot Tab
- **Ask questions:** Type any ocean-related question
- **Use prompts:** Click on suggested prompt cards
- **Message actions:** Copy, export, or play audio for responses
- **Mode-specific content:** Responses change based on your selected mode

### Mode Switching
- **Explorer:** Perfect for students and curious minds
- **Navigator:** Designed for fishermen and maritime professionals
- **Researcher:** Built for scientists and researchers

## 🎨 Customization

### Adding New Modes
1. Update `modes.js` with new mode configuration
2. Add mode-specific styles in `modes.css`
3. Update the mode selector in `index.html`

### Styling Changes
- Modify `main.css` for general styling
- Update `modes.css` for mode-specific themes
- Adjust `animations.css` for animation timing

### Adding Features
- Extend `main.js` for new functionality
- Add new methods to existing classes
- Update HTML structure as needed

## 🔧 Browser Support

- **Chrome/Edge:** Full support
- **Firefox:** Full support
- **Safari:** Full support
- **Mobile browsers:** Responsive design

## 📱 Responsive Design

The prototype is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🎯 Hackathon Ready

This prototype is designed for hackathon presentations with:
- Clean, professional UI
- Smooth animations
- Interactive elements
- Mode-specific experiences
- No backend dependencies

## 🚀 Future Enhancements

- Real ARGO data integration
- Advanced analytics dashboard
- User authentication
- Data export features
- Real-time updates
- Mobile app version

## 📄 License

This is a prototype created for hackathon purposes. Feel free to use and modify as needed.

---

**Built with ❤️ for ocean data exploration**
