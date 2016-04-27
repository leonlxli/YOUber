var map;
var allData;

/*d3.json("/getRankedData?uber=UberX", function(err, dat) {
    allData = dat.SortedData;
    // console.log(allData);
    // console.log(dat.SortedData[0].data['scaled data']);
    // console.log(dat);
});*/

function selectUber(uber) {

  map.data.forEach(function(region) {
    map.data.overrideStyle(region, { fillColor: 'black'});
  });

  $('#rankings').children('button').remove();
  d3.json('/getRankedData?uber=' + uber, function(err, dat) {
    allData = dat.SortedData;
    allData.sort(function(a, b) { return b.rank - a.rank; });
    for (var i = 0; i < 10; i++) {

      // TODO: make it a clickable link that triggers onclick event to pop up d3 graph, as if you clicking on map.
      $('#rankings').append('<button class="ranking list-group-item" onclick="doShit()">' + allData[i].Area + '</button>');

      map.data.forEach(function(region) {
        if (region['R']['NAME'] == allData[i].Area.toUpperCase()) {
          map.data.overrideStyle(region, {fillColor: 'green'});
        }
      });
    }
  });
}

function doShit() {
  alert('fuk u');
}

$(document).ready(function() {
  selectUber('UberX');
});

$('#d3').hide();
//var data = [4, 8, 15, 16, 23, 42];
// Function to create the bar graph
function buildGraph(myData) {
    d3.selectAll("svg > *").remove();

    var obj = allData[i].data['scaled data']; // gets all the scaled data json
    var arr = Object.keys(obj).map(function(k) {
        return obj[k]
    }); // converts the values to an array
    var key = Object.keys(obj); // gets the key of json

    var scale = {
        //x: d3.scale.ordinal(),
        y: d3.scale.linear()
    };
    var margin = {
            top: 20,
            right: 20,
            bottom: 70,
            left: 40
        },
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    function mergeArray(keyArray, valueArray) {
        var result = [];
        var tmp = [];
        for (var i = 0; i < keyArray.length; i++) {
            tmp = [keyArray[i], valueArray[i]];
            result.push(tmp);
        }
        return result;
    }

    var dataset = mergeArray(key, arr);

    scale.y.domain([0, 10]);
    scale.y.range([height, 0]);

    var barWidth = 20;

    var chart = d3.select('.chart')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xScale = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var yScale = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");


    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(10);

    var mapper = [];

    for (var key in myData.data['scaled data']) {
        mapper.push({
            'name': key.replace(' scaled', ''),
            'value': myData.data['scaled data'][key]
        });
    }

    xScale.domain(mapper.map(function(d) {
        return d.name;
    }));
    yScale.domain([0, 10]);

    var padding = 1;

    chart
        .selectAll(".bar")
        .data(mapper)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d, i) {
            return xScale(d.name);
        })
        .attr("width", xScale.rangeBand())
        .attr("y", function(d) {
            return yScale(d.value);
        })
        .attr("height", function(d) {
            return height - yScale(d.value);
        });

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    chart
        .append("g").attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
     .attr("dx", "-.8em")
     .attr("dy", ".15em")
     .attr("transform", "rotate(-18)");;


    chart.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Frequency");



    // chart.selectAll("text")
    //    .data(obj, 12)
    //    .enter()
    //    .append("text")
    //    .text(function(d) {
    //    return d.value;
    //    })
    //    .attr("text-anchor", "middle")
    //    .attr("x", function(d, i) {
    //    return xScale(i) + xScale.rangeBand() / 2;
    //    })
    //    .attr("y", function(d) {
    //    return h - yScale(d.value) + 14;
    //    })
    //    .attr("font-family", "sans-serif")
    //    .attr("font-size", "11px")
    //    .attr("fill", "white");

    return chart;
}


window.initMap = function() {

    var minZoomLevel = 9;

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: minZoomLevel,
        center: new google.maps.LatLng(32.8787, -117.0400),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false
    });


    // // Bounds for North America
    // var strictBounds = new google.maps.LatLngBounds(
    //     new google.maps.LatLng(32.7297, -117.0451),
    //     new google.maps.LatLng(33.2157, -117.0300));
    //
    // // Listen for the dragend event
    // var lastValidCenter = map.getCenter();
    // google.maps.event.addListener(map, 'center_changed', function() {
    //     if (strictBounds.contains(map.getCenter())) {
    //         // still within valid bounds, so save the last valid position
    //         lastValidCenter = map.getCenter();
    //         return;
    //     }
    //
    //     // not valid anymore => return to last valid position
    //     map.panTo(lastValidCenter);
    // });

    // Limit the zoom level
    google.maps.event.addListener(map, 'zoom_changed', function() {
        if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
    });

    var cityName;
    map.data.loadGeoJson('./map/sdcounty.json');
    map.data.addListener('mouseover', function(event) {
        document.getElementById('info-box').textContent =
            event.feature.getProperty('NAME');
    });

    var infoWindow = new google.maps.InfoWindow({

    });
    // Creates the infoWindow object


    map.data.addListener('click', function(event) {
        infoWindow.close();
        infoWindow = new google.maps.InfoWindow({

        });
        cityName = event.feature.getProperty('NAME');
        for (i = 0; i < allData.length; i++) {
            if (cityName.toUpperCase() == allData[i].Area.toUpperCase()) {
                // Render Data for bar graphs
                // console.log(allData[i].data['scaled data']);
                var bars = buildGraph(allData[i], infoWindow);

            }
        }
        var html = "<p>" + cityName + "</p>";
        var d3 = $('#d3').html();
        // console.log(d3);
        infoWindow.setContent(html + d3);
        //buildGraph(html, infoWindow);
    })

    // Opens infoWindow on click
    map.data.addListener("click", function(event) {
        infoWindow.close();
        var latlng = event.latLng;
        //console.log(latlng);
        infoWindow.setPosition(latlng);
        infoWindow.open(map);

    });

    // Closes window when mouseOut
    map.data.addListener("mouseout", function() {
        // infoWindow.close();
    });
}
