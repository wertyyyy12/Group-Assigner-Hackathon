const { stringify } = require("querystring");
const WebSocket = require("ws");
 
const server = new WebSocket.Server({ port: 3000 });
 
var clients = [];
var sessions = {};
var prefrences = {};
var currentGroupSize;

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
          currentGroupSize = messageObject.groupSize; 
          sessions[currentSID]["groupSize"] = currentGroupSize;
      }

      if (msgType == "Student") {
        var currentSID = messageObject.sessionID;
        if (sessions[currentSID]) {
            sessions[currentSID].push(messageObject.studentName); //push the student name to the session id
            broadcast("Update prefrence list|" + currentSID);
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
            prefrences[sID] = {};
          }
          console.log()
      }

      if (msgType == "StudentEnd") {
          var thatStudentsID = messageObject.studentData[1];
          var thatStudentName = messageObject.studentData[0];
          var thatStudentPrefrences = messageObject.studentData;
          thatStudentPrefrences.shift();
          thatStudentPrefrences.shift();
          //shift twice to delete student's ID and name from prefrences
          prefrences[thatStudentsID][thatStudentName] = thatStudentPrefrences;
          console.log("sessions: ");
          console.log(sessions);
          prefrences[thatStudentsID]["groupSize"] = sessions[thatStudentsID][0]; //buggy for sure but who gives a f--

          console.log(prefrences);
      }

      if (msgType == "Get") {
        client.send(JSON.stringify(sessions[messageObject.sessionID]));
      }
});
}


 
server.on("connection", on_connection);
 