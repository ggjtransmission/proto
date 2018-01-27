module.exports = function (socketServer)
{
   
   var game = {};

   game.players = [];
   game.time = 30 * 60 ; 
   game.running = false;


   game.process = function(message)
   {
      switch(message.type){

         case "register": //Registering new players
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