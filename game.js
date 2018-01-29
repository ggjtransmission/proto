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
   game.knownPairArray = [];


   game.process = function(message, ws)
   {
      switch(message.type){

         case "create": //Create new game
            game.exists = true;
            socketServer.broadcast(JSON.stringify({"type":"gamecreated"}))
         break;
         case "register": //Registering new players
            if (game.players.indexOf(message.name) != -1) {
               // duplicate name found
               ws.send(JSON.stringify({type:"duplicate_name"}));
               break;
            }

            // name is unique
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
            //For now just decrement two min off the clock
            game.time - 120000;
            game.examine(message.humArray, message.symArray, message.humTrackArray, message.symTrackArray, message.id);
         break;
         case "foundPair":
            console.log("one user found a pair")
            //Add the found pair to the foundPairArray if it is
            //not already in there.
            //We do this check incase mutliple users send us
            //the same array.
            var tempPairExists = false;
            for(var i = 0; i < game.knownPairArray.length; i++){
               if(message.newPair === game.knownPairArray[i]){
                  tempPairExists = true;
               }
            }
            if(!tempPairExists){
               game.knownPairArray.push(message.newPair);
            }
            socketServer.broadcast(JSON.stringify({"type":"foundPair","knownPairs":game.knownPairArray}));
         break;
         case "attemptCure":
            var cure = true;
            for(var i = 0; i < game.humoursCodeArray.length; i++){
               if(game.humoursCodeArray[i] == message.humArray[i] && game.symptomsCodeArray[i] == message.symArray[i]){
                  //do nothing as these items match
               }else{
                  cure = false;
               }
            }
            if(cure){
               //Then broadcast win page
               socketServer.broadcast(JSON.stringify({"type":"cureSuccessful"}))
            }else{
               //broadcast out that userId 
               //For now just decrement one min off the clock
               game.time - 60000;
            }
         break;
         //debug function so that we can test restart
         case "killGame":
            game.exists = false;
            game.running = false;
            game.time = ALLOWED_TIME;
            game.numberOfRegisteredPlayers = 0;
            game.players = [];
            game.knownPairArray = [];
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
      var symptoms = ["A","B","C","D"]
      for(var i = 0; i < game.numberOfsymptoms; i++){
         //Find random position 
         //(Note: we use the length of the avalible options for the
         //random number as we could have 40 options we can chose from
         //, but we only want a subset of the avalible options)
         var tempRand = Math.floor(Math.random() * (humours.length));
         //Add random humour to ith item in the solution array
         game.humoursCodeArray[i] = humours[tempRand];
         //Remove the humour from avalible humours list
         humours.splice(tempRand, 1);
         tempRand = Math.floor(Math.random() * (symptoms.length));
         game.symptomsCodeArray[i] = symptoms[tempRand];
         symptoms.splice(tempRand, 1);
      }
      for(var j = 0; j < game.numberOfsymptoms; j++){
         console.log("position " + j + " " + game.humoursCodeArray[j]);
      }
      for(var k = 0; k < game.numberOfsymptoms; k++){
         console.log("position " + k + " " + game.symptomsCodeArray[k]);
      }
   }

   game.examine = function(userHumoursArray, userSymptomsArray, userHTrackArray, userSTrackArray, userId){
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
                  if(userHTrackArray[k] === 0){
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
                  console.log("Setting h openPos: " + tempPosChosen + " to: " + game.humoursCodeArray[tempPosChosen])
                  userHumoursArray[tempPosChosen] = game.humoursCodeArray[tempPosChosen];
                  //Update the tracking array to know that a value is true
                  userHTrackArray[tempPosChosen] = 1;
                  //reset temp vars in case we iterate on the for loop again
                  openPos = 0;
                  tempOpenPosArray = [];
                  tempPosChosen = -1;
               }else{
                  humArrayFull = true;
                  i = i-1;
               }
            }else{
               i = i-1;
            }
         }else{
            if(!symArrayFull){
               //Make array of open positions
               for(var k = 0; k < game.numberOfsymptoms; k++){
                  if(userSTrackArray[k] === 0){
                     tempOpenPosArray[openPos] = k;
                     openPos++;
                  }
               }
               if(openPos != 0){
                  //random pick of open position
                  console.log("tempOpenPosArray.length = " + tempOpenPosArray.length)
                  tempPosChosen = tempOpenPosArray[Math.floor(Math.random() * tempOpenPosArray.length)]
                  //Use random open position to get value from the solution array
                  //and add that value into the postion on the userArray that
                  //we will then transmit back to the user
                  console.log("Setting s openPos: " + tempPosChosen + " to: " + game.symptomsCodeArray[tempPosChosen])
                  userSymptomsArray[tempPosChosen] = game.symptomsCodeArray[tempPosChosen];
                  //Update the tracking array to know that a value is true
                  userSTrackArray[tempPosChosen] = 1;
                  //reset temp vars in case we iterate on the for loop again
                  openPos = 0;
                  tempOpenPosArray = [];
                  tempPosChosen = -1;
               }else{
                  symArrayFull = true;
                  i = i-1;
               }
            }else{
               i = i-1;
            }
         }
      }
      socketServer.broadcast(JSON.stringify({"type":"examine","userHumoursArray":userHumoursArray,"userSymptomsArray":userSymptomsArray, "userHTrackArray":userHTrackArray, "userSTrackArray":userSTrackArray, "userId":userId}))
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
