


// Initialize the map and set the view to default starting point
const map = L.map('map').setView([51.505, -0.09], 13); // Initial view centered at some default point
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Initialize draggable markers for start and end points
let startMarker = L.marker([51.505, -0.09], { draggable: true }).addTo(map).bindPopup('Start Point').openPopup();
let endMarker = L.marker([51.515, -0.1], { draggable: true }).addTo(map).bindPopup('End Point').openPopup();

let routeLayer = null; // Variable to hold the drawn route
let distanceDialog = null; // To store distance dialog

// Function to update the route between start and end points
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
            } else {
                alert("No route found!");
            }
        })
        .catch(error => console.error("Error fetching route:", error));
}

// Function to show route distance (in km) in a popup
function showRouteDistance(distance) {
    const distanceInKm = (distance / 1000).toFixed(2); // Convert to km
    distanceDialog = L.popup()
        .setLatLng(routeLayer.getBounds().getCenter())
        .setContent(`Distance: ${distanceInKm} km`)
        .openOn(map);
}

// Function to geocode an address and place the respective marker (start or end)
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
                updateRoute(); // Update route after moving marker
            } else {
                alert("Address not found!");
            }
        })
        .catch(error => console.error("Error during geocoding:", error));
}

// Dragging event listeners to update the route on drag end
startMarker.on('dragend', () => {
    updateRoute();
    reverseGeocode(startMarker.getLatLng().lat, startMarker.getLatLng().lng, (address) => {
        document.getElementById("startAddress").value = address;
    });
});

endMarker.on('dragend', () => {
    updateRoute();
    reverseGeocode(endMarker.getLatLng().lat, endMarker.getLatLng().lng, (address) => {
        document.getElementById("endAddress").value = address;
    });
});

// Function to reverse geocode (coordinates to address)
function reverseGeocode(lat, lon, callback) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.address) {
                const address = `${data.address.road || ""}, ${data.address.city || ""}, ${data.address.country || ""}`;
                callback(address.trim().replace(/^,|,$/, ''));
            } else {
                alert("Address not found!");
            }
        })
        .catch(error => console.error("Error during reverse geocoding:", error));
}

// Event listener for setting start point (using geocoding from input field)
document.getElementById("set-start").addEventListener("click", () => {
    const address = document.getElementById("address-input").value;
    geocodeAddress(address, true);
});

// Event listener for setting end point (using geocoding from input field)
document.getElementById("set-end").addEventListener("click", () => {
    const address = document.getElementById("address-input").value;
    geocodeAddress(address, false);
});

// Function to show multiple routes between start and end points
function showMultipleRoutes() {
    clearRoutes(); // Clear existing routes before displaying new ones

    const start = startMarker.getLatLng();
    const end = endMarker.getLatLng();

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson&alternatives=true`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                data.routes.forEach((route, index) => {
                    L.geoJSON(route.geometry).addTo(map);
                    if (index === 0) {
                        routeLayer = L.geoJSON(route.geometry).addTo(map);
                    }
                });
                map.fitBounds(routeLayer.getBounds());
                showRouteDistance(data.routes[0].distance); // Display the distance for the first route
            } else {
                alert("No routes found!");
            }
        })
        .catch(error => {
            console.error("Error fetching multiple routes:", error);
        });
}

// Show distance when route is selected
function showRouteDistance(distance) {
    if (distanceDialog) {
        map.removeLayer(distanceDialog); // Remove previous distance dialog
    }

    const distanceInKm = (distance / 1000).toFixed(2); // Convert to km
    distanceDialog = L.popup()
        .setLatLng(routeLayer.getBounds().getCenter())
        .setContent(`Distance: ${distanceInKm} km`)
        .openOn(map);
}

// Event listener for showing multiple routes
document.getElementById("show-multiple-routes").addEventListener("click", () => {
    showMultipleRoutes();
});

// Function to clear all existing routes and reset markers
function clearRoutes() {
    if (routeLayer) {
        map.removeLayer(routeLayer); // Remove the previous route
        routeLayer = null;
    }
    if (distanceDialog) {
        map.removeLayer(distanceDialog); // Remove the distance dialog
        distanceDialog = null;
    }
}
