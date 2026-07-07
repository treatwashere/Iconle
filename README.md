# 🎯 Iconle

**Guess a brand or app just from its icon, zoomed in progressively each wrong guess.**

A Wordle-style guessing game where you identify famous brands and applications based on their icons. Each wrong guess zooms and sharpens the image, getting progressively clearer until you identify it!

## 🎮 How to Play

1. Look at the heavily blurred icon
2. Guess which brand or app it is
3. Each wrong guess reveals more of the icon (zoom increases + blur reduces)
4. You have 6 incorrect guesses before the game ends
5. Try to identify each brand with as few guesses as possible

## 🚀 Features

- **Progressive Zoom System**: Start with 100% zoom at blur level 5, down to 10% zoom with no blur
- **6 Guesses Maximum**: Challenge yourself to identify quickly
- **Multiple Aliases**: Guesses are case-insensitive and accept common names
  - Example: "X", "Twitter", or "Elon" will all work for the X (formerly Twitter) brand
- **Responsive Design**: Plays great on desktop, tablet, and mobile
- **Real Brand Icons**: Uses official favicons from brand websites

## 🛠️ Stack

- **HTML5** - Structure
- **CSS3** - Styling with gradients and animations
- **Vanilla JavaScript** - Game logic, no dependencies
- **JSON** - Brand database

## 📁 Project Structure

```
Iconle/
├── index.html      # Game interface and HTML structure
├── style.css       # All styling, animations, responsive design
├── game.js         # Game logic, state management, event handling
├── data.json       # Brand/app database with icons and aliases
└── README.md       # This file
```

## 🎨 How It Works

### Game Flow
1. **Start**: A random brand is selected from the database
2. **Display**: Icon is shown heavily blurred at 100% zoom
3. **Guess**: Player enters their guess
4. **Validate**: 
   - If correct → Win! 🎉
   - If incorrect → Zoom decreases (becomes clearer) and blur reduces
5. **Repeat**: Continue until win or 6 wrong guesses

### Progressive Zoom Levels
- **100%** - Blur level 5 (maximum blur)
- **85%** - Blur level 5
- **70%** - Blur level 4
- **55%** - Blur level 3
- **40%** - Blur level 2
- **25%** - Blur level 1 (minimal blur)
- **10%** - No blur (fully revealed)

## 📝 Adding New Brands

Edit `data.json` to add more brands:

```json
{
  "id": 16,
  "name": "Notion",
  "icon": "https://www.notion.so/favicon.ico",
  "aliases": ["notion", "notes", "productivity", "workspace"]
}
```

**Fields:**
- `id`: Unique identifier
- `name`: Official brand name
- `icon`: URL to the favicon
- `aliases`: Array of acceptable guess variations (lowercase)

## 🎯 Current Brands

Includes 15 popular brands out of the box:
- Google, Apple, Microsoft, Amazon, Meta
- X (Twitter), GitHub, Slack, Spotify, YouTube
- Netflix, LinkedIn, Discord, Figma, Docker

## 📱 Responsive Design

Works seamlessly on:
- 💻 Desktop (600px max-width for optimal gameplay)
- 📱 Mobile (optimized for smaller screens)
- 📲 Tablet (full responsive scaling)

## 🚀 Getting Started

1. Clone or download the repository
2. Open `index.html` in your browser
3. Start guessing!

No build process, no dependencies—just pure web technologies.

## 🎮 Game Difficulty

**Easy Mode Tips:**
- Start with the most zoomed/blurred images
- Generic brands are usually more recognizable

**Hard Mode Challenge:**
- Skip rounds until you have only a few guesses left
- Play with unknown brand apps
- Time yourself!

## 💡 Future Enhancements

Potential features:
- [ ] Scoring system (points for fewer guesses)
- [ ] Daily challenge mode
- [ ] Leaderboard / high scores
- [ ] Custom brand sets
- [ ] Difficulty levels
- [ ] Sound effects
- [ ] Dark mode toggle
- [ ] Statistics tracking (accuracy, speed)
- [ ] Multiplayer competitive mode

## 📄 License

Open source - feel free to fork, modify, and share!

---

**Made with ❤️ - Good luck guessing!**
