The data was collected in overpass-turbo.eu using the following query:
[out:csv(::id, name, brand, operator, "addr:street", "addr:housenumber", "addr:postcode", "addr:city", ::lat, ::lon)];
area["name"="Baden-Württemberg"]->.searchArea;
node["amenity"="fuel"](area.searchArea);
out;



Steps to Execute

Open Overpass Turbo:

Go to Overpass Turbo.

Paste the Query:

Copy and paste the query into the editor.

Run the Query:

Click the blue "Run" button.

Export Results:

Click "Export" and choose one of the following formats:

CSV (viewable in Excel).

GeoJSON, JSON, GPX, or KML.

Open in Your Tool:

For CSV, open in Excel to view the gas station details and coordinates.

For other formats, use compatible GIS tools or mapping applications.

That produced a csv, and then it was converted to geojson.
