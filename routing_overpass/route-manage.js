// Find nearby petrol pumps along the route using Overpass API
function findNearbyPetrolPumps(bounds, around=5000) {
    // Clear existing markers
    petrolPumpMarkers.forEach(marker => map.removeLayer(marker));
    petrolPumpMarkers = [];

    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="fuel"](around:${around},${(sw.lat + ne.lat) / 2},${(sw.lng + ne.lng) / 2}););out;`;

    return fetch(overpassUrl)
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
                    //marker.bindPopup(`Petrol Pump: ${pump.tags.name || 'Unknown'}`).openPopup();
                    petrolPumpMarkers.push(marker);
                    
                    //console.log(data.elements);
                    //console.log(data.elements[0]);
                    //console.log(data.elements.length);
                });
                console.log(data);
            } else {
                alert("No petrol pumps found nearby.");
            }
        })
        .catch(error => console.error("Error fetching petrol pumps:", error));
}



