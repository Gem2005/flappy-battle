const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Game state management
let waitingPlayers = [];
let activeRooms = new Map();

class GameRoom {
  constructor(player1, player2) {
    this.id = Math.random().toString(36).substr(2, 9);
    this.players = {
      player1: { socket: player1, ready: false, alive: true, score: 0 },
      player2: { socket: player2, ready: false, alive: true, score: 0 }
    };
    this.gameState = {
      started: false,
      seed: Math.floor(Math.random() * 1000000),
      startTime: null,
      pipes: [],
      gameOver: false,
      winner: null
    };
    
    // Assign player numbers
    player1.playerNumber = 1;
    player2.playerNumber = 2;
    player1.roomId = this.id;
    player2.roomId = this.id;
    
    // Join socket rooms
    player1.join(this.id);
    player2.join(this.id);
    
    console.log(`Game room ${this.id} created with players ${player1.id} and ${player2.id}`);
  }

  startGame() {
    this.gameState.started = true;
    this.gameState.startTime = Date.now();
    
    // Notify both players to start
    io.to(this.id).emit('gameStart', {
      seed: this.gameState.seed,
      playerNumber: null // Will be set individually
    });
    
    // Send individual player numbers
    this.players.player1.socket.emit('playerAssignment', { playerNumber: 1 });
    this.players.player2.socket.emit('playerAssignment', { playerNumber: 2 });
    
    console.log(`Game ${this.id} started with seed ${this.gameState.seed}`);
  }

  handlePlayerDeath(playerNumber, cause) {
    if (this.gameState.gameOver) return;
    
    this.gameState.gameOver = true;
    this.gameState.winner = playerNumber === 1 ? 2 : 1;
    
    io.to(this.id).emit('gameOver', {
      winner: this.gameState.winner,
      loser: playerNumber,
      cause: cause
    });
    
    console.log(`Game ${this.id} over - Player ${this.gameState.winner} wins, Player ${playerNumber} died from ${cause}`);
    
    // Clean up room after 5 seconds
    setTimeout(() => {
      this.cleanup();
    }, 5000);
  }

  cleanup() {
    // Remove players from room
    this.players.player1.socket.leave(this.id);
    this.players.player2.socket.leave(this.id);
    
    // Reset player properties
    delete this.players.player1.socket.roomId;
    delete this.players.player2.socket.roomId;
    delete this.players.player1.socket.playerNumber;
    delete this.players.player2.socket.playerNumber;
    
    // Remove from active rooms
    activeRooms.delete(this.id);
    console.log(`Game room ${this.id} cleaned up`);
  }
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);
  
  // Add player to waiting queue
  socket.emit('searching');
  waitingPlayers.push(socket);
  
  // Try to match players
  matchPlayers();
  
  // Handle player events
  socket.on('playerReady', () => {
    if (socket.roomId) {
      const room = activeRooms.get(socket.roomId);
      if (room) {
        const playerKey = socket.playerNumber === 1 ? 'player1' : 'player2';
        room.players[playerKey].ready = true;
        
        // Check if both players are ready
        if (room.players.player1.ready && room.players.player2.ready) {
          room.startGame();
        }
      }
    }
  });
  
  // Relay game events to opponent
  socket.on('playerFlap', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('opponentFlap', {
        playerNumber: socket.playerNumber,
        ...data
      });
    }
  });
  
  socket.on('playerPosition', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('opponentPosition', {
        playerNumber: socket.playerNumber,
        ...data
      });
    }
  });
  
  socket.on('abilityUsed', (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit('opponentAbility', {
        playerNumber: socket.playerNumber,
        ...data
      });
    }
  });
  
  socket.on('playerDeath', (data) => {
    if (socket.roomId) {
      const room = activeRooms.get(socket.roomId);
      if (room) {
        room.handlePlayerDeath(socket.playerNumber, data.cause);
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Remove from waiting players
    waitingPlayers = waitingPlayers.filter(p => p.id !== socket.id);
    
    // Handle room cleanup if in active game
    if (socket.roomId) {
      const room = activeRooms.get(socket.roomId);
      if (room && !room.gameState.gameOver) {
        // Notify opponent of disconnection
        socket.to(socket.roomId).emit('opponentDisconnected');
        room.cleanup();
      }
    }
  });
});

function matchPlayers() {
  while (waitingPlayers.length >= 2) {
    const player1 = waitingPlayers.shift();
    const player2 = waitingPlayers.shift();
    
    // Create new game room
    const room = new GameRoom(player1, player2);
    activeRooms.set(room.id, room);
    
    // Notify players they've been matched
    player1.emit('matchFound', { roomId: room.id, playerNumber: 1 });
    player2.emit('matchFound', { roomId: room.id, playerNumber: 2 });
  }
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Game available at: http://localhost:${PORT}`);
});

// Handle WebSocket upgrade
server.on('upgrade', (request, socket, head) => {
  io.handleUpgrade(request, socket, head, (ws) => {
    io.emit('connection', ws, request);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Server shutting down...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});