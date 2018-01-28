module.exports = function (socketServer)
{
   
   var game = {};

   game.players = [];
   game.time = 30 * 60 ;
   game.exists = false; 
   game.running = false;


   game.process = function(message)
   {
      switch(message.type){

         case "create": //Create new game
            game.exists = true;
            socketServer.broadcast(JSON.stringify({"game":"created"}))
         break;
         case "register": //Registering new players
            console.log("Register new player in game.js")
            socketServer.broadcast(JSON.stringify(game.register(message)))
         break;
         case "start":
            game.running = true;
            socketServer.broadcast(JSON.stringify({"type":"time","message":game.time}))
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
         ...message
      }
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