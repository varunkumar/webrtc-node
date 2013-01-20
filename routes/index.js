/**
 * Socket communcation
 */ 
 var sockets = {};
 exports.openSocket = function(io) {
  io.sockets.on('connection', function (socket) {
    socket.on('id', function(data) {
      var room = rooms[data.roomKey];
      var user = users[data.userId];
      socket.set('room', room);
      socket.set('user', user);
      sockets[data.userId] = socket;

      // Emit ready if atleast two users are connected
      var currentUsers = room.getCurrentUsers();
      for (var i = 0; currentUsers.length > 1 && i < currentUsers.length; i++) {
        var id = currentUsers[i].id;
        sockets[id].emit('ready');
      }
    });

    socket.on('message', function (data) {
      socket.get('room', function(err, room) {
        socket.get('user', function(err, user) {
          handleMessage(room, user, data);
        });
      });
    });
  });
};

function handleMessage(room, user, message) {
  console.log(room, user, message);
  if (message.type == 'bye') {
    room.removeUser(user);
  }

  // Notify other users
  var currentUsers = room.getCurrentUsers();
  for (var i = 0; i < currentUsers.length; i++) {
    var id = currentUsers[i].id;
    if (id != user.id)
      sockets[id].emit('message', message);
  }
}

/**
 * Route
 */
exports.index = function(req, res){
  var roomKey = req.query.r;
  var hd = req.query.hd;
  var userId = '', initiator = 1;

  // Constraints
  var pcConfig = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

  var pcConstraints = { 'optional': []};

  var mediaConstraints = { 'optional': [], 'mandatory': {} };
  if (hd = 1) {
    mediaConstraints['mandatory']['minHeight'] = 720;
    mediaConstraints['mandatory']['minWidth'] = 1280;
  }


  if (!roomKey) {
    // Create a new key
    roomKey = generateRandom(8);
    while (rooms[roomKey])
      roomKey = generateRandom(8);

    res.redirect('/?r=' + roomKey);
  } else {
    var room = rooms[roomKey];
    if (!room) {
      room = new Room(roomKey);
      rooms[roomKey] = room;

      initiator = 0;
    }

    if (room.getOccupancy() > 0) {
      var user = new User('');
      users[user.id] = user;

      room.addUser(user);
      userId = user.id;
    } else {
      // Room is already full. Create a new key
      roomKey = generateRandom(8);
      while (rooms[roomKey])
        roomKey = generateRandom(8);

      res.redirect('/?r=' + roomKey);
    }
  }

  res.render('index', { title: 'WebRTC Demo app', roomKey: roomKey, roomLink: 'http://' + req.headers.host + '/?r=' + roomKey, userId: userId, initiator: initiator, pcConfig: JSON.stringify(pcConfig), pcConstraints: JSON.stringify(pcConstraints), mediaConstraints: JSON.stringify(mediaConstraints)});
};

var rooms = {}, users = {};

function generateRandom(len) {
  return (Math.floor(Math.random() * Math.pow(10, len))).toString();
}

// User
var User = (function () {
  var nextId = 1;

  // constructor
  var cls = function (name) {
    this.id = nextId++;
    this.name = name;
    this.status;
  };

  return cls;
})();

// Room
var Room = (function () {
  var capacity = 2;
  var ROOM_FULL_EXCEPTION = "Room is already full";
  var USER_NOT_FOUND_EXCEPTION = "User not available in the room";

  // constructor
  var cls = function (key) {
    this.key = key;
    this.users = [];
    for (var i = 0; i < capacity; i++) {
      users[i] = null;
    }
  };

  cls.prototype = {
    toString: function() {
      var str = '[';

      for (var i = 0; i < capacity; i++) {
        var user = this.users[i];
        if (user)
          str += user + ",";
      }

      str += ']';
      return str;
    },
    getOccupancy: function () {
      var occupancy = 0;

      for (var i = 0; i < capacity; i++) {
        var user = this.users[i];
        if (!user)
          occupancy++;
      }
      return occupancy;
    },
    hasUser: function(user) {
      for (var i = 0; i < capacity; i++) {
        var u = this.users[i];
        if (u && u.id == user.id)
          return true;
      }
      return false;
    },
    addUser: function(user) {
      for (var i = 0; i < capacity; i++) {
        var u = this.users[i];
        if (!u) {
          this.users[i] = user;
          return true;
        }
      }
      throw ROOM_FULL_EXCEPTION;
    },
    removeUser: function(user) {
      for (var i = 0; i < capacity; i++) {
        var u = this.users[i];
        if (u && u.id == user.id) {
          this.users[i] = null;
          return true;
        }
      }
      throw USER_NOT_FOUND_EXCEPTION;
    },
    getCurrentUsers: function() {
      var currentUsers = [];
      for (var i = 0; i < capacity; i++) {
        var u = this.users[i];
        if (u)
          currentUsers.push(u);
      }
      return currentUsers;
    }
  };

  return cls;
})();