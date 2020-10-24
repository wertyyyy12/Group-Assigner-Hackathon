const { stringify } = require("querystring");
const WebSocket = require("ws");
 
const server = new WebSocket.Server({ port: 3000 });
 
var clients = [];
var sessions = {};
var prefrences = {};

function on_connection(client) {
  console.log("New connection");
  clients.push(client);

  function broadcast(msg) {
    for (var i = 0; i < clients.length; i++) {
        var client = clients[i];

        if (client.readyState == WebSocket.OPEN) { 
            client.send(msg);
        }
    }
}

  client.on("message", function onMessage(msg) {
      var messageObject = JSON.parse(msg); 
      msgType = messageObject.type;
      if (msgType == "Teacher") {
          var currentSID = messageObject.sessionID;
          var currentGroupSize = messageObject.groupSize; 
          sessions[currentSID] = [currentGroupSize];
      }

      if (msgType == "Student") {
        var currentSID = messageObject.sessionID;
        if (sessions[currentSID]) {
            sessions[currentSID].push(messageObject.studentName); //push the student name to the session id
            broadcast("Update prefrences list|" + currentSID);
        }
        else {
            console.log("This session doesn't exist!");
        }
      }

      if (msgType == "End") {
          var sendData = {
              type: "End",
              sessionID: messageObject.sessionID
          }
          broadcast(JSON.stringify(sendData));
          //prepare prefrences dictionary with key values of sessions
          prefrences = sessions;
          for (const [sID, prefs] of Object.entries(prefrences)) {
            prefrences[sID] = "";
          }
      }

      if (msgType == "Get") {
        client.send(JSON.stringify(sessions[messageObject.sessionID]));
      }
});
}


 
server.on("connection", on_connection);
 