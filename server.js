const WebSocket = require("ws");
 
const server = new WebSocket.Server({ port: 3000 });
 
var clients = [];

function on_connection(client) {
  console.log("New connection!");
  clients.push(client);

  client.on("message", function onMessage(msg) {
      broadcast(msg);
  });
}

function broadcast(msg) {
    for (var i = 0; i < clients.length; i++) {
        var client = clients[i];

        if (client.readyState == WebSocket.OPEN) { 
            client.send(msg);
        }
    }
}
 
server.on("connection", on_connection);
 