var game = {};
game.players = [];

game.process = function(message)
{
   
   switch(message.type){

      case "register": //Registering new players
         return game.register(message);

      break
      default:
         console.log("here instead");
         return false;
      break

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


module.exports = game;