// GeoServer Configuration
const geoServerIPPort = 'localhost:8080';
const geoServerWorkspace = 'ne';
const geoServerWmsUrl = `http://${geoServerIPPort}/geoserver/${geoServerWorkspace}/wms`;
const layerName = 'ne:countries'; // Update with your workspace and layer

// Initialize map
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add WMS layer button functionality
document.getElementById('add-layer-btn').addEventListener('click', () => {
    if (!map.hasLayer(window.geoServerLayer)) {
        window.geoServerLayer = L.tileLayer.wms(geoServerWmsUrl, {
            layers: layerName,
            format: 'image/png',
            transparent: true,
        }).addTo(map);
        alert('Layer added to the map!');
    } else {
        alert('Layer is already added.');
    }
});

// Initialize draggable markers
let startMarker = L.marker([51.505, -0.09], { draggable: true }).addTo(map).bindPopup('Start Point').openPopup();
let endMarker = L.marker([51.515, -0.1], { draggable: true }).addTo(map).bindPopup('End Point').openPopup();

let routeLayer = null;

// Update input fields when markers move
function updateInputFields() {
    document.getElementById("startLat").value = startMarker.getLatLng().lat.toFixed(6);
    document.getElementById("startLng").value = startMarker.getLatLng().lng.toFixed(6);
    document.getElementById("endLat").value = endMarker.getLatLng().lat.toFixed(6);
    document.getElementById("endLng").value = endMarker.getLatLng().lng.toFixed(6);
    drawRoute(startMarker.getLatLng(), endMarker.getLatLng());
}

// Attach event listeners to markers
startMarker.on('dragend', updateInputFields);
endMarker.on('dragend', updateInputFields);

// Draw the route between start and end points
function drawRoute(start, end) {
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (routeLayer) map.removeLayer(routeLayer); // Remove previous route

            if (data.routes && data.routes.length > 0) {
                routeLayer = L.geoJSON(data.routes[0].geometry).addTo(map);
                map.fitBounds(routeLayer.getBounds());
            } else {
                alert("No route found!");
            }
        })
        .catch(error => {
            console.error("Error fetching route:", error);
        });
}

// Save start and end points to the server
function savePoints() {
    const startLat = document.getElementById("startLat").value;
    const startLng = document.getElementById("startLng").value;
    const endLat = document.getElementById("endLat").value;
    const endLng = document.getElementById("endLng").value;

    const payload = {
        start: { lat: parseFloat(startLat), lng: parseFloat(startLng) },
        end: { lat: parseFloat(endLat), lng: parseFloat(endLng) }
    };

    fetch('http://localhost:3000/save-points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (response.ok) {
                alert("Points saved successfully!");
            } else {
                alert("Failed to save points.");
            }
        })
        .catch(error => {
            console.error("Error saving points:", error);
        });
}
