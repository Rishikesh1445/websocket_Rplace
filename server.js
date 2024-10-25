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
const coloredBoxes = new Set();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('New client connected');

  ws.send(JSON.stringify({
    type: 'initialState',
    coloredBoxes: Array.from(coloredBoxes)
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'boxClick') {
        // Toggle the box in the server state
        if (coloredBoxes.has(data.boxNumber)) {
          coloredBoxes.delete(data.boxNumber);
        } else {
          coloredBoxes.add(data.boxNumber);
        }
        
        // Broadcast the toggle to all clients
        const broadcastData = JSON.stringify({
          type: 'boxClick',
          boxNumber: data.boxNumber
        });
        
        clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(broadcastData);
          }
        });
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
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

const keepAlive = () => {
  const url = "https://websocket-859x.onrender.com";
  setInterval(() => {
    fetch(url)
      .then(response => console.log("Keep-alive ping sent"))
      .catch(err => console.error("Keep-alive error:", err));
  }, 14 * 60 * 1000);
};

keepAlive();