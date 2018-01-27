const express= require('express');
const WebSocket = require('ws');
const randomId = require('random-id');

var game = require("./game");

var webport = 3000;

var app = express();

app.use(express.static('public'));
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
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    let result = game.process(JSON.parse(message));

    wsServer.broadcast(JSON.stringify(result));
  });
})

wsServer.on('close',function(ws,req){
  console.log("socket close");
  console.log(ws)
  connections.splice(connections.indexOf(ws));
})