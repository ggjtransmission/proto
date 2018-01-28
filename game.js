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

   game.numberOfsymptoms = 4;
   game.numberOfItemsToPass = 2;
   //Solutions arrays
   game.humoursCodeArray = [];
   game.symptomsCodeArray = [];


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
            //We have the necessary amount of players, so we start the game
            if(game.numberOfRegisteredPlayers === game.maxNumberOfPlayers){
               game.createCode();
               game.running = true;
               socketServer.broadcast(JSON.stringify({"type":"start","message":game.time, "maxNumberOfPlayers": game.maxNumberOfPlayers, "numberOfRegisteredPlayers": game.numberOfRegisteredPlayers}))
            }
         break;   
         case "examine":
            console.log("examine player in game.js")
            game.examine(message.humArray, message.symArray, message.id);
         break;
         //debug function so that we can test restart
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

   game.createCode = function(){
      var humours = [1,2,3,4]
      var symptom = ["A","B","C","D"]
      for(var i = 0; i < game.maxNumberOfPlayers; i++){
         game.humoursCodeArray[i] = humours[Math.floor(Math.random() * (game.maxNumberOfPlayers - i))];
         game.symptomsCodeArray[i] = symptom[Math.floor(Math.random() * (game.maxNumberOfPlayers - i))];
      }
   }

   game.examine = function(userHumoursArray, userSymptomsArray, userId){
      var tempPosChosen = -1;
      var tempOpenPosArray = [];
      var openPos = 0;
      var humArrayFull = false;
      var symArrayFull = false;
      console.log("in the examine FUNCTION")
      //Iterate through for as many items as need to be passed.
      for(var i = 0; i < game.numberOfItemsToPass; i++){
         //Randomly choose which array to look at
         if(Math.floor(Math.random() * 2) === 0){
            if(!humArrayFull){
               //Make array of open positions
               for(var k = 0; k < game.numberOfsymptoms; k++){
                  if(userHumoursArray[k] === null){
                     tempOpenPosArray[openPos] = k;
                     openPos++;
                  }
               }
               if(openPos != 0){
                  //random pick of open position
                  tempPosChosen = tempOpenPosArray[Math.floor(Math.random() * tempOpenPosArray.length)]
                  //Use random open position to get value from the solution array
                  //and add that value into the postion on the userArray that
                  //we will then transmit back to the user
                  userHumoursArray[tempPosChosen] = game.humoursCodeArray[tempPosChosen];
                  //reset temp vars in case we iterate on the for loop again
                  openPos = 0;
                  tempOpenPosArray = [];
                  tempPosChosen = -1;
               }else{
                  humArrayFull = true;
               }
            }
         }else{
            if(!symArrayFull){
               //Make array of open positions
               for(var k = 0; k < game.numberOfsymptoms; k++){
                  if(userSymptomsArray[k] === null){
                     tempOpenPosArray[openPos] = k;
                     openPos++;
                  }
               }
               if(openPos != 0){
                  //random pick of open position
                  tempPosChosen = tempOpenPosArray[Math.floor(Math.random() * tempOpenPosArray.length)]
                  //Use random open position to get value from the solution array
                  //and add that value into the postion on the userArray that
                  //we will then transmit back to the user
                  userSymptomsArray[tempPosChosen] = game.symptomsCodeArray[tempPosChosen];
                  //reset temp vars in case we iterate on the for loop again
                  openPos = 0;
                  tempOpenPosArray = [];
                  tempPosChosen = -1;
               }else{
                  symArrayFull = true;
               }
            }
         }
      }
      socketServer.broadcast(JSON.stringify({"type":"examine","userHumoursArray":userHumoursArray,"userSymptomsArray":userSymptomsArray, "userId":userId}))
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
