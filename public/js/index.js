var map;

window.initMap = function(){

    var minZoomLevel = 9;

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: minZoomLevel,
        center: new google.maps.LatLng(32.8787, -117.0400),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    });


    // Bounds for North America
    var strictBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(32.7297, -117.0451),
        new google.maps.LatLng(33.2157, -117.0300));

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


    // Creates the infoWindow object
    var infoWindow = new google.maps.InfoWindow({

    });

    map.data.addListener('click', function(event) {
      cityName = event.feature.getProperty('NAME');
      var html = "<p>" + cityName + "</p>";
      infoWindow.setContent(html);
    })

    // Opens infoWindow on click
    map.data.addListener("click", function(event) {
      var latlng = event.latLng;
      //console.log(latlng);
      infoWindow.setPosition(latlng);
      infoWindow.open(map);

    });

    // Closes window when mouseOut
    map.data.addListener("mouseout", function() {
      infoWindow.close();
    });



}
