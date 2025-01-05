// Find nearby petrol pumps along the route using Overpass API
function findNearbyPetrolPumps(bounds) {
    // Clear existing markers
    petrolPumpMarkers.forEach(marker => map.removeLayer(marker));
    petrolPumpMarkers = [];

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="fuel"](around:3000,${(sw.lat + ne.lat) / 2},${(sw.lng + ne.lng) / 2}););out;`;

    fetch(overpassUrl)
        .then(response => response.json())
        .then(data => {
            if (data && data.elements.length > 0) {
                data.elements.forEach(pump => {
                    const lat = pump.lat;
                    const lon = pump.lon;
                    const marker = L.marker([lat, lon], {
                        icon: L.icon({
                            iconUrl: 'fuel-icon.png', // Path to your fuel icon image
                            iconSize: [32, 32],
                        })
                    }).addTo(map);
                    marker.bindPopup(`Petrol Pump: ${pump.tags.name || 'Unknown'}`).openPopup();
                    petrolPumpMarkers.push(marker);
                    


                });
            } else {
                alert("No petrol pumps found nearby.");
            }
        })
        .catch(error => console.error("Error fetching petrol pumps:", error));
}



