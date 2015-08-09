(function($) {

  var self = {
    id: null,
    partnerId: null,
    username: 'User_'+Math.random().toString(36).substring(4,8)
  };
  
  // store the DOM elements to use later
  var elMessages = $('#messages_container');
  var elUsers = $('#user_container');
  var elText = $('#message');
  var btnSend = $('#send_btn');

  // bind the event listeners
  btnSend.on('click', function() {
    var text = elText.val().trim();
    if(text){
      elText.val('');
      // as webRTC allows to send P2P message, send it to the partner
      // without interacting with the server
      easyrtc.sendPeerMessage(self.partnerId, 'send_peer_msg', text);
      // add message to the user
      addMessage(text, self.id);
    }
  });
  
  $('#next_btn').on('click', function() {
    hangupCall();
    addMessage('searching...');
    easyrtc.webSocket.emit('next_user');
  });
  
  $('#stop_btn').on('click', hangupCall);
  
  $('#clear_btn').on('click', function() {
    elMessages.html('');
  });


  // handle the key events
  elText.on('keypress', function(e) {
    if (e.keyCode == 13 && !e.shiftKey && !btnSend.hasClass('disabled')) {
      btnSend.trigger('click');
      return false;
    }
  });

  // will be trigerred on sendPeerMessage() call
  easyrtc.setPeerListener( function(senderId, msgType, msgData, targeting) {
    if( msgType === 'send_peer_msg' ) {
      addMessage(msgData, senderId);
    } else if(msgType === 'send_peer_disconnect') {
      disconnectMeFromPartner();
    }
  });

  // get the partner video stream - triggered on sucessful call
  easyrtc.setStreamAcceptor( function(callerId, stream) {
      var video = document.getElementById('partnerVideo');
      easyrtc.setVideoObjectSrc(video,stream);
  });
  
  // stop to receive the partner video stream - triggered on hangup call
  easyrtc.setOnStreamClosed( function (callerId) {
      var video = document.getElementById('partnerVideo');
      easyrtc.setVideoObjectSrc(video, '');
  });
  
  function connect() {
    //easyrtc.enableDebug(true);

    easyrtc.setUsername(self.username);
    easyrtc.initMediaSource(
      // success callback
      function() {
        // set the user own video
        var selfVideo = document.getElementById('selfVideo');
        easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
      },
      // failure callback
      function(errorCode, errmesg) {
        console.error('Failed to get your media: '+ errmesg);
      }
    );
    
    easyrtc.connect('enlargify_app',
      // success callback
      function(socketId) {
        self.id = socketId;

        // event listeners to update list of active users
        easyrtc.webSocket.on('ui_user_add', function(userData) {
          elUsers.append('<div id='+userData.id+'>'+userData.name+'</div>');
        });
        easyrtc.webSocket.on('ui_user_remove', function(userId) {
          elUsers.find('#'+userId).remove();
        });
        easyrtc.webSocket.on('ui_user_set', function(userList) {
          for (id in userList) {
            elUsers.append('<div id='+userList[id].id+'>'+userList[id].name+'</div>');
          }
        });
 

        easyrtc.webSocket.on('connect_partner', function(user) {
          if(user.caller){
            performCall(user.partnerId);
          } else {
            connectMeToPartner(user.partnerId);
          }
        });
        easyrtc.webSocket.on('disconnect_partner', function(partnerId){
          // checks whether still connected to the same user
          if(partnerId == self.partnerId){
            disconnectMeFromPartner();
          }
        });

        // make the necessary updates on the server side for the new user
        easyrtc.webSocket.emit('init_user', {'name':self.username});
      },
      // failure callback
      function(errCode, message) {
        console.error('Failed to connect to the server: '+ message);
      }
    );
  }

  function addMessage(text, senderId) {
    // Escape html special characters, then add linefeeds.
    var content = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />');
    if(!senderId) {
      // no sender, informative message only
      elMessages.append('<div><b>' + content + '</b></div>');
    } else {
      elMessages.append('<div>' + (senderId == self.id ? '<b>Me: </b>' : '<b>Stranger: </b>') + content + '</div>');
    }
  }

  function performCall(id) {
    connectMeToPartner(id);
    
    // fill these functions if necessary
    var successCB = function() {};
    var failureCB = function() {
      // reset partner on failure
      disconnectMeFromPartner();
    };
    var acceptedCB = function(isAccepted, callerId) {};
    easyrtc.call(self.partnerId, successCB, failureCB, acceptedCB);
  }

  // auto-accept the call
  easyrtc.setAcceptChecker(function(callerId, callback) {
      //callback(callerId == self.partnerId);
      callback(true);
  });
  
  function hangupCall() {
    if(self.partnerId) {
      // inform both users that they disconnected
      easyrtc.sendPeerMessage(self.partnerId, 'send_peer_disconnect', 'Disconnected');
      disconnectMeFromPartner();
    }
    easyrtc.hangupAll();
  }

  function connectMeToPartner(id) {
    addMessage('Connected');
    // set the partner
    self.partnerId = id;
    // enable the button to allow sending messages
    btnSend.removeClass('disabled');
  }

  function disconnectMeFromPartner() {
    addMessage('Disconnected');
    // reset the partner
    self.partnerId = null;
    // disable the button
    btnSend.addClass('disabled');
  }

  // start the process
  connect();
}(jQuery));