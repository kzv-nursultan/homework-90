const express = require('express');
const cors = require('cors');
const {nanoid} = require("nanoid");
const app = express();

app.use(cors());

const port = 8000;

require('express-ws')(app);

const activeConnections = {};

app.ws('/canvas', (ws, req)=> {
  const id = nanoid();
  console.log('Client connected id=', id);
  activeConnections[id] = ws;

  ws.on('message', (msg) => {
    const decoded = JSON.parse(msg);
  if (decoded) {
    switch (decoded.type) {
      case 'NEW_COORDINATES':
        Object.keys(activeConnections).forEach(key => {
          const connection = activeConnections[key];
          connection.send(JSON.stringify({
            type: 'NEW_MESSAGE',
            data: decoded.data,
          }))
        });
        break;
      default:
        console.log('Unknown message type:', decoded.type);
    }
  }
  });

  ws.on('close', () => {
    console.log('Client disconnected id=' + id);
    delete activeConnections[id];
  });

});

app.listen(port, ()=>{
  console.log('server started on port ' + port);
});