var iconSize = [13, 20];
var iconAnchor = [3, 10];
var popupAnchor = [1, -16];

var originalIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor,
    shadowSize: [0, 0]
});

var simplifiedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: iconSize,
    iconAnchor: iconAnchor,
    popupAnchor: popupAnchor,
    shadowSize: [0, 0]
});

var map;

function initializeMap() {
    map = L.map('map').setView([39.71923, 116.78379], 13);
}

function resetMap() {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    map.setView([39.71923, 116.78379], 13);
}

function addMarker(location, map, icon) {
    var marker = L.marker([location.latitude, location.longitude], {icon: icon}).addTo(map);
    return marker;
}

function drawPolyline(points, map, color) {
    var polyline = L.polyline(points, {color: color}).addTo(map);
    return polyline;
}
