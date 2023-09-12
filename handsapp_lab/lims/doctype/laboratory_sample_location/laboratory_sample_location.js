// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Sample Location', {
    
    get_coords: function(frm) {
        if (!frm.doc.location_id) {
            frappe.msgprint("Please enter the Location ID before getting coordinates.");
            return;
        }
        console.log("Getting coordinates");
        captureMapElements(frm);
        frm.save();
    },
    create_map: function(frm) {
        console.log("Placing GeoJson Data");
        createMapElements(frm);
    },
    map: function(frm){
        //console.log(JSON.parse(cur_frm.doc.map).features[0]);
        let mapdata = JSON.parse(cur_frm.doc.map).features[0];
        //console.log(mapdata);
        if(mapdata && mapdata.geometry.type=='Point'){
            let lat = mapdata.geometry.coordinates[1];
            let lon = mapdata.geometry.coordinates[0];
            //console.log("Hooray");
            //let supa = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
            //console.log(supa);
            frappe.call({
                type: "GET",
                url: `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=el&lat=${lat}&lon=${lon}`,
                callback: function(r){
                    //console.log(r);
                    frm.set_value('address_text', r.display_name);
                    let coords = JSON.stringify(r.lat) +","+ JSON.stringify(r.lon);
                    //console.log(coords);
                    frm.set_value('current_location', coords);
                }
            });
            
            
        }
    }
});

function waitForMapLoad(frm, callback) {
    if (frm.fields_dict.map.map) {
        callback(frm.fields_dict.map.map);
    } else {
        setTimeout(() => waitForMapLoad(frm, callback), 500);
    }
}
function captureMapElements(frm) {
    waitForMapLoad(frm, function(map) {
        // Traverse the layers of the map
        map.eachLayer(function(layer) {
            let data;

            if (layer instanceof L.Marker) {  // Check if the layer is a marker
                let coordinates = layer.getLatLng();
                data = {
                    "location_id": frm.doc.location_id,
                    "coordinates": [coordinates.lng, coordinates.lat]
                };
                frm.set_value('marker', JSON.stringify(data));

            } else if (layer instanceof L.Polygon) {  // Check if the layer is a polygon
                let coordinates = layer.getLatLngs()[0].map(latlng => [latlng.lng, latlng.lat]);
                data = {
                    "location_id": frm.doc.location_id,
                    "coordinates": coordinates
                };
                frm.set_value('polygon', JSON.stringify(data));

            } else if (layer instanceof L.Polyline && !(layer instanceof L.Polygon)) {  // Check if the layer is a polyline but not polygon
                let coordinates = layer.getLatLngs().map(latlng => [latlng.lng, latlng.lat]);
                data = {
                    "location_id": frm.doc.location_id,
                    "coordinates": coordinates
                };
                frm.set_value('polyline', JSON.stringify(data));
            }
        });
    });
}

function createMapElements(frm) {
    let map = frm.fields_dict.map.map;
    let geoJsonLayers = [];

    // For markers
    if (frm.doc.marker) {
        let geoJSONMarker = {
            "type": "Point",
            "coordinates": JSON.parse(frm.doc.marker).coordinates
        };
        L.geoJSON(geoJSONMarker).addTo(map);
    }

    // For polygons
    if (frm.doc.polygon) {
        let geoJSONPolygon = {
            "type": "Polygon",
            "coordinates": [JSON.parse(frm.doc.polygon).coordinates]
        };
        L.geoJSON(geoJSONPolygon).addTo(map);
    }

    // For polylines
    if (frm.doc.polyline) {
        let geoJSONLine = {
            "type": "LineString",
            "coordinates": JSON.parse(frm.doc.polyline).coordinates
        };
        L.geoJSON(geoJSONLine).addTo(map);
    }
    
    map.eachLayer(function(layer) {
        if (layer.toGeoJSON) {  // Check if the layer can be converted to GeoJSON
            geoJsonLayers.push(layer.toGeoJSON());
        }
    });
    let featureCollection = {
        "type": "FeatureCollection",
        "features": geoJsonLayers
    };
    frm.set_value('map', JSON.stringify(featureCollection));


}