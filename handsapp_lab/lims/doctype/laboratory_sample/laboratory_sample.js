// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Sample', {
    refresh: function(frm) {
        toggle_fields_based_on_sampling_status(frm);
        frm.add_custom_button('Process Laboratory Analysis', function() {
            process_lab_analysis(frm);
        }, __('Actions'));
        frm.add_custom_button('Update FC and RT', function() {
            add_data_to_field_conditions(frm);
            update_required_tests_field(frm);
        }, __('Actions'));

        check_entries(frm)
    },
    template: function(frm) {
        populate_from_template(frm);
    },
    set_session: function (frm) {
        kronos(frm);
    },
    sampling_status: function(frm) {
        toggle_fields_based_on_sampling_status(frm);
    }
});

function process_lab_analysis(frm) {
    let promises = [];

    $.each(frm.doc.sample_required_tests || [], function(i, row) {
        if (row.laboratory_analysis) {
            // Open window immediately if laboratory_analysis already exists
            window.open("/app/laboratory-analysis/" + row.laboratory_analysis, '_blank');
        } else if (row.laboratory_protocol) {
            // Create laboratory_analysis if needed
            let promise = new Promise((resolve, reject) => {
                frappe.call({
                    method: "frappe.client.insert",
                    args: {
                        doc: {
                            doctype: "Laboratory Analysis",
                            laboratory_protocol: row.laboratory_protocol,
                            sample_id: frm.doc.name,
                        },
                    },
                    callback: function(r) {
                        if (!r.exc) {
                            frappe.model.set_value(row.doctype, row.name, "laboratory_analysis", r.message.name);
                            resolve(r.message.name);
                        } else {
                            reject(r.exc);
                        }
                    }
                });
            });

            promises.push(promise);
        }
    });

    // Save the form and then open the windows if everything is okay
    Promise.all(promises).then((newAnalysisIds) => {
        frm.save().then(() => {
            // Open new windows for just created laboratory_analysis
            newAnalysisIds.forEach(id => {
                window.open("/app/laboratory-analysis/" + id, '_blank');
            });
        });
    }).catch((error) => {
        frappe.msgprint({
            title: __('Error'),
            indicator: 'red',
            message: __('Failed to create some Laboratory Analysis records: ') + error
        });
    });
}

// Function to populate fields based on the selected template
function populate_from_template(frm) {
    if (frm.doc.template) {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Laboratory Sample Template",
                name: frm.doc.template
            },
            callback: function(r) {
                if (r.message) {
                    let template = r.message;
                    frm.clear_table("field_measurements");
                    frm.clear_table("sample_required_tests");
                    frm.clear_table("results");

                    if (template.field_measurements) {
                        template.field_measurements.forEach(function(entry) {
                            let row = frm.add_child("field_measurements");
                            row.smpl_anal_parameter = entry.smpl_anal_parameter;
                            row.parameter = entry.parameter;
                            row.uom = entry.uom;
                        });
                    }

                    if (template.required_tests) {
                        template.required_tests.forEach(function(test) {
                            let row = frm.add_child("sample_required_tests");
                            row.smpl_anal_parameter = test.smpl_anal_parameter;
                            row.parameter = test.parameter;
                        });
                    }

                    if(template.results) {
                        template.results.forEach(function(aggelos){
                            let row =frm.add_child("results");
                            row.smpl_anal_parameter = aggelos.smpl_anal_parameter;
                            row.parameter = aggelos.parameter
                            row.uom = aggelos.uom
                            row.min_value = aggelos.min_value
                            row.max_value = aggelos.max_value
                            row.accredited = aggelos.accredited

                        });
                    }

                    frm.refresh_field("field_measurements");
                    frm.refresh_field("sample_required_tests");
                    frm.refresh_field("results");
                }
            }
        });
    }
}

// Function to set session data
function kronos(frm) {
    // Set the current date
    frm.set_value('date', frappe.datetime.get_today());

    // Set the current time
    frm.set_value('time', frappe.datetime.now_time());
    // Get geolocation and set in the 'map' field
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                // Add a point to the Leaflet map
                let map = frm.fields_dict.map.map;
                let geoJsonLayers = [];
                const geoJSONMarker = {
                    "type": "Point",
                    "coordinates": [lon, lat]
                };
                L.geoJSON(geoJSONMarker).addTo(map);
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
                let kronos_coords = lat +", "+ lon;
                console.log(kronos_coords);
                frm.set_value('current_location', kronos_coords);
                frappe.call({
                    type: "GET",
                    url: `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=el&lat=${lat}&lon=${lon}`,
                    callback: function(r){
                        frm.set_value('address', r.display_name);
                    }
                });
            },
            (error) => {
                frappe.msgprint({
                    title: __('Geolocation Error'),
                    indicator: 'red',
                    message: __(error.message)
                });
            }
        );
    } else {
        frappe.msgprint({
            title: __('Warning'),
            indicator: 'orange',
            message: __('Geolocation is not supported by this browser.')
        });
    }
}

