function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


$(document).ready(function() {
    var ws = new WebSocket("ws://172.31.80.41:8086/");

	var order_bombs = [];

	var EVENT_POPUP_WINDOW = 20;

	// Write your code in the same way as for native WebSocket:
	ws.onopen = function() {
		ws.send("Hello");  // Sends a message.
	};

	ws.onmessage = function(e) {
		// Receives a message.
		var data = JSON.parse(e.data)

		if (data['event'] == "receive_order") {
			order_bombs.push(data['data'][0])
			console.log('bombs')
			console.log(bombs);
			console.log('order_bombs');
			console.log(order_bombs.slice(-EVENT_POPUP_WINDOW));
			world_map.bubbles(order_bombs.slice(-EVENT_POPUP_WINDOW));
		}

	};

	ws.onclose = function() {
		console.log("closed");
	};



    var world_map = new Datamap({
        element: document.getElementById('map'),
        scope: 'world',
        geography_config: {
            highlightOnHover: false,
            popupOnHover: false
        },
        projection: 'mercator',
        fills: {
            defaultFill: '#ccc',
            'add': '#306596',
            'subtract': '#cc4731',
			'orders': '#3296DB'
        },
		data: {
			'receive_order': {fillKey: 'receive_order'}
		},
        response: true,
        setProjection: function(element) {
            var projection = d3.geo.equirectangular()
                .center([80, 25])
                .scale(700)
                .translate([element.offsetWidth / 2, element.offsetHeight / 2]);
            var path = d3.geo.path()
                .projection(projection);

            return {path: path, projection: projection};
        },
		bubblesConfig: {
			popupTemplate: function (geo, data) {
				return ['<div class="hoverinfo">' +  data.name,
					'<br/>User: ' + data.user + '',
					'<br/>Country: ' +  data.country + '',
					'</div>'].join('');
			}
		},

    });

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

    world_map.bubbles([]);
/**
    var socket = io('http://172.31.80.41:8086/');
    socket.on("connect", function () {
        console.log("Connected!");
    });
    socket.on('receive_order', function(message){
        console.log(message);
        var data = JSON.parse(message);

        world_map.bubbles(data);
    })
**/
});


