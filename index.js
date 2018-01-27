const express= require('express');
const WebSocket = require('ws');
const randomId = require('random-id');

var webport = 3000;

var app = express();

var landPage = "home.html";

app.get('/', function(req,res){
  if(game.exists){
    if(game.running){
      landPage = "gameInProgress.html";
    }else{
      landPage = "join.html";
    }
  }else{    
    landPage = "home.html";
  }
  res.redirect(landPage);
})
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
  try {
  console.log("User Connected: ", ws._socket.remoteAddress);
  ws.on('message', function incoming(message) {
    console.log("message = " + message)
    let result = game.process(JSON.parse(message));
  });
  }
  catch(err) {
    console.log("ewps");
  }
})

wsServer.on('close',function(ws,req){
  console.log("socket close");
  console.log(ws)
  connections.splice(connections.indexOf(ws));
})

var game = require("./game")(wsServer);
