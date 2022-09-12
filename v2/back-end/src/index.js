const Bot = require('./twitchAPI/Bot');
const config = require('./twitchAPI/config');
const WebSocket = require('ws');
const Skipometer = require('./entities/Skipometer');

const bot = new Bot();
const webSocketServer = new WebSocket.Server({ port: 5000 });
const skipometer = new Skipometer(webSocketServer, bot);
