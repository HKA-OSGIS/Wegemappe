// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Initialize draggable markers for start and end points
let startMarker = L.marker([51.505, -0.09], { draggable: true }).addTo(map).bindPopup('Start Point').openPopup();
let endMarker = L.marker([51.515, -0.1], { draggable: true }).addTo(map).bindPopup('End Point').openPopup();

let routeLayer = null; // To store the current route layer
let petrolPumpMarkers = []; // To store the petrol pump markers

// Update route based on markers
function updateRoute() {
    const start = startMarker.getLatLng();
    const end = endMarker.getLatLng();
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (routeLayer) map.removeLayer(routeLayer); // Remove previous route
            if (data.routes && data.routes.length > 0) {
                routeLayer = L.geoJSON(data.routes[0].geometry).addTo(map);
                map.fitBounds(routeLayer.getBounds());
                showRouteDistance(data.routes[0].distance); // Show distance of the first route
                findNearbyPetrolPumps(routeLayer.getBounds()); // Find petrol stations along the route
            } else {
                alert("No route found!");
            }
        })
        .catch(error => console.error("Error fetching route:", error));
}


// Show route distance on the map (in kilometers)
function showRouteDistance(distance) {
    const distanceInKm = (distance / 1000).toFixed(2);
    const distancePopup = L.popup()
        .setLatLng(routeLayer.getBounds().getCenter())
        .setContent(`Distance: ${distanceInKm} km`)
        .openOn(map);
}

// Geo-coding function to place markers based on address input
function geocodeAddress(address, isStartPoint = true) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                if (isStartPoint) {
                    startMarker.setLatLng([lat, lon]);
                    map.setView([lat, lon], 13);
                } else {
                    endMarker.setLatLng([lat, lon]);
                    map.setView([lat, lon], 13);
                }
                updateRoute(); // Update the route after moving the marker
            } else {
                alert("Address not found!");
            }
        })
        .catch(error => console.error("Error during geocoding:", error));
}

// Event listeners for the buttons
document.getElementById("set-start").addEventListener("click", () => {
    const address = document.getElementById("address-input").value;
    geocodeAddress(address, true);
});

document.getElementById("set-end").addEventListener("click", () => {
    const address = document.getElementById("address-input").value;
    geocodeAddress(address, false);
});

document.getElementById("calculate-route").addEventListener("click", updateRoute);

// Reset the map
document.getElementById("reset-map").addEventListener("click", () => {
    map.setView([51.505, -0.09], 13);
    startMarker.setLatLng([51.505, -0.09]);
    endMarker.setLatLng([51.515, -0.1]);
    if (routeLayer) map.removeLayer(routeLayer);
    petrolPumpMarkers.forEach(marker => map.removeLayer(marker));
    petrolPumpMarkers = [];
});

//Optimize Pump Route
document.getElementById("optimize-pump-route").addEventListener("click",()=>{

    //var pumpRoute=[startMarker]
    const start = startMarker.getLatLng();
    const pump = petrolPumpMarkers[0].getLatLng();
    const end = endMarker.getLatLng();
    //var polyline = L.polyline([startMarker.getLatLng(),petrolPumpMarkers[0].getLatLng(),endMarker.getLatLng()]);
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${pump.lng},${pump.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (routeLayer) map.removeLayer(routeLayer); // Remove previous route
            if (data.routes && data.routes.length > 0) {
                routeLayer = L.geoJSON(data.routes[0].geometry).addTo(map);
                map.fitBounds(routeLayer.getBounds());
                showRouteDistance(data.routes[0].distance); // Show distance of the first route
                //findNearbyPetrolPumps(routeLayer.getBounds()); // Find petrol stations along the route
            } else {
                alert("No route found!");
            }
        })
        .catch(error => console.error("Error fetching route:", error));
});


//location
function showAllPoints() {
    const url = "http://localhost:8080/geoserver/wegemappe/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=wegemappe:gas_locations&outputFormat=application/json&srsName=EPSG:4326";

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            if (!response.headers.get("content-type").includes("application/json")) {
                throw new Error("Invalid content type. Expected application/json.");
            }
            return response.json();
        })
        .then(data => {
            if (!data || !data.features) throw new Error("Invalid GeoJSON data.");

            L.geoJSON(data, {
                onEachFeature: function (feature, layer) {
                    // 使用 feature.id 来绑定弹出框内容
                    const id = feature.id || "Unnamed ID";
                    layer.bindPopup(`Gas Station ID: ${id}`);
                }
            }).addTo(map);
        })
        .catch(error => {
            console.error("Error loading GeoServer data:", error);
            alert("Failed to load GeoServer data.");
        });
}



// 初始化
updateInputFields();
showAllPoints();