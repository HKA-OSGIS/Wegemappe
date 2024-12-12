// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13);

// Add a tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Initialize markers with draggable option
let startMarker = L.marker([51.505, -0.09], { draggable: true }).addTo(map).bindPopup('Start Point').openPopup();
let endMarker = L.marker([51.515, -0.1], { draggable: true }).addTo(map).bindPopup('End Point').openPopup();

// Function to update input fields when markers are moved
function updateInputFields() {
    // Start Point
    document.getElementById("startLat").value = startMarker.getLatLng().lat.toFixed(6);
    document.getElementById("startLng").value = startMarker.getLatLng().lng.toFixed(6);

    // End Point
    document.getElementById("endLat").value = endMarker.getLatLng().lat.toFixed(6);
    document.getElementById("endLng").value = endMarker.getLatLng().lng.toFixed(6);
}

// Listen for the 'dragend' event on both markers
startMarker.on('dragend', updateInputFields);
endMarker.on('dragend', updateInputFields);

// Function to update markers when text box values change
function updateMarkersFromInput() {
    const startLat = parseFloat(document.getElementById("startLat").value);
    const startLng = parseFloat(document.getElementById("startLng").value);
    const endLat = parseFloat(document.getElementById("endLat").value);
    const endLng = parseFloat(document.getElementById("endLng").value);

    // Validate coordinates before updating
    if (!isNaN(startLat) && !isNaN(startLng)) {
        const startLatLng = L.latLng(startLat, startLng);
        startMarker.setLatLng(startLatLng).bindPopup('Start Point').openPopup();
        map.setView(startLatLng, 13); // Optionally center map on the start marker
    }

    if (!isNaN(endLat) && !isNaN(endLng)) {
        const endLatLng = L.latLng(endLat, endLng);
        endMarker.setLatLng(endLatLng).bindPopup('End Point').openPopup();
    }
}

// Event listeners for input fields
document.getElementById("startLat").addEventListener("change", updateMarkersFromInput);
document.getElementById("startLng").addEventListener("change", updateMarkersFromInput);
document.getElementById("endLat").addEventListener("change", updateMarkersFromInput);
document.getElementById("endLng").addEventListener("change", updateMarkersFromInput);

// Initial update of input fields
updateInputFields();