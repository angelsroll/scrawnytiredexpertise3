const express = require('express');
const WebSocket = require('ws');
const app = express();
const port = process.env.PORT || 3000;  // Replit uses process.env.PORT

app.use(express.json());

const wss = new WebSocket.Server({ noServer: true });

app.post('/trigger', (req, res) => {
    const { user, message } = req.body;
    console.log(`Received attack command from ${user}: ${message}`);

    const payload = JSON.stringify({ type: 'triggerOverlay', user });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });

    res.send('Overlay triggered');
});

const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.on('message', (message) => {
        console.log('Received message:', message);
    });
    ws.on('close', () => {
        console.log('WebSocket connection closed');
    });
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});