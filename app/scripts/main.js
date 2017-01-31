function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

$(document).ready(function() {
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
            'subtract': '#cc4731'
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
        }

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

    world_map.bubbles(bombs, {
        popupTemplate: function (geo, data) {
            return ['<div class="hoverinfo">' +  data.name,
                '<br/>User: ' + data.user + '',
                '<br/>Country: ' +  data.country + '',
                '</div>'].join('');
        }
    });

    world_map.bubbles([]);

    var socket = io('http://localhost:8086/');
    socket.on('search_event', function(message){
        console.log(message);
        var data = JSON.parse(message);

        world_map.bubbles(data);
    })
});

