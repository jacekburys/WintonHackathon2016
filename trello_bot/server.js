const WebSocket = require('ws');

var server = require('http').createServer()
  , WebSocketServer = require('ws').Server
  , wss = new WebSocketServer({ server: server })
  , express = require('express')
  , app = express()
  , port = 4080;

var Trello = require("trello");
var api_key = "c25fc39c270a686a1b6c5ab689b889b3";
var token = "9d5440f409e85fc45d076e342f7087ae3900c631429b35f9bc20f43d6f58554f";
var trello = new Trello(api_key, token);

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

var currentBoard = "";

function startsWith(a, b) {
  if (a.length < b.length) return false;
  for (var i=0; i<b.length; i++) {
    if (a[i] != b[i]) return false;
  }
  return true;
}

function isCommand(s) {
  console.log("isCommand " + s);
  var commands = ["boards", "currentBoard", "selectBoard", "cards"];
  for (var i=0; i<commands.length; i++) {
    if (startsWith(s, "/" + commands[i])) return true;
  }
  return false;
}

//function addCard(myListId) {
//  trello.addCard('Clean car', 'Wax on, wax off', myListId,
//      function (error, trelloCard) {
//          if (error) {
//              console.log('Could not add card:', error);
//          }
//          else {
//              console.log('Added card:', trelloCard);
//          }
//      });
//}

const ws = new WebSocket('ws://chat.wintonhackathon.com/rooms/test/ws');

function processCommand(command) {
  var words = command.split(" ");
  if (startsWith(command, "/board")) {
    trello.getBoards("jacekburys", function(error, boards) {
      if (error) {
        console.log(error);
      } else {
        var res = "";
        for (var i=0; i<boards.length; i++) {
          res = res + boards[i].name + ", ";
        }
        ws.send(JSON.stringify({
          "user" : "TrelloBot",
          "message" : res
        }));
      }
    });
  } else if (startsWith(command, "/currentBoard")) {
    if (!currentBoard) {
      res = "No board selected";
    } else {
      res = currentBoard.name;
    }
    ws.send(JSON.stringify({
      "user" : "TrelloBot",
      "message" : res
    }));
  } else if (startsWith(command, "/selectBoard")) {
    //currentBoard = words[1];
    trello.getBoards("jacekburys", function(error, boards) {
      if (error) {
        console.log(error);
      } else {
        for (var i=0; i<boards.length; i++) {
          if (boards[i].name == words[1]) {
            currentBoard = boards[i];
          }
        }
      }
    });
  } else if (startsWith(command, "/cards")) {
    trello.getCardsOnBoard(currentBoard.id, function(error, cards) {
      if (error) {
        console.log(error);
      } else {
        console.log(cards);
        //var res = "";
        //for (var i=0; i<boards.length; i++) {
        //  res = res + boards[i].name + ", ";
        //}
        //ws.send(JSON.stringify({
        //  "user" : "TrelloBot",
        //  "message" : res
        //}));
      }
    });
  }
}

ws.on('open', function open() {
  console.log("opened");  
});

ws.on('message', function(data, flags) {
  data = JSON.parse(data);
  if (data.user == "TrelloBot") return;
  if (isCommand(data.message)) {
    console.log('command');
    processCommand(data.message);
  } else {
    console.log('not command');
  }
});

server.listen(port, function () { console.log('Listening on ' + server.address().port) });
