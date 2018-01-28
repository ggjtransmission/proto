const express= require('express');
const WebSocket = require('ws');
const randomId = require('random-id');

var webport = 3000;

var app = express();

app.use(express.static('public'));
app.use(express.static('Sound'));
var server = require('http').createServer(app);

server.listen(webport,function(){
  console.log("Web Server listening on port " + webport);
});

var wsServer = new WebSocket.Server({server});
var wsConnections = {};

wsServer.broadcast = function broadcast(data) {
  wsServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

wsServer.on('connection',(ws,req)=>{
  console.log("User Connected: ", ws._socket.remoteAddress);
  ws.send(JSON.stringify({type:"newconnection",game_exists:game.exists,game_running:game.running}));
  ws.on('message', function incoming(message) {
    console.log("message = " + message)
    let result = game.process(JSON.parse(message));
  });
})

wsServer.on('close',function(ws,req){
  console.log("socket close");
  console.log(ws)
  connections.splice(connections.indexOf(ws));
})

wsServer.on('error', function(err) {
  console.log("websocket error");
  console.log(err.stack);
})

process.on('uncaughtException', function(err) {
  console.log("uncaught exception");
  console.log(err.stack);
})

var game = require("./game")(wsServer);
