module.exports = function (socketServer)
{
   
   var game = {};

   game.players = [];
   game.time = 30 * 60 ;
   game.exists = false; 
   game.running = false;
   game.maxNumberOfPlayers = 4;
   game.numberOfRegisteredPlayers = 3;


   game.process = function(message)
   {
      switch(message.type){

         case "create": //Create new game
            game.exists = true;
            socketServer.broadcast(JSON.stringify({"game":"created"}))
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
         case "returnHome":
            game.exists = false;
            game.running = false;
            game.numberOfRegisteredPlayers = 0;
            game.players = [];
            socketServer.broadcast(JSON.stringify({"type":"time","message":game.time, "maxNumberOfPlayers": game.maxNumberOfPlayers, "numberOfRegisteredPlayers": game.numberOfRegisteredPlayers}))
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