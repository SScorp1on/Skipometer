const tmi = require('tmi.js');

class Bot {
  constructor() {
    this.client = new tmi.Client({
        channels: [ 'namvseyasno' ]
    });
    this.client.on('connected', (addr, port) => {
      console.log(`* Connected to ${addr}:${port}`);
    });
    this.client.connect();
  }
}

module.exports = Bot;
