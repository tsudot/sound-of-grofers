function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


$(document).ready(function() {
    var EVENT_POPUP_WINDOW = 20;
    var WS_HOST = "172.31.80.41"
    var WS_PORT = 8086

    var ws = new WebSocket("ws://" + WS_HOST + ":" + WS_PORT + "/");

    var receive_order_bombs = [];
    var other_bombs = [];
    var receive_order_ui_pops = [];
    var other_ui_pops = [];

    var beat = new Howl({
          src: ['./assets/sound/beat.wav']
    });



    // Write your code in the same way as for native WebSocket:
    ws.onopen = function() {
        ws.send("Hello");  // Sends a message.
    };

    ws.onmessage = function(e) {
        // Receives a message.
        var data = JSON.parse(e.data)

        if (data['event'] == "receive_order") {
            receive_order_bombs.push(data['data'][0])
            receive_order_ui_pops = receive_order_bombs.slice(-EVENT_POPUP_WINDOW);
            beat.play();
        }
        else {
            other_bombs.push(data['data'][0])
            other_ui_pops = other_bombs.slice(-EVENT_POPUP_WINDOW);
        }

        world_map.bubbles(receive_order_ui_pops.concat(other_ui_pops));

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
            'receive_order': '#3296DB',
            'other': '#F26E21'
        },
        data: {
            'receive_order': {fillKey: 'receive_order'},
            'other': {fillKey: 'other'}
        },

        response: true,
        setProjection: function(element) {
            var projection = d3.geo.equirectangular()
                .center([80, 25])
                .scale(800)
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
            },
            borderWidth: 0,
            borderOpacity: 0
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
});
