const WebSocket = require('ws');

var server = require('http').createServer()
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 4080;

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

const ws = new WebSocket('ws://chat.wintonhackathon.com/rooms/test/ws');

ws.on('open', function open() {
  console.log("opened");  
});

ws.on('message', function(data, flags) {
  console.log(data);
});

// ws.on('close', () => {
//   console.log("Closed");
// });

server.listen(port, function () { console.log('Listening on ' + server.address().port) });
