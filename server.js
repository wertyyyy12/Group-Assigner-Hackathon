const { stringify } = require("querystring");
const WebSocket = require("ws");
 
const server = new WebSocket.Server({ port: 3000 });
 
var clients = [];
var sessions = {};
var prefrences = {};
var currentGroupSize;
var selected = {};

class Group {
	constructor(max_value) {
		this.max_value = max_value;
		this.value = {}
		this.currentGroup = 0
	}
	add(base, added) {
		if (this.value[this.currentGroup] == undefined) {
			this.value[this.currentGroup] = [base];
			delete selected[base];

		}
		this.value[this.currentGroup].push(added);
		delete selected[added];

	}


}

//def sorting(Preferences: dict, max):
function sorting(preferences, max) {
	//  # Preferences is a hashmap with the names of the student who selected it as keys and the students they selected as values
	//  selected = {}
	//  for name, pref in Preferences:
	//      selected[pref] += name
	for (var i = 0; i < Object.keys(preferences).length; i++) {
		var name = Object.entries(preferences)[i][0];
		var pref = Object.entries(preferences)[i][1];
		if (selected[name] == undefined) {
			selected[name] = [];
		}
		for (var j = 0; j < pref.length; j++) {
			if (selected[pref[j]] == undefined) {
				selected[pref[j]] = [];
			}
			selected[pref[j]].push(name);
		}
	}

	for (var i = 0; i < Object.keys(selected).length; i++) {
		if (selected[Object.keys(selected)[i]] == undefined) {
			selected[Object.keys(selected)[i]] = [0]
		}
	}
	const sortable = Object.entries(selected)
		.sort(([, a], [, b]) => a - b)
		.reduce((r, [k, v]) => ({
			...r,
			[k]: v
		}), {});
	// console.log(sortable);
	selected = sortable;
	var groups = new Group(max);

	function makeGroup(nameIn, escapeValue) {
		if (escapeValue < Object.keys(preferences).length * 2 + 5) {
			if (selected[nameIn] != undefined) {
				var selectedBy = selected[nameIn];
				if (selectedBy.length > 0) {
					//for person in selectedBy:
					selectedBy.forEach(person => {
						if (selected[person] != undefined) {
							// $person is a singular person who selected $name
							if (preferences[person].includes(nameIn)) {
								groups.add(nameIn, person);
								if (groups.max_value - 1 > groups.value[groups.currentGroup].length) {
									makeGroup(person);
								} else if (groups.max_value - 1 == groups.value[groups.currentGroup].length) {
									groups.add(nameIn, Object.keys(selected)[0]);
									groups.currentGroup++;
								} else if (groups.max_value == groups.value[groups.currentGroup].length) {
									groups.currentGroup++;
								}
							}
						}
					});
				}
			}
		} else {
			groups.add(nameIn, Object.keys(selected)[0]);
			if (groups.max_value == groups.value[groups.currentGroup].length) {
				groups.currentGroup++;
			} else if (groups.max_value - 1 > groups.value[groups.currentGroup].length) {
				makeGroup(person);
			}
			i = 0
		}


	}
	for (var i = 0; 0 != Object.keys(selected).length; i++) {
		// $name is the person who has been selected by $selectedBy which is a group
		makeGroup(Object.keys(selected)[i], i);

	}
	return (groups.value);
}


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
          sessions[currentSID] = [currentGroupSize];
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
      }

      if (msgType == "StudentEnd") {
          var thatStudentsID = messageObject.studentData[1];
          var thatStudentName = messageObject.studentData[0];
          var thatStudentPrefrences = messageObject.studentData;
          thatStudentPrefrences.shift();
          thatStudentPrefrences.shift();
          //shift twice to delete student's ID and name from prefrences
        //   prefrences[thatStudentsID] = {};
          prefrences[thatStudentsID][thatStudentName] = thatStudentPrefrences;
        //   prefrences[thatStudentsID]["groupSize"] = currentGroupSize; //buggy for sure but who gives a f--
          groups = sorting(prefrences[thatStudentsID],currentGroupSize);
        //   console.log(groups);
        //   console.log(prefrences);

        // console.log(prefrences);
        console.log(groups);


      }

      if (msgType == "Get") {
        client.send(JSON.stringify(sessions[messageObject.sessionID]));
      }
});
}


 
server.on("connection", on_connection);
 