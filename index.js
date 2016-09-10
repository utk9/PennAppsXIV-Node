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

io.on('connection', function (socket) {
	console.log("New Player!");

	//generate id for players
	var id = Date.now().toString(); 
	var beginningPosition = generateRandomPlayerLocation(0, 100, id);
	console.log("New player", beginningPosition);
	socket.emit("player_initialize", beginningPosition);
	socket.broadcast.emit("player_join", beginningPosition);

	socket.on("shot_fired", function(data) {
		socket.broadcast.emit("shot_fired", data);
	}); 

	socket.on("disconnect", function () {
		console.log("Player " + id + " disconnected!");
    socket.broadcast.emit("player_leave", {player_id: id});
	});
	socket.on("location_update", function(data) {
    console.log("DATA: " + JSON.stringify(data));
    console.log("Update event for id " + data.player_id);
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
	setInterval(function() {
		io.emit("ammo_spawn", generateRandomPlayerLocation(0, 100));
	}, 7000);
});
