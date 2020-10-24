const WebSocket = require("ws");
 
const server = new WebSocket.Server({ port: 3000 });
 
var clients = [];
var sessions = {};
var students = {};

function on_connection(client) {
  console.log("New connection!");
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
      console.log(messageObject);
      msgType = messageObject.type;
      console.log(msgType);
      if (msgType == "Teacher") {
          var currentSID = messageObject.sessionID;
          var currentGroupSize = messageObject.groupSize; 
          sessions[currentSID] = [currentGroupSize];
          console.log(sessions);
      }

      if (msgType == "Student") {
        var currentSID = messageObject.sessionID;
        if (sessions[currentSID]) {
            sessions[currentSID].push(messageObject.studentName); //push the student name to the session id
            broadcast("Update prefrences list");
        }
        else {
            console.log("This session doesn't exist!");
        }
        console.log(sessions);
      }

      if (msgType == "End") {
          broadcast("/" + messageObject.sessionID); // "/" header to message = end session
      }

      if (msgType == "Get") {
        client.send(JSON.stringify(sessions[messageObject.sessionID]));
      }
});
}


 
server.on("connection", on_connection);
 