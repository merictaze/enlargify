// load required modules
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var sio     = require("socket.io");         // web socket external module
var easyrtc = require("easyrtc");           // EasyRTC external module

// setup and configure Express http server. Expect a subfolder called "static" to be the web root.
var httpApp = express();
httpApp.use(express.static(__dirname + "/public"));
httpApp.use(express.json());

httpApp.get("/", function(req, res) {
    res.sendfile(__dirname + "/index.html");
});

// start Express http server
var port = process.env.PORT || 5000;
var webServer = http.createServer(httpApp).listen(port);

// start Socket.io so it attaches itself to Express server
var io = sio.listen(webServer, {"log level":1});

// start EasyRTC server
easyrtc.listen(httpApp, io, {logLevel:"debug", logDateEnable:true});

var userList = {};
var waitingList = {};
var socketCount=0;

io.sockets.on("connection", function(socket) {
  socketCount++;

  socket.on("init_user", function(userData){
    // update the list of users
    userList[socket.id] = {"id": socket.id, "name": userData.name};
    
    // send the connected user list to the new user
    socket.emit("ui_user_set", userList);
    // send the new user to the all other users
    socket.broadcast.emit("ui_user_add", userList[socket.id]);
  });
  
  socket.on("next_user", function() {
    if(waitingList[socket.id]) return;

    if (Object.keys(waitingList).length == 0) {
      waitingList[socket.id] = true;
    } else {
      // pick a partner from the waiting list
      socket.partnerId = Object.keys(waitingList)[0];

      // connect two user with each other
      socket.emit("connect_partner", {'caller':false, 'partnerId': socket.partnerId});
      partnerSocket = io.sockets.socket(socket.partnerId);
      partnerSocket.partnerId = socket.id;
      partnerSocket.emit("connect_partner", {'caller':true, 'partnerId': socket.id});
      
      // delete the partner from the waiting list
      delete waitingList[socket.partnerId];
    }
  });
});

// Since "disconnect" event is consumed by easyRTC,
// socket.on("disconnect",function(){}) will not work
// use easyrtc event listener for disconnect
easyrtc.events.on("disconnect", function(connectionObj, next){
  // call the default disconnect method 
  easyrtc.events.emitDefault("disconnect", connectionObj, next);

  var socket = connectionObj.socket;
  var id = socket.id; 
  // clear the server side variables
  socketCount--;
  delete userList[id];
  delete waitingList[id];
  
  // adjust the client side
  io.sockets.emit("ui_user_remove", id);
  if (socket.partnerId){
    partnerSocket = io.sockets.socket(socket.partnerId);
    partnerSocket.emit("disconnect_partner", socket.id);
    socket.partnerId = null;
  }
});