function toggle_fields_based_on_sampling_status(frm) {
    const sample_toggle = [
        'description', 
        'template', 
        'sample_type',
        'batch_number',
        'laboratory_sample_location',
        'address',
        'current_location',
        'laboratory_sampling_method',
        'sampler',
        'sampler_name',
        'laboratory_equipment',
        'date',
        'time',
        'pre_treatment',
        'field_measurements'
    ];
    const transport_toggle = [
        'container_type',
        'preservation_method',
        'storage_temperature',
        'transport_conditions'
    ];
    const analysis_toggle = [
        'laboratory',
        'received_by',
        'date_of_receipt',
        'posting_date',
        'results',
        'signatures',
        'pdf_attachment'
    ];

    
    const fields_to_toggle = [
        'description', 
        'template', 
        'sample_type',
        'batch_number',
        'laboratory_sample_location',
        'address',
        'current_location',
        'laboratory_sampling_method',
        'sampler',
        'sampler_name',
        'laboratory_equipment',
        'date',
        'time',
        'pre_treatment',
        'field_measurements',
        'container_type',
        'preservation_method',
        'storage_temperature',
        'transport_conditions',
        'laboratory',
        'received_by',
        'date_of_receipt',
        'posting_date',
        'results',
        'signatures',
        'pdf_attachment'

        // ... add other fieldnames here if needed
    ];

    // You can use a switch or if-else. Here's an example with if-else:
    let status = frm.doc.sampling_status;
    switch(status){
        case 'Sampling':
            fields_to_toggle.forEach(field => {
                frm.set_df_property(field, 'read_only', true);
                frm.set_df_property(field, 'hidden', true);
            });
            sample_toggle.forEach(field => {
                frm.set_df_property(field, 'read_only', false);
                frm.set_df_property(field, 'hidden', false);
            });
            break;
        case 'to Transport':
            sample_toggle.forEach(field => {
                frm.set_df_property(field, 'read_only', true);
                frm.set_df_property(field, 'hidden', false);
            });    
            transport_toggle.forEach(field => {
                frm.set_df_property(field, 'read_only', false);
                frm.set_df_property(field, 'hidden', false);
            });
            break;
        case 'to Analyze':
            transport_toggle.forEach(field => {
                frm.set_df_property(field, 'read_only', true);
                frm.set_df_property(field, 'hidden', false);
            });
            analysis_toggle.forEach(field => {
                frm.set_df_property(field, 'read_only', false);
                frm.set_df_property(field, 'hidden', false);
            });
            break;
        case 'Analyzed':
            fields_to_toggle.forEach(field => {
                frm.set_df_property(field, 'read_only', true);
                frm.set_df_property(field, 'hidden', false);
            });
            break;
    }
}

function check_entries(frm){
    // Check if 'template' field is filled
    if (frm.doc.template) {
        // Initialize a flag to determine if any of the conditions are met
        let showAlert = false;

        // Check if 'field_measurements' child table is empty
        if (frm.doc.field_measurements.length === 0) {
            showAlert = true;
        }

        // Check if 'sample_required_tests' child table is empty
        if (frm.doc.sample_required_tests.length === 0) {
            showAlert = true;
        }

        // Check if 'results' child table is empty
        if (frm.doc.results.length === 0) {
            showAlert = true;
        }

        // Show the alert if any of the conditions are met
        if (showAlert) {
            populate_from_template(frm);
        }
    }
}

function add_data_to_field_conditions(frm) {
    let formatted_data = [];

    // Loop through the 'Sample Field Measurements' child table
    $.each(frm.doc.field_measurements, function(index, row) {
        // Construct the data string, skipping undefined or empty values
        let data_parts = [];

        if (row.parameter) {
            data_parts.push(row.parameter);
        }
        if (row.value !== undefined && row.value !== null) {
            data_parts.push(`${row.value}`);
        }
        if (row.uom) {
            data_parts.push(row.uom);
        }

        formatted_data.push(data_parts.join(': '));
    });

    // Join the formatted data with commas and append it to the 'Field Conditions' field
    let existing_data = frm.doc.field_conditions ? frm.doc.field_conditions + ", " : "";
    frm.set_value('field_conditions', existing_data + formatted_data.join(', '));

    // Refresh the form to show the updated data
    frm.refresh_field('field_conditions');
}

function update_required_tests_field(frm) {
    // Concatenate the 'parameter' values from the 'sample_required_tests' child table
    let concatenated_parameters = frm.doc.sample_required_tests.map(row => row.parameter).join(', ');

    // Update the 'req_tests' field in the parent form
    frm.set_value('req_tests', concatenated_parameters);

    // Refresh the form to show the updated data
    frm.refresh_field('req_tests');
}

