module.exports = function (socketServer)
{
   var ALLOWED_TIME = 20 * 60;
   
   var game = {};

   game.players = [];
   game.time = ALLOWED_TIME ;
   game.exists = false; 
   game.running = false;
   game.maxNumberOfPlayers = 4;
   game.numberOfRegisteredPlayers = 3;


   game.process = function(message)
   {
      switch(message.type){

         case "create": //Create new game
            game.exists = true;
            socketServer.broadcast(JSON.stringify({"type":"gamecreated"}))
         break;
         case "register": //Registering new players
            console.log("Register new player in game.js")
            game.numberOfRegisteredPlayers ++;
            socketServer.broadcast(JSON.stringify(game.register(message)))
            if(game.numberOfRegisteredPlayers === game.maxNumberOfPlayers){
               game.running = true;
               socketServer.broadcast(JSON.stringify({"type":"time","message":game.time, "maxNumberOfPlayers": game.maxNumberOfPlayers, "numberOfRegisteredPlayers": game.numberOfRegisteredPlayers}))
            }
         break;
         case "killGame":
            game.exists = false;
            game.running = false;
            game.time = ALLOWED_TIME;
            game.numberOfRegisteredPlayers = 0;
            game.players = [];
            socketServer.broadcast(JSON.stringify({"type":"reset"}));
         break;
         default:
            console.log("here instead");
            return false;
         break;
      }
      console.log("End of process")
   }

   game.register = function(message)
   {
      game.players.push(message.name);

      var returnMessage = {
         players: game.players,
         maxNumberOfPlayers: game.maxNumberOfPlayers,
         numberOfRegisteredPlayers: game.numberOfRegisteredPlayers,
         ...message
      }
      console.log("returnMessage " + returnMessage.name)
      return returnMessage;
   }

   setInterval(function(){
      if(game.running)
      {
         game.time--;
         socketServer.broadcast(JSON.stringify({"type":"time","message":game.time}))
      }
   },1000)

   return game;
}
