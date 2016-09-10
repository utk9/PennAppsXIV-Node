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
	console.log("new connection");
  socket.emit('hello_new_user');
  socket.on('test_client_event', function () {
    console.log("Client sent test event.");
  });
});