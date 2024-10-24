const express = require('express');
const { WebSocketServer } = require('ws');
const app = express();
require('dotenv').config();

app.get('/', (req, res) => {
  res.send('WebSocket server is running');
});

const server = app.listen(process.env.PORT || 8000, () => {
  console.log(`Server started on port ${server.address().port}`);
});

const wss = new WebSocketServer({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', (message) => {
    const parsedMessage = JSON.parse(message);
    const broadcastData = JSON.stringify(parsedMessage);
    
    clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(broadcastData);
      }
    });
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });


  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.on('error', (error) => {
  console.error('Server error:', error);
});