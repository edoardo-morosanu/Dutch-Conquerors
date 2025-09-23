# Dutch Conquerors 🏴‍☠️⚓

A React-based educational maritime arcade game that combines Dutch language learning with retro-style gameplay. Inspired by classic Space Invaders mechanics, players must match Dutch and English vocabulary while defending against enemy ships in an immersive nautical setting.

<img src="public/assets/images/logo.png" alt="Game Screenshot" width="150px"/>






## 🎯 Overview

Dutch Conquerors transforms vocabulary learning into an engaging arcade experience. Players control a cannon ship at the bottom of the screen, shooting at enemy vessels while matching Dutch words with their English translations. The game features both an action-packed gameplay mode and a relaxed flashcard learning mode.

### Key Features

- **Maritime Arcade Gameplay**: Classic ship-to-ship combat with educational twist

- **Dual Learning Modes**: 

  - Game Mode: Fast-paced vocabulary matching during combat
  - Learn Mode: Interactive flashcard system with swipe mechanics
- **Dynamic Translation System**: Multiple API integrations with intelligent fallbacks

- **Immersive Audio**: Background music
- **Progressive Difficulty**: Enemy ship speed increases with score


## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/edoardo-morosanu/Dutch-Conquerors.git
   cd dutch-conquerors

   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:8080`

### Production Build

```bash
npm run build
```

The built files will be available in the `dist/` directory.

## 🎮 How to Play

### Game Mode
1. **Objective**: Destroy enemy ships by shooting the correct English translation of the displayed Dutch word
2. **Controls**: 
   - Use keyboard arrows or on-screen controls to move your cannon
   - Click or press spacebar to fire cannonballs
3. **Scoring**: Earn points for correct hits, lose lives for wrong answers or missed ships
4. **Special Enemies**: Watch out for Red Bull ships with bonus challenges!

### Learn Mode
1. **Flashcard Learning**: Swipe through vocabulary cards at your own pace
2. **Interactive Cards**: Tap to flip between Dutch and English
3. **Gesture Controls**: Swipe left/right to navigate between words
4. **Audio Support**: Text-to-speech functionality for pronunciation practice

## 🏗️ Project Structure

```
dutch-conquerors/
├── public/
│   ├── assets/
│   │   ├── images/          # Game sprites and UI images
│   │   └── music/           # Background music files
│   ├── favicon.png
│   └── style.css           # Global styles
├── src/
│   ├── components/
│   │   ├── pages/
│   │   │   ├── MainPage/    # Landing page with menu
│   │   │   ├── GamePage/    # Main arcade gameplay
│   │   │   └── LearnPage/   # Flashcard learning mode
│   │   └── ui/              # Reusable UI components
│   ├── data/
│   │   └── words.json       # Local vocabulary database
│   ├── services/
│   │   └── translationService.js  # Translation API management
│   ├── App.jsx              # Main application component
│   └── main.jsx             # React entry point
├── config/
│   ├── config.dev.mjs       # Development configuration

│   └── config.prod.mjs      # Production configuration

└── package.json
```

## 🔧 Technical Implementation

### Frontend Stack
- **React 19**: Component-based UI framework
- **Vite**: Modern build tool and development server
- **CSS3**: Custom styling with animations and responsive design


- **JavaScript ES6+**: Modern JavaScript features



### Translation Services
The game implements a robust translation system with multiple fallback layers:

1. **Primary**: DeepL API via proxy server
2. **Secondary**: Google Translate API with CORS handling
3. **Fallback**: Local dictionary with 60+ maritime and common terms

### API Integration
```javascript
// Translation service with intelligent fallbacks

const translationService = {

  translate: async (text, sourceLang, targetLang) => {

    // Try DeepL → Google Translate → Local Dictionary
  }
}
```

### Game Engine
- Custom collision detection system
- Real-time scoring and life management
- Dynamic difficulty scaling
- Responsive canvas-based rendering

## 🌐 Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with logging |
| `npm run build` | Create production build |
| `npm run dev-nolog` | Start development server without logging |
| `npm run build-nolog` | Create production build without logging |

## 🎨 Customization

### Adding New Vocabulary
Edit `src/data/words.json` to add new English words:

```json
[
  "ship",
  "anchor",
  "treasure",
  // Add your words here


]
```

### Translation Configuration
Modify `src/services/translationService.js` to:


- Add new API endpoints
- Extend local dictionary
- Configure CORS proxies

### Styling and Themes
- Global styles: `public/style.css`
- Component styles: Individual `.css` files in component directories
- Assets: `public/assets/` for images and audio

## 🧪 Educational Design

### Learning Principles
- **Gamification**: Points, lives, and progression to maintain engagement

- **Spaced Repetition**: Flashcard mode for vocabulary reinforcement
- **Contextual Learning**: Maritime theme provides memorable word associations
- **Multi-modal Input**: Visual, auditory, and kinesthetic learning support

### Target Audience
- **Language Learners**: Beginner to intermediate Dutch students
- **Students**: High school and university learners
- **Expats**: Adults needing practical Dutch vocabulary
- **Gaming Enthusiasts**: Retro arcade game fans

## 🔒 Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices
- Maintain consistent code formatting with ESLint
- Test new vocabulary additions thoroughly
- Ensure responsive design compatibility

## 📝 License

This project is licensed under the GNU GENERAL PUBLIC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Maritime History**: Inspired by Dutch Golden Age naval exploration
- **Game Design**: Classic Space Invaders mechanics adapted for education
- **Translation APIs**: DeepL and Google Translate for dynamic vocabulary
- **Community**: Open source contributors and language learning enthusiasts

## 📧 Contact

**Author**: Edoardo Andrei Morosanu  
**Repository**: [Dutch Conquerors on GitHub](https://github.com/edoardo-morosanu/Dutch-Conquerors)  
**Issues**: [Report bugs or request features](https://github.com/edoardo-morosanu/Dutch-Conquerors/issues)

---

*Ahoy! Set sail on your Dutch learning adventure with the Dutch Conquerors! ⚓🇳🇱*

























