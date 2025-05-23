const express = require('express');
const http = require('http');
const path = require('path');
const { initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Add a health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Add Socket.IO endpoint with proper error handling
app.get('/socket.io/', (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.send('Socket.IO endpoint');
  } catch (error) {
    console.error('Socket.IO endpoint error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Export the Express app for Vercel
module.exports = app; 