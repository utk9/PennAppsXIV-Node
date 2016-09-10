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

io.on('connection', function (socket) {
	console.log("connection");
	socket.emit("id_assignment", {id: 123});
	socket.on("new_player_joined", function () {
		console.log("new_player joined");
		var myId = Date.now();
		socket.emit("id_assignment", {id: myId});
		socket.broadcast.emit("new_player", {
			id: myId,
			location_x: 50,
			location_y: 50,
			location_z: 50,
			rotation_x: 45,
			rotation_y: 45,
			rotation_z: 45,
		});
	});
	socket.on("melissa_mouse_down", function() {
		console.log("FIREEE")
	});
  
});