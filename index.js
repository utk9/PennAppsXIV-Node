var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(8080, function() {
	console.log("Listening on port 8080. Hit Ctrl-c to stop server.")
});

function handler (req, res) {
	if (req.method == 'GET' && req.url == '/'){
		res.write("Index route");
		res.statusCode = 200;
		res.end();
	} else if(req.method == 'GET' && req.url == '/about'){
		res.write("about route");
		res.statusCode = 200;
		res.end();
	} 
	else{
		res.statusCode = 404;
		res.end("Not Found");
	}
}

function generateRandomPlayerLocation(min, max, id) {
	return {
		player_id: id,
		location_x:  Math.floor(Math.random() * (max - min + 1)) + min,
		location_y:  Math.floor(Math.random() * (max - min + 1)) + min,
		location_z:  Math.floor(Math.random() * (max - min + 1)) + min,
		rotation_x:  0,
		rotation_y:  0,
		rotation_z:  0,
	}
}

var generateAsteroids = function(radius, numAsteroids) {
  var NUM_ASTEROID_TYPES = 5;
  var locations = [];
  var randVal = function() {
    return Math.floor(Math.random() * radius) - radius / 2;
  }
  for (var i = 0; i < numAsteroids; i++){
    locations.push({
      location_x: randVal(),
      location_y: randVal(),
      location_z: randVal(),
      type: Math.floor(Math.random() * NUM_ASTEROID_TYPES)
    });
  }
  return locations;
};

// TODO: Generate this every time a game starts when this feature has been implemented
var asteroids = generateAsteroids(1000, 5000);

io.on('connection', function (socket) {
	// Sets an ID and random position
	var id = Date.now().toString(); 
  var beginningPosition = generateRandomPlayerLocation(0, 100, id);
	console.log("New player", beginningPosition); 
	socket.emit("player_initialize", beginningPosition);
	// Gives the player information about the asteroids on the map
  socket.emit("set_asteroids", {data: asteroids});//{data: asteroids});
  // Lets everyone know that a player joined
  socket.broadcast.emit("player_join", beginningPosition);
	// Sets up the listeners
  socket.on("shot_fired", function(data) {
		console.log("Received Shot Fired!");
    socket.broadcast.emit("shot_fired", data);
	}); 

	socket.on("disconnect", function () {
		console.log("Player " + id + " disconnected!");
    socket.broadcast.emit("player_leave", {player_id: id});
	});
	socket.on("location_update", function(data) {
		socket.broadcast.emit("location_update", data);
	});
	socket.on("player_health_update", function(data) {
		socket.broadcast.emit("player_health_update", data);
	});
	socket.on("player_death", function (data) {
		socket.broadcast.emit("player_death", data);
		setTimeout(function(){
			io.emit("player_respawn", generateRandomPlayerLocation(0, 100, id));
		}, 1000);
	})
});

setInterval(function() {
  var ammo = generateRandomPlayerLocation(0, 100);
  ammo.amount = Math.floor(Math.random() * 4) + 3
  io.emit("ammo_spawn", ammo);
}, 7000);
