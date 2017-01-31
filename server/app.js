var app = require('http').createServer(handler)
var io = require('socket.io')(app);
var fs = require('fs');
var sleep = require('sleep');

app.listen(8086);

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200);
            res.end(data);
        });
}

var bombs = [{
    name: 'Butter',
    radius: 15,
    yield: 400,
    country: 'India',
    fillKey: 'Gurgaon',
    user: 'tsudot',
    latitude: 28.4595,
    longitude: 77.0266 
},{
    name: 'Rice',
    radius: 15,
    yield: 1600,
    country: 'India',
    fillKey: 'Mumbai',
    user: 'gsin',
    latitude: 19.0760,
    longitude: 72.8777

}
];

function send_data(socket) {
    console.log('Sending it');
    socket.emit('search_event', bombs);
    sleep.sleep(3);
    send_data(socket);
}

io.on('connection', function (socket) {
    socket.emit('search_event', bombs);
    // send_data(socket);
});


