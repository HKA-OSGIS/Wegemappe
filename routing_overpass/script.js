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
let shortestDistance = []; //To store shortest distance from table request of petrol pumps

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

//function that returns column index of min column sum of distance table, then used to get min distance pump
function findMinColumnIndex(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0])) {
        throw new Error("Invalid matrix");
    }

    const numRows = matrix.length;
    const numCols = matrix[0].length;

    // Calculate the sum of each column
    const columnSums = Array(numCols).fill(0);
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            columnSums[col] += matrix[row][col];
        }
    }

    // Find the minimum value greater than 0, excluding the first two columns
    let minSum = Infinity;
    let minIndex = -1;

    for (let col = 2; col < numCols; col++) { // Start from column 2 to skip the first two columns
        if (columnSums[col] > 0 && columnSums[col] < minSum) {
            minSum = columnSums[col];
            minIndex = col;
        }
    }

    return minIndex; // Return the index of the column, or -1 if no valid column is found
}


//Table request for getting shortest distance pump
document.getElementById("optimize-pump-route").addEventListener("click", () => {
//function shortestDistancePump(startMarker,endMarker,petrolPumpMarkers){
    const start = startMarker.getLatLng();
    const end = endMarker.getLatLng();
    var pump = new Object;

    var arrayline = [];
    arrayline.push(start);
    arrayline.push(end);
    for (let i=0;i<petrolPumpMarkers.length;i++){
        arrayline.push(petrolPumpMarkers[i].getLatLng());     
    };

    var str = new String("");
    for (let i=0;i<arrayline.length;i++){
        str += String(arrayline[i].lng)+","+String(arrayline[i].lat)+";"; 
    };
    str = str.slice(0,-1);
    
    const distanceTable = `https://router.project-osrm.org/table/v1/driving/${str}?sources=0;1&annotations=distance`;

    

    fetch(distanceTable)
        .then(response => response.json())
        .then(data => {
            console.log(data.distances);
            const index = findMinColumnIndex(data.distances);
            
            console.log(index);
            pump = data.destinations[index].location
            console.log(pump);
            

            const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${pump[0]},${pump[1]};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    

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
            
        }); //distance table end

       
    

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