var map;

function initMap() {
    var minZoomLevel = 11;

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: minZoomLevel,
        center: new google.maps.LatLng(32.8087, -117.0500),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });


    // Bounds for North America
    var strictBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(32.7297, -117.0551),
        new google.maps.LatLng(32.9057, -117.0400));

    // Listen for the dragend event
    google.maps.event.addListener(map, 'center_changed', function() {
        if (strictBounds.contains(map.getCenter())) {
            // still within valid bounds, so save the last valid position
            lastValidCenter = map.getCenter();
            return;
        }

        // not valid anymore => return to last valid position
        map.panTo(lastValidCenter);
    });
    d3.json("../map/sdcounty.json", function(data) {
      console.log(data);
        setPolygon(data.features, 0);
    });


    // Limit the zoom level
    google.maps.event.addListener(map, 'zoom_changed', function() {
        if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
    });
}

function setPolygon(data, index) {
    if (index < data.length) {
        var color = color_level_4;
        var path = data[index].geometry.coordinates[0];
        var address = data[index].properties.NAME;
        var indexOfAddress = regionNames.indexOf(address);
        var regionValue = 0;
        if (indexOfAddress >= 0) {
            regionValue = datasetPicked[indexOfAddress];
        }
        if (regionValue == 0) {
            color = "#FFFFFF";
        } else if (regionValue <= value_level_4) {
            color = color_level_4;
        } else if (regionValue <= value_level_3) {
            color = color_level_3;
        } else if (regionValue <= value_level_2) {
            color = color_level_2;
        } else if (regionValue <= value_level_1) {
            color = color_level_1;
        }
        var coords = [];
        for (var j = 0; j < path.length; j++) {
            coords.push(new google.maps.LatLng(path[j][1], path[j][0]));
        }
        var polygon = new google.maps.Polygon({
            paths: coords,
            strokeColor: "#0000000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: color,
            fillOpacity: 0.35
        });
        polygon.setMap(map);
        var contentString = '<div class="infowindow">' +
            '<h2>' + address + '</h2>' +
            '<div>' +
            '<h3>' + regionValue + '</h3>' +
            '<p>' + "Is the Likelihood of Experiencing an Issue (based on Dataset) for Your Selected Group (Gender and Age)," + '</p>' +
            '<p>' + "Compared with the Average Person in San Diego" + '</p>' +
            '</div>' +
            '</div>';

        var infowindow = new google.maps.InfoWindow({
            content: contentString
        });
        google.maps.event.addListener(polygon, 'click', function(event) {
            infowindow.setPosition(event.latLng);
            infowindow.open(map, polygon);
            var element = document.getElementById('location');
            element.innerHTML = address;
            d3.select(ageBar)
                .attr("fill", "steelblue");

            d3.select(genderBar)
                .attr("fill", "steelblue");

            ageBar = "#age" + address.replace(/\s+/g, '');
            d3.select(ageBar)
                .attr("fill", "red");
            genderBar = "#gender" + address.replace(/\s+/g, '');
            d3.select(genderBar)
                .attr("fill", "red");
            //selectArea(address);
            //TODO: click event
        });
        google.maps.event.addListener(polygon, 'mouseover', function() {
            //TODO: mouseover event
        });
        google.maps.event.addListener(polygon, 'mouseout', function() {
            infowindow.close();
        });
        polygons.push(polygon);
        setPolygon(data, index + 1);
    }
}