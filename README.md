# 🐦 Flappy Battle Royale

A real-time 1v1 multiplayer browser game built with Phaser and Socket.IO. Players compete in a split-screen Flappy Bird battle with special abilities to defeat their opponent!

## 🎮 Game Features

- **Split Screen**: Vertical split with mirrored pipe patterns
- **Real-time Multiplayer**: Instant matchmaking via Socket.IO
- **Special Abilities**: 4 unique powers with cooldowns
  - 🔥 **Fireball**: Shoot projectiles at opponent
  - 🔄 **Reverse**: Reverse opponent's controls temporarily
  - ⚡ **EMP**: Disable opponent's abilities for 3 seconds
  - 🛡️ **Shield**: Block next incoming attack
- **Synchronized Gameplay**: Shared random seed ensures identical pipe patterns
- **No Authentication**: Jump right into the action

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Create project directory**:
```bash
mkdir flappy-battle
cd flappy-battle
```

2. **Save the backend code** as `server.js`

3. **Create package.json** (use the provided package.json content)

4. **Install dependencies**:
```bash
npm install
```

5. **Create public directory and save frontend**:
```bash
mkdir public
```
Save the HTML file as `public/index.html`

6. **Start the server**:
```bash
npm start
```

7. **Open the game**:
Navigate to `http://localhost:3000` in two different browser tabs/windows

## 📁 Project Structure

```
flappy-battle/
├── server.js              # Backend server with Socket.IO
├── package.json           # Dependencies and scripts
├── public/
│   └── index.html         # Complete frontend game
└── README.md              # This file
```

## 🎯 How to Play

### Controls
- **Click** or **Spacebar**: Make your bird flap
- **Ability Buttons**: Use special powers (bottom of screen)

### Objective
- Navigate through pipes without crashing
- Use abilities strategically to defeat your opponent
- Last bird flying wins!

### Abilities Guide

| Ability | Cooldown | Effect |
|---------|----------|--------|
| 🔥 Fireball | 5s | Shoots a projectile across the screen |
| 🔄 Reverse | 8s | Reverses opponent's flap controls for 4s |
| ⚡ EMP | 10s | Disables opponent's abilities for 3s |
| 🛡️ Shield | 15s | Blocks the next incoming attack |

## 🔧 Technical Details

### Backend (Node.js + Socket.IO)
- Express server serving static files
- Real-time matchmaking system
- Game room management
- Event synchronization between players

### Frontend (Phaser 3)
- Physics-based bird movement
- Procedural pipe generation with shared seeds
- Collision detection
- Ability system with visual feedback
- Split-screen rendering

### Key Features
- **Seeded Random Generation**: Ensures both players get identical pipe patterns
- **Real-time Synchronization**: Player positions and actions are synced instantly
- **Ability System**: Each ability has unique mechanics and cooldowns
- **Visual Feedback**: Status effects, cooldowns, and game state clearly displayed

## 🎨 Customization

### Adjusting Game Balance
Edit these values in the frontend code:
- `pipeSpeed`: How fast pipes move
- `gapHeight`: Size of gaps in pipes
- Ability cooldowns in `useAbility()` function
- Effect durations in `handleOpponentAbility()`

### Visual Styling
- Modify CSS classes in the `<style>` section
- Change color schemes, animations, and UI layout
- Customize Phaser sprites in the `preload()` function

### Adding New Abilities
1. Add new button in HTML
2. Implement ability logic in `useAbility()`
3. Handle opponent effects in `handleOpponentAbility()`

## 🐛 Troubleshooting

### Common Issues

**Players can't connect:**
- Check if port 3000 is available
- Ensure both players are on the same network/server

**Game feels laggy:**
- Reduce `pipeSpeed` value
- Check network connection quality

**Abilities not working:**
- Verify cooldowns are properly reset
- Check EMP status effect isn't active

### Debug Mode
Add `debug: true` to Phaser physics config to see collision boxes.

## 🚀 Deployment

### Local Network
The game works on your local network. Other devices can connect using your computer's IP address:
```
http://YOUR_IP_ADDRESS:3000
```

### Production Deployment
For public deployment, consider:
- Heroku, Railway, or similar platforms
- Environment variables for port configuration
- WebSocket transport fallbacks for restrictive networks

## 📝 License

MIT License - Feel free to modify and distribute!

## 🎉 Enjoy the Game!

Challenge your friends to epic 1v1 Flappy Bird battles!